"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useReducer, useState } from "react";
import { CrosswordGrid } from "./CrosswordGrid";
import { JourneyBackdrop } from "./JourneyBackdrop";
import { LetterWheel } from "./LetterWheel";
import { CoinsChip } from "./CoinsChip";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  BulbIcon,
  SparkIcon,
  TargetIcon,
} from "../icons";
import {
  initJourneyState,
  journeyReducer,
  filledCells,
  type JourneyState,
} from "@/lib/journey/reducer";
import { wordCells } from "@/lib/journey/layout";
import { HINT_COST, TARGET_HINT_COST } from "@/lib/journey/economy";
import {
  loadLocal,
  saveLocal,
  trackProgress,
  emptyTrackProgress,
} from "@/lib/journey/progress";
import { fireConfetti, vibrate } from "@/lib/celebrate";
import { sfx } from "@/lib/sound";
import { trackEvent } from "@/lib/track-event";
import type { ChapterTheme, JourneyLevel } from "@/lib/journey/types";

const FEEDBACK_LABEL: Record<string, (word: string) => string> = {
  bonus: (w) => `Bonus! ${w.toUpperCase()} +5`,
  dupe: () => "Already found",
  invalid: () => "Not a word here",
  too_short: () => "Too short",
};

interface CompletionInfo {
  coinsEarned: number;
  bonusFound: number;
  hintsUsed: number;
  chapterDone: boolean;
}

export function JourneyGame({
  track,
  trackName,
  levels,
  chapterIndex,
  chapterStartGlobal,
  startLevelInChapter,
  nextChapterFirstGlobal,
  theme,
}: {
  track: string;
  trackName: string;
  levels: JourneyLevel[];
  chapterIndex: number;
  chapterStartGlobal: number; // global number of this chapter's level 1
  startLevelInChapter: number; // 1-based
  nextChapterFirstGlobal: number | null;
  theme: ChapterTheme;
}) {
  const [levelIdx, setLevelIdx] = useState(startLevelInChapter - 1);
  const [coins, setCoins] = useState(0);

  useEffect(() => {
    // client-only wallet hydration from localStorage
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCoins(loadLocal().coins);
    try {
      localStorage.setItem("mw:journeyTrack", track);
    } catch {}
  }, [track]);

  // keep the URL in sync with client-side level advances within the chapter
  useEffect(() => {
    const global = chapterStartGlobal + levelIdx;
    window.history.replaceState(null, "", `/journey/${track}/${global}`);
  }, [levelIdx, chapterStartGlobal, track]);

  const globalLevel = chapterStartGlobal + levelIdx;

  const persistCompletion = useCallback(
    (info: CompletionInfo) => {
      const local = loadLocal();
      const tp = trackProgress(local, track) ?? emptyTrackProgress();
      if (globalLevel <= tp.levelsCompleted) return; // replay: nothing to award
      local.tracks[track] = {
        levelsCompleted: globalLevel,
        bonusFound: tp.bonusFound + info.bonusFound,
        chaptersCompleted: info.chapterDone ? chapterIndex : tp.chaptersCompleted,
        hintsUsed: tp.hintsUsed + info.hintsUsed,
      };
      local.coins += info.coinsEarned;
      local.lifetimeCoins += info.coinsEarned;
      saveLocal(local);
      setCoins(local.coins);
      // Fire-and-forget server ledger sync; the server clamps and, when the
      // response lands, its wallet is authoritative.
      fetch("/api/journey/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          track,
          level: globalLevel,
          bonusFound: info.bonusFound,
          hintsUsed: info.hintsUsed,
        }),
      })
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => {
          if (d && typeof d.coins === "number") {
            const fresh = loadLocal();
            fresh.coins = d.coins;
            saveLocal(fresh);
            setCoins(d.coins);
          }
        })
        .catch(() => {});
    },
    [track, globalLevel, chapterIndex],
  );

  const spendCoins = useCallback(
    (cost: number): boolean => {
      const local = loadLocal();
      if (local.coins < cost) return false;
      local.coins -= cost;
      saveLocal(local);
      setCoins(local.coins);
      fetch("/api/journey/hint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: cost === HINT_COST ? "hint" : "target" }),
      }).catch(() => {});
      return true;
    },
    [],
  );

  const level = levels[levelIdx];
  const isLastInChapter = levelIdx === levels.length - 1;

  return (
    <>
      <JourneyBackdrop theme={theme} />
      <LevelPlay
        key={level.id}
        level={level}
        isLastInChapter={isLastInChapter}
        chapterName={theme.name}
        accent={theme.palette.accent}
        levelLabel={`Level ${globalLevel}`}
        track={track}
        trackName={trackName}
        liveCoins={(earned) => coins + earned}
        onSpend={spendCoins}
        onComplete={persistCompletion}
        onNext={() => setLevelIdx((i) => i + 1)}
        hasNextLevel={!isLastInChapter}
        nextChapterFirstGlobal={nextChapterFirstGlobal}
      />
    </>
  );
}

function LevelPlay({
  level,
  isLastInChapter,
  chapterName,
  accent,
  levelLabel,
  track,
  trackName,
  liveCoins,
  onSpend,
  onComplete,
  onNext,
  hasNextLevel,
  nextChapterFirstGlobal,
}: {
  level: JourneyLevel;
  isLastInChapter: boolean;
  chapterName: string;
  accent: string;
  levelLabel: string;
  track: string;
  trackName: string;
  liveCoins: (earned: number) => number;
  onSpend: (cost: number) => boolean;
  onComplete: (info: CompletionInfo) => void;
  onNext: () => void;
  hasNextLevel: boolean;
  nextChapterFirstGlobal: number | null;
}) {
  const router = useRouter();
  const [state, dispatch] = useReducer(
    journeyReducer,
    undefined,
    () => initJourneyState(level, isLastInChapter),
  );
  const [targetMode, setTargetMode] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const done = state.status !== "playing";

  useEffect(() => {
    trackEvent("journey_level_start", track, { level: level.id });
  }, [level.id, track]);

  // feedback -> transient toast + haptics
  useEffect(() => {
    if (!state.feedback) return;
    const { kind, word } = state.feedback;
    if (kind === "grid") {
      vibrate([10, 40, 20]);
      sfx.correct();
      return;
    }
    if (kind === "bonus") {
      vibrate([10, 30, 10]);
      sfx.bonus();
      sfx.coin();
      trackEvent("journey_bonus_word", track, { level: level.id });
    }
    if (kind === "invalid") {
      vibrate([12, 40, 12]);
      sfx.invalid();
    }
    // reducer feedback -> transient toast; cleared by the timeout below
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setToast(FEEDBACK_LABEL[kind]?.(word) ?? null);
    const t = setTimeout(() => {
      setToast(null);
      dispatch({ type: "clear_feedback" });
    }, 1400);
    return () => clearTimeout(t);
  }, [state.feedback, level.id, track]);

  // completion side-effects, exactly once per level (guarded by `done`)
  useEffect(() => {
    if (!done) return;
    void fireConfetti(state.status === "chapter_done");
    vibrate([15, 60, 15, 60, 30]);
    if (state.status === "chapter_done") sfx.unlock();
    else sfx.complete();
    trackEvent(
      state.status === "chapter_done"
        ? "journey_chapter_complete"
        : "journey_level_complete",
      track,
      {
        level: level.id,
        hints: state.hintsUsed,
        bonus: state.foundBonus.length,
      },
    );
    onComplete({
      coinsEarned: state.coinsEarned,
      bonusFound: state.foundBonus.length,
      hintsUsed: state.hintsUsed,
      chapterDone: state.status === "chapter_done",
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done]);

  // physical keyboard entry (the accessibility path for the wheel)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.key === "Enter") dispatch({ type: "key_submit" });
      else if (e.key === "Backspace") dispatch({ type: "key_backspace" });
      else if (e.key === "Escape") dispatch({ type: "key_clear" });
      else if (/^[a-z]$/.test(e.key.toLowerCase())) {
        sfx.click();
        dispatch({ type: "key_letter", letter: e.key.toLowerCase() });
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const selectionWord = state.selection
    .map((i) => level.wheel[i])
    .join("")
    .toUpperCase();

  const randomHint = () => {
    const filled = filledCells(state);
    const candidates: string[] = [];
    for (const p of level.words) {
      if (state.foundWords.includes(p.word)) continue;
      for (const c of wordCells(p)) if (!filled.has(c)) candidates.push(c);
    }
    if (candidates.length === 0) return;
    if (!onSpend(HINT_COST)) {
      setToast("Not enough coins — find bonus words!");
      sfx.invalid();
      return;
    }
    sfx.spend();
    trackEvent("journey_hint", track, { level: level.id, type: "random" });
    const cell = candidates[Math.floor(Math.random() * candidates.length)];
    dispatch({ type: "hint", cell });
  };

  const targetHint = (cell: string) => {
    setTargetMode(false);
    if (!onSpend(TARGET_HINT_COST)) {
      setToast("Not enough coins — find bonus words!");
      sfx.invalid();
      return;
    }
    sfx.spend();
    trackEvent("journey_hint", track, { level: level.id, type: "target" });
    dispatch({ type: "hint", cell });
  };

  const shuffle = () => {
    const order = [...state.wheelOrder];
    for (let i = order.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [order[i], order[j]] = [order[j], order[i]];
    }
    dispatch({ type: "shuffle", order });
  };

  const bonusCount = state.foundBonus.length;

  return (
    <div className="flex flex-1 flex-col pb-3">
      <div className="flex items-center justify-between py-1">
        <Link
          href={`/journey/${track}`}
          aria-label="Back to journey map"
          className="flex h-9 w-9 items-center justify-center rounded-full text-muted transition-colors hover:bg-raised hover:text-foreground"
        >
          <ArrowLeftIcon className="h-5 w-5" />
        </Link>
        <div className="text-center">
          <p className="font-display text-sm font-semibold" style={{ color: accent }}>
            {chapterName}
          </p>
          <p className="text-xs text-muted">
            {trackName} · {levelLabel}
          </p>
        </div>
        <CoinsChip coins={liveCoins(state.coinsEarned)} />
      </div>

      <div className="flex flex-1 flex-col items-center justify-evenly gap-3">
        <CrosswordGrid
          level={level}
          foundWords={state.foundWords}
          revealedCells={state.revealedCells}
          lastFound={state.lastFound}
          targetMode={targetMode}
          onCellTap={targetHint}
        />

        <div className="flex h-9 items-center justify-center">
          {toast ? (
            <span className="animate-rise rounded-full bg-raised px-4 py-1.5 text-sm font-semibold text-gold">
              {toast}
            </span>
          ) : selectionWord ? (
            <span className="rounded-full bg-brand px-5 py-1.5 font-display text-lg font-semibold tracking-wider text-[#0b1210]">
              {selectionWord}
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-sm text-muted">
              <SparkIcon className={`h-4 w-4 text-gold ${bonusCount ? "animate-burst" : ""}`} />
              {bonusCount} bonus {bonusCount === 1 ? "word" : "words"} found
            </span>
          )}
        </div>

        {!done && (
          <div className="flex w-full max-w-xs items-center justify-between px-2">
            <button
              type="button"
              onClick={randomHint}
              className="flex cursor-pointer items-center gap-1.5 rounded-full bg-raised px-3.5 py-2 text-sm font-semibold text-gold transition-transform active:scale-95"
            >
              <BulbIcon className="h-4 w-4" />
              {HINT_COST}
            </button>
            <button
              type="button"
              onClick={() => setTargetMode((t) => !t)}
              className={`flex cursor-pointer items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-semibold transition-transform active:scale-95 ${
                targetMode ? "bg-gold text-[#0b1210]" : "bg-raised text-gold"
              }`}
            >
              <TargetIcon className="h-4 w-4" />
              {TARGET_HINT_COST}
            </button>
          </div>
        )}

        {!done ? (
          <LetterWheel
            wheel={level.wheel}
            order={state.wheelOrder}
            selection={state.selection}
            tracing={state.tracing}
            disabled={done}
            onTraceStart={(i) => {
              sfx.click(0);
              dispatch({ type: "trace_start", index: i });
            }}
            onTraceEnter={(i) => {
              if (!state.selection.includes(i)) sfx.click(state.selection.length);
              dispatch({ type: "trace_enter", index: i });
            }}
            onTraceEnd={() => dispatch({ type: "trace_end" })}
            onTraceCancel={() => dispatch({ type: "trace_cancel" })}
            onShuffle={shuffle}
          />
        ) : (
          <CompleteCard
            state={state}
            accent={accent}
            chapterName={chapterName}
            onNextLevel={hasNextLevel ? onNext : null}
            onNextChapter={
              state.status === "chapter_done" && nextChapterFirstGlobal
                ? () => router.push(`/journey/${track}/${nextChapterFirstGlobal}`)
                : null
            }
            mapHref={`/journey/${track}`}
          />
        )}
      </div>

      {targetMode && !done && (
        <p className="pb-1 text-center text-xs text-gold">
          Tap any empty square to reveal it ({TARGET_HINT_COST} coins)
        </p>
      )}
    </div>
  );
}

function CompleteCard({
  state,
  accent,
  chapterName,
  onNextLevel,
  onNextChapter,
  mapHref,
}: {
  state: JourneyState;
  accent: string;
  chapterName: string;
  onNextLevel: (() => void) | null;
  onNextChapter: (() => void) | null;
  mapHref: string;
}) {
  const chapterDone = state.status === "chapter_done";
  return (
    <div className="animate-rise w-full max-w-sm rounded-2xl border border-edge bg-surface/95 p-5 text-center shadow-2xl shadow-black/50">
      <p className="font-display text-2xl font-bold">
        {chapterDone ? (
          <>
            <span style={{ color: accent }}>{chapterName}</span> complete!
          </>
        ) : (
          "Level cleared!"
        )}
      </p>
      <p className="mt-1 text-sm text-muted">
        +{state.coinsEarned} coins
        {state.foundBonus.length > 0 &&
          ` · ${state.foundBonus.length} bonus ${
            state.foundBonus.length === 1 ? "word" : "words"
          }`}
      </p>
      <div className="mt-4 flex flex-col gap-2">
        {onNextChapter ? (
          <button
            type="button"
            onClick={onNextChapter}
            className="animate-glow flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-brand px-4 py-3 font-display text-lg font-semibold text-[#0b1210] transition-transform active:scale-[0.98]"
          >
            Next chapter <ArrowRightIcon className="h-5 w-5" />
          </button>
        ) : onNextLevel ? (
          <button
            type="button"
            onClick={onNextLevel}
            className="animate-glow flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-brand px-4 py-3 font-display text-lg font-semibold text-[#0b1210] transition-transform active:scale-[0.98]"
          >
            Next level <ArrowRightIcon className="h-5 w-5" />
          </button>
        ) : (
          <p className="text-sm font-semibold text-gold">
            You&apos;ve cleared every level — more chapters coming soon!
          </p>
        )}
        <Link
          href={mapHref}
          className="cursor-pointer py-1 text-sm text-muted underline transition-colors hover:text-foreground"
        >
          Back to the map
        </Link>
      </div>
    </div>
  );
}
