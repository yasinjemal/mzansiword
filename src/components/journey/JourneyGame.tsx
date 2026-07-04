"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react";
import { CrosswordGrid } from "./CrosswordGrid";
import { JourneyBackdrop } from "./JourneyBackdrop";
import { LetterWheel } from "./LetterWheel";
import { CoinsChip } from "./CoinsChip";
import { MzansiMoment } from "./MzansiMoment";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  BulbIcon,
  FlameIcon,
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
import { momentForLevel, type Moment } from "@/lib/journey/moments";
import {
  loadLocal,
  saveLocal,
  trackProgress,
  emptyTrackProgress,
} from "@/lib/journey/progress";
import { fireConfetti, vibrate } from "@/lib/celebrate";
import { coinsTarget, fx, rectCenter } from "@/lib/fx";
import { springEnter } from "@/lib/spring";
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

  // Mzansi Moment interstitial: intercepts "next" every MOMENT_EVERY levels
  const [moment, setMoment] = useState<{ m: Moment; cont: () => void } | null>(
    null,
  );
  const withMoment = useCallback(
    (cont: () => void) => {
      const m = momentForLevel(globalLevel);
      if (m) {
        trackEvent("journey_moment", track, { id: m.id, level: globalLevel });
        setMoment({ m, cont });
      } else {
        cont();
      }
    },
    [globalLevel, track],
  );

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
        withMoment={withMoment}
      />
      {moment && (
        <MzansiMoment
          moment={moment.m}
          onDismiss={() => {
            const cont = moment.cont;
            setMoment(null);
            cont();
          }}
        />
      )}
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
  withMoment,
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
  withMoment: (cont: () => void) => void;
}) {
  const router = useRouter();
  const [state, dispatch] = useReducer(
    journeyReducer,
    undefined,
    () => initJourneyState(level, isLastInChapter),
  );
  const [targetMode, setTargetMode] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [nudge, setNudge] = useState<0 | 1 | 2>(0); // 0 fine, 1 pulse cells, 2 suggest hint
  const gridWrapRef = useRef<HTMLDivElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);
  const hintNudgedRef = useRef(false);
  const done = state.status !== "playing";
  const foundCount = state.foundWords.length;

  useEffect(() => {
    trackEvent("journey_level_start", track, { level: level.id });
  }, [level.id, track]);

  // feedback -> transient toast + haptics + celebration FX
  useEffect(() => {
    if (!state.feedback) return;
    const { kind, word } = state.feedback;
    let label: string | null = FEEDBACK_LABEL[kind]?.(word) ?? null;
    if (kind === "grid") {
      vibrate([10, 40, 20]);
      sfx.correct(state.combo);
      // spark micro-burst on each letter as it pops into the grid
      const placed = level.words.find((p) => p.word === word);
      if (placed && gridWrapRef.current) {
        wordCells(placed).forEach((cell, i) => {
          const pos = rectCenter(
            gridWrapRef.current!.querySelector(`[data-cell="${cell}"]`),
          );
          if (pos) setTimeout(() => fx.pop(pos.x, pos.y), i * 70);
        });
      }
      label = state.combo >= 2 ? `×${state.combo} combo!` : null;
    }
    if (kind === "bonus") {
      vibrate([10, 30, 10]);
      sfx.bonus();
      sfx.coin();
      trackEvent("journey_bonus_word", track, { level: level.id });
      fx.flash();
      const from = rectCenter(statusRef.current);
      if (from) {
        fx.floatText(from.x, from.y - 8, "+5");
        fx.sparkleBurst(from.x, from.y, {
          count: 12 + Math.min(state.combo, 4) * 4,
          speed: 180,
        });
        const to = coinsTarget();
        if (to) fx.coinBurstTo(from.x, from.y, to, 6 + Math.min(state.combo, 4));
      }
      if (state.combo >= 2) label = `${label} · ×${state.combo}`;
    }
    if (kind === "invalid") {
      vibrate([12, 40, 12]);
      sfx.invalid();
    }
    // reducer feedback -> transient toast; cleared by the timeout below
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setToast(label);
    const t = setTimeout(() => {
      setToast(null);
      dispatch({ type: "clear_feedback" });
    }, 1400);
    return () => clearTimeout(t);
  }, [state.feedback, state.combo, level, track]);

  // stuck detection: quiet nudges only after real inactivity, reset on progress
  useEffect(() => {
    if (done) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setNudge(0);
    const t1 = setTimeout(() => setNudge(1), 30_000);
    const t2 = setTimeout(() => setNudge(2), 60_000);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [foundCount, done]);

  useEffect(() => {
    if (nudge !== 2 || hintNudgedRef.current) return;
    hintNudgedRef.current = true;
    setToast("Stuck? A hint reveals a letter");
    const t = setTimeout(() => setToast(null), 2600);
    return () => clearTimeout(t);
  }, [nudge]);

  // after 30s, the shortest unfound word's empty cells shimmer
  const nudgeCells = useMemo(() => {
    if (nudge === 0 || done) return null;
    const unfound = level.words
      .filter((p) => !state.foundWords.includes(p.word))
      .sort((a, b) => a.word.length - b.word.length);
    if (unfound.length === 0) return null;
    const filled = filledCells(state);
    return new Set(wordCells(unfound[0]).filter((c) => !filled.has(c)));
  }, [nudge, done, level, state]);

  // completion side-effects, exactly once per level (guarded by `done`)
  useEffect(() => {
    if (!done) return;
    void fireConfetti(state.status === "chapter_done");
    const c = rectCenter(gridWrapRef.current);
    if (c) {
      const chapter = state.status === "chapter_done";
      fx.shockwave(c.x, c.y, undefined, chapter ? 150 : 110);
      fx.sparkleBurst(c.x, c.y, { count: chapter ? 44 : 28, speed: 300 });
    }
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
        <div ref={gridWrapRef} className="w-full">
          <CrosswordGrid
            level={level}
            foundWords={state.foundWords}
            revealedCells={state.revealedCells}
            lastFound={state.lastFound}
            targetMode={targetMode}
            nudgeCells={nudgeCells}
            onCellTap={targetHint}
          />
        </div>

        <div ref={statusRef} className="flex h-9 items-center justify-center">
          {toast ? (
            <span className="chip-glass animate-rise rounded-full px-4 py-1.5 text-sm font-semibold text-gold">
              {toast}
            </span>
          ) : selectionWord ? (
            <span className="btn-gold animate-spring-in rounded-full px-5 py-1.5 font-display text-lg font-bold tracking-wider">
              {selectionWord}
            </span>
          ) : (
            <span className="flex items-center gap-2.5 text-sm text-muted">
              <span className="font-semibold text-foreground/80">
                {foundCount}/{level.words.length} words
              </span>
              {bonusCount > 0 && (
                <span className="flex items-center gap-1">
                  <SparkIcon className="h-4 w-4 text-gold" />
                  {bonusCount} bonus
                </span>
              )}
              {state.combo >= 2 && (
                <span className="flex items-center gap-1 rounded-full bg-terracotta/15 px-2 py-0.5 font-bold text-terracotta">
                  <FlameIcon className="h-3.5 w-3.5 animate-flame" />×{state.combo}
                </span>
              )}
            </span>
          )}
        </div>

        {!done && (
          <div className="flex w-full max-w-xs items-center justify-between px-2">
            <button
              type="button"
              onClick={randomHint}
              className={`chip-glass press-spring flex cursor-pointer items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-semibold text-gold ${
                nudge === 2 ? "animate-glow-gold" : ""
              }`}
            >
              <BulbIcon className="h-4 w-4" />
              {HINT_COST}
            </button>
            <button
              type="button"
              onClick={() => setTargetMode((t) => !t)}
              className={`flex cursor-pointer items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-semibold ${
                targetMode ? "btn-gold" : "chip-glass press-spring text-gold"
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
              if (!state.selection.includes(i)) {
                sfx.click(state.selection.length);
                vibrate(8); // subtle tick as the trace catches a letter
              }
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
            onNextLevel={hasNextLevel ? () => withMoment(onNext) : null}
            onNextChapter={
              state.status === "chapter_done" && nextChapterFirstGlobal
                ? () =>
                    withMoment(() =>
                      router.push(`/journey/${track}/${nextChapterFirstGlobal}`),
                    )
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
  const cardRef = useRef<HTMLDivElement>(null);
  // spring entrance (GAME-FEEL.md #4); layout effect so the un-sprung frame
  // never paints
  useLayoutEffect(() => {
    if (cardRef.current) springEnter(cardRef.current, 22);
  }, []);
  return (
    <div
      ref={cardRef}
      className="relative w-full max-w-sm overflow-hidden rounded-2xl border border-white/10 bg-surface/95 p-5 pt-6 text-center shadow-2xl shadow-black/60"
    >
      <div className="pattern-band absolute inset-x-0 top-0" />
      <div className="sunburst pointer-events-none absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 -translate-y-1/3" />
      <p className="relative font-display text-2xl font-extrabold tracking-tight">
        {chapterDone ? (
          <>
            <span style={{ color: accent }}>{chapterName}</span> complete!
          </>
        ) : (
          "Level cleared!"
        )}
      </p>
      <p className="relative mt-1 text-sm font-semibold">
        <span className="text-gold-grad font-display text-lg font-bold">
          +{state.coinsEarned} coins
        </span>
        {state.foundBonus.length > 0 && (
          <span className="text-muted">
            {" "}
            · {state.foundBonus.length} bonus{" "}
            {state.foundBonus.length === 1 ? "word" : "words"}
          </span>
        )}
      </p>
      <div className="relative mt-4 flex flex-col gap-2">
        {onNextChapter ? (
          <button
            type="button"
            onClick={onNextChapter}
            className="btn-primary animate-glow flex cursor-pointer items-center justify-center gap-2 rounded-xl px-4 py-3 font-display text-lg font-bold"
          >
            Next chapter <ArrowRightIcon className="h-5 w-5" />
          </button>
        ) : onNextLevel ? (
          <button
            type="button"
            onClick={onNextLevel}
            className="btn-primary animate-glow flex cursor-pointer items-center justify-center gap-2 rounded-xl px-4 py-3 font-display text-lg font-bold"
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
