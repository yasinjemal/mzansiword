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
import type { GuessEntry, GuessResponse, PlayStateDto } from "@/lib/game/types";

interface State {
  committed: GuessEntry[];
  input: string;
  status: "playing" | "won" | "lost";
  submitting: boolean;
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
  | { type: "toast"; toast: string | null }
  | { type: "shake_end" };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "letter":
      if (state.status !== "playing" || state.submitting) return state;
      if (state.input.length >= action.length) return state;
      return { ...state, input: state.input + action.letter };
    case "backspace":
      if (state.status !== "playing" || state.submitting) return state;
      return { ...state, input: state.input.slice(0, -1) };
    case "submit_start":
      return { ...state, submitting: true, toast: null };
    case "submit_ok": {
      const status = action.res.solved
        ? "won"
        : action.res.gameOver
          ? "lost"
          : "playing";
      return {
        ...state,
        submitting: false,
        input: "",
        committed: [...state.committed, action.entry],
        status,
        streak: action.res.streak,
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
    toast: null,
    shaking: false,
    streak: initialStreak,
  });

  useEffect(() => {
    try {
      localStorage.setItem("mw:lastTrack", track);
    } catch {}
  }, [track]);

  useEffect(() => {
    if (!state.toast) return;
    const t = setTimeout(() => dispatch({ type: "toast", toast: null }), 2500);
    return () => clearTimeout(t);
  }, [state.toast]);

  useEffect(() => {
    if (!state.shaking) return;
    const t = setTimeout(() => dispatch({ type: "shake_end" }), 500);
    return () => clearTimeout(t);
  }, [state.shaking]);

  const submit = useCallback(async () => {
    if (state.submitting || state.status !== "playing") return;
    if (!authed) {
      router.push(`/login?next=/play/${track}`);
      return;
    }
    if (state.input.length !== length) {
      dispatch({ type: "submit_fail", toast: "Not enough letters", shake: true });
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
    } catch {
      dispatch({
        type: "submit_fail",
        toast: "You're offline — Mzansi Word needs data to check your guess",
      });
    }
  }, [authed, length, router, state.input, state.status, state.submitting, track]);

  const handleKey = useCallback(
    (key: string) => {
      if (key === ENTER) {
        void submit();
      } else if (key === BACKSPACE) {
        dispatch({ type: "backspace" });
      } else if (/^[a-z]$/.test(key)) {
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

  return (
    <div className="flex flex-1 flex-col items-center gap-4 pb-4">
      <p className="text-sm text-zinc-500">
        {trackName} #{puzzleNumber} · {length} letters
      </p>

      <Board
        length={length}
        maxGuesses={maxGuesses}
        committed={state.committed}
        current={state.input}
        shaking={state.shaking}
      />

      {state.status !== "playing" && (
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

      <div className="mt-auto w-full">
        <Keyboard
          track={track}
          committed={state.committed}
          onKey={handleKey}
          disabled={state.submitting || state.status !== "playing"}
        />
      </div>

      {state.toast && (
        <div className="fixed top-16 left-1/2 z-50 -translate-x-1/2 rounded bg-zinc-900 px-4 py-2 text-sm font-medium text-white shadow-lg dark:bg-zinc-100 dark:text-zinc-900">
          {state.toast}
        </div>
      )}
    </div>
  );
}

