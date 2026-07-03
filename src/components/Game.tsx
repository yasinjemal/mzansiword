"use client";

import { useCallback, useEffect, useReducer } from "react";
import { useRouter } from "next/navigation";
import { Board } from "./Board";
import { Keyboard } from "./Keyboard";
// Note: the answer is never shown on a loss — the server never sends it, and
// revealing it would let a burner account mine the day's word for a clean
// solve on a second account.
import { ResultPanel } from "./ResultPanel";
import { BACKSPACE, ENTER, type TrackCode } from "@/lib/engine/keyboard";
import { sfx } from "@/lib/sound";
import { trackEvent } from "@/lib/track-event";
import type { GuessEntry, GuessResponse, PlayStateDto } from "@/lib/game/types";

const FLIP_STAGGER_MS = 260;
const FLIP_DURATION_MS = 560;

interface State {
  committed: GuessEntry[];
  input: string;
  status: "playing" | "won" | "lost";
  submitting: boolean;
  /** Tiles of the last row are mid-flip; input stays locked. */
  revealing: boolean;
  revealRow: number | null;
  danceRow: number | null;
  pending: GuessResponse | null;
  toast: string | null;
  shaking: boolean;
  streak: number;
}

type Action =
  | { type: "letter"; letter: string; length: number }
  | { type: "backspace" }
  | { type: "submit_start" }
  | { type: "submit_ok"; entry: GuessEntry; res: GuessResponse }
  | { type: "submit_fail"; toast: string; shake?: boolean }
  | { type: "reveal_done" }
  | { type: "toast"; toast: string | null }
  | { type: "shake_end" };

function busy(state: State): boolean {
  return state.submitting || state.revealing || state.status !== "playing";
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "letter":
      if (busy(state) || state.input.length >= action.length) return state;
      return { ...state, input: state.input + action.letter };
    case "backspace":
      if (busy(state)) return state;
      return { ...state, input: state.input.slice(0, -1) };
    case "submit_start":
      return { ...state, submitting: true, toast: null };
    case "submit_ok":
      return {
        ...state,
        submitting: false,
        revealing: true,
        input: "",
        committed: [...state.committed, action.entry],
        revealRow: state.committed.length,
        pending: action.res,
      };
    case "reveal_done": {
      const res = state.pending;
      if (!res) return { ...state, revealing: false };
      return {
        ...state,
        revealing: false,
        pending: null,
        status: res.solved ? "won" : res.gameOver ? "lost" : "playing",
        danceRow: res.solved ? state.revealRow : null,
        streak: res.streak,
      };
    }
    case "submit_fail":
      return {
        ...state,
        submitting: false,
        toast: action.toast,
        shaking: action.shake ?? false,
      };
    case "toast":
      return { ...state, toast: action.toast };
    case "shake_end":
      return { ...state, shaking: false };
    default:
      return state;
  }
}

const ERROR_TOASTS: Record<string, string> = {
  not_in_word_list: "Not in the word list",
  wrong_length: "Not enough letters",
  already_finished: "You've already played today",
  no_puzzle_today: "No puzzle today — check back soon",
};

/** Praise by number of guesses used, SA style. */
const PRAISE = ["", "Yhu! Unreal!", "Sharp sharp!", "Lekker!", "Kiff!", "Eita!", "Phew — close one!"];

function vibrate(pattern: number | number[]) {
  try {
    navigator.vibrate?.(pattern);
  } catch {}
}

function reducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

async function fireConfetti() {
  if (reducedMotion()) return;
  const confetti = (await import("canvas-confetti")).default;
  const colors = ["#22c55e", "#fbbf24", "#f4f7f5", "#15803d"];
  confetti({ particleCount: 80, spread: 75, origin: { y: 0.55 }, colors });
  setTimeout(
    () =>
      confetti({
        particleCount: 50,
        spread: 100,
        scalar: 0.8,
        origin: { y: 0.4 },
        colors,
      }),
    250,
  );
}

export function Game({
  track,
  trackName,
  length,
  puzzleNumber,
  maxGuesses,
  initialPlay,
  authed,
  initialStreak,
}: {
  track: TrackCode;
  trackName: string;
  length: number;
  puzzleNumber: number;
  maxGuesses: number;
  initialPlay: PlayStateDto | null;
  authed: boolean;
  initialStreak: number;
}) {
  const router = useRouter();
  const [state, dispatch] = useReducer(reducer, {
    committed: initialPlay?.guesses ?? [],
    input: "",
    status: initialPlay?.solved
      ? "won"
      : initialPlay?.gameOver
        ? "lost"
        : "playing",
    submitting: false,
    revealing: false,
    revealRow: null,
    danceRow: null,
    pending: null,
    toast: null,
    shaking: false,
    streak: initialStreak,
  });

  useEffect(() => {
    try {
      localStorage.setItem("mw:lastTrack", track);
    } catch {}
  }, [track]);

  // Resolve the outcome once the flip animation has played out.
  useEffect(() => {
    if (!state.revealing) return;
    const total = reducedMotion()
      ? 50
      : (length - 1) * FLIP_STAGGER_MS + FLIP_DURATION_MS + 80;
    const t = setTimeout(() => dispatch({ type: "reveal_done" }), total);
    return () => clearTimeout(t);
  }, [state.revealing, length]);

  // Celebrate when the reveal lands on a win/loss (not on page reload).
  useEffect(() => {
    if (state.revealing || state.pending) return;
    if (state.danceRow !== null && state.status === "won") {
      const used = state.committed.length;
      dispatch({ type: "toast", toast: PRAISE[used] ?? "Lekker!" });
      vibrate([15, 60, 15, 60, 30]);
      sfx.complete();
      void fireConfetti();
    }
  }, [state.revealing, state.pending, state.danceRow, state.status, state.committed.length]);

  useEffect(() => {
    if (!state.toast) return;
    const t = setTimeout(() => dispatch({ type: "toast", toast: null }), 2200);
    return () => clearTimeout(t);
  }, [state.toast]);

  useEffect(() => {
    if (!state.shaking) return;
    const t = setTimeout(() => dispatch({ type: "shake_end" }), 500);
    return () => clearTimeout(t);
  }, [state.shaking]);

  const submit = useCallback(async () => {
    if (busy(state)) return;
    if (!authed) {
      router.push(`/login?next=/play/${track}`);
      return;
    }
    if (state.input.length !== length) {
      dispatch({ type: "submit_fail", toast: "Not enough letters", shake: true });
      vibrate([12, 40, 12]);
      sfx.invalid();
      return;
    }
    dispatch({ type: "submit_start" });
    try {
      const res = await fetch("/api/guess", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ track, guess: state.input }),
      });
      if (res.ok) {
        const data: GuessResponse = await res.json();
        if (state.committed.length === 0) trackEvent("daily_start", track);
        if (data.solved) {
          trackEvent("daily_solve", track, {
            guesses: state.committed.length + 1,
          });
        } else if (data.gameOver) {
          trackEvent("daily_fail", track);
        }
        dispatch({
          type: "submit_ok",
          entry: { word: state.input, marks: data.marks },
          res: data,
        });
        return;
      }
      const { error } = await res.json().catch(() => ({ error: "" }));
      if (error === "consent_required" || error === "unauthenticated") {
        router.push(`/login?next=/play/${track}`);
        return;
      }
      dispatch({
        type: "submit_fail",
        toast: ERROR_TOASTS[error] ?? "Something went wrong — try again",
        shake: error === "not_in_word_list" || error === "wrong_length",
      });
      if (error === "not_in_word_list") {
        vibrate([12, 40, 12]);
        sfx.invalid();
      }
    } catch {
      dispatch({
        type: "submit_fail",
        toast: "You're offline — Mzansi Word needs data to check your guess",
      });
    }
  }, [authed, length, router, state, track]);

  const handleKey = useCallback(
    (key: string) => {
      if (key === ENTER) {
        void submit();
      } else if (key === BACKSPACE) {
        vibrate(6);
        dispatch({ type: "backspace" });
      } else if (/^[a-z]$/.test(key)) {
        vibrate(6);
        sfx.click();
        dispatch({ type: "letter", letter: key, length });
      }
    },
    [length, submit],
  );

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.key === "Enter") handleKey(ENTER);
      else if (e.key === "Backspace") handleKey(BACKSPACE);
      else handleKey(e.key.toLowerCase());
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handleKey]);

  const finished = state.status !== "playing" && !state.revealing;
  // Key colours only update once the row has finished flipping.
  const keyboardGuesses = state.revealing
    ? state.committed.slice(0, -1)
    : state.committed;

  return (
    <div className="flex flex-1 flex-col items-center gap-3 pb-2">
      <p className="text-sm font-medium text-muted">
        {trackName} <span className="text-foreground/80">#{puzzleNumber}</span>{" "}
        · {length} letters
      </p>

      <Board
        length={length}
        maxGuesses={maxGuesses}
        committed={state.committed}
        current={state.input}
        shaking={state.shaking}
        revealRow={state.revealRow}
        danceRow={state.danceRow}
      />

      {finished && (
        <ResultPanel
          won={state.status === "won"}
          track={track}
          trackName={trackName}
          puzzleNumber={puzzleNumber}
          guesses={state.committed}
          maxGuesses={maxGuesses}
          streak={state.streak}
        />
      )}

      {!finished && (
        <div className="mt-auto w-full">
          <Keyboard
            track={track}
            committed={keyboardGuesses}
            onKey={handleKey}
            disabled={state.submitting || state.revealing}
          />
        </div>
      )}

      {state.toast && (
        <div
          role="status"
          className="animate-toast fixed top-16 left-1/2 z-50 rounded-lg bg-foreground px-4 py-2 text-sm font-bold text-background shadow-xl"
        >
          {state.toast}
        </div>
      )}
    </div>
  );
}
