import "server-only";

import { adminClient } from "../supabase/admin";
import { puzzleNumber, sastToday } from "../time";
import { MAX_GUESSES, type GuessEntry, type PlayStateDto } from "./types";
import type { TrackCode } from "../engine/keyboard";

export interface PuzzleRow {
  id: number;
  track_code: string;
  puzzle_date: string;
  answer: string;
  length: number;
}

export interface PlayRow {
  id: number;
  user_id: string;
  puzzle_id: number;
  guesses: GuessEntry[];
  guess_count: number;
  solved: boolean;
  started_at: string;
  finished_at: string | null;
}

export interface ProfileRow {
  id: string;
  phone: string | null;
  first_name: string | null;
  consent_popia_at: string | null;
  current_streak: number;
  best_streak: number;
  last_solved_date: string | null;
  banned: boolean;
}

export async function getTodayPuzzle(
  track: TrackCode,
): Promise<PuzzleRow | null> {
  const { data, error } = await adminClient()
    .from("puzzles")
    .select("id, track_code, puzzle_date, answer, length")
    .eq("track_code", track)
    .eq("puzzle_date", sastToday())
    .maybeSingle();
  if (error) throw new Error(`getTodayPuzzle: ${error.message}`);
  return data;
}

export async function getPlay(
  userId: string,
  puzzleId: number,
): Promise<PlayRow | null> {
  const { data, error } = await adminClient()
    .from("plays")
    .select(
      "id, user_id, puzzle_id, guesses, guess_count, solved, started_at, finished_at",
    )
    .eq("user_id", userId)
    .eq("puzzle_id", puzzleId)
    .maybeSingle();
  if (error) throw new Error(`getPlay: ${error.message}`);
  return data;
}

export async function getProfile(userId: string): Promise<ProfileRow | null> {
  const { data, error } = await adminClient()
    .from("profiles")
    .select(
      "id, phone, first_name, consent_popia_at, current_streak, best_streak, last_solved_date, banned",
    )
    .eq("id", userId)
    .maybeSingle();
  if (error) throw new Error(`getProfile: ${error.message}`);
  return data;
}

export function toPlayStateDto(
  puzzle: PuzzleRow,
  play: PlayRow | null,
): PlayStateDto {
  const guesses = play?.guesses ?? [];
  const solved = play?.solved ?? false;
  return {
    track: puzzle.track_code as TrackCode,
    puzzleDate: puzzle.puzzle_date,
    puzzleNumber: puzzleNumber(puzzle.puzzle_date),
    length: puzzle.length,
    maxGuesses: MAX_GUESSES,
    guesses,
    solved,
    gameOver: solved || guesses.length >= MAX_GUESSES,
  };
}

export interface PrizeRow {
  id: number;
  amount_cents: number;
  status: string;
  expires_at: string;
  created_at: string;
  network: string | null;
  paid_at: string | null;
}

export async function getPendingPrizes(userId: string): Promise<PrizeRow[]> {
  const { data, error } = await adminClient()
    .from("prizes")
    .select("id, amount_cents, status, expires_at, created_at, network, paid_at")
    .eq("user_id", userId)
    .eq("status", "pending_claim")
    .gt("expires_at", new Date().toISOString())
    .order("created_at", { ascending: false });
  if (error) throw new Error(`getPendingPrizes: ${error.message}`);
  return data ?? [];
}

export async function getMyPrizes(userId: string): Promise<PrizeRow[]> {
  const { data, error } = await adminClient()
    .from("prizes")
    .select("id, amount_cents, status, expires_at, created_at, network, paid_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(20);
  if (error) throw new Error(`getMyPrizes: ${error.message}`);
  return data ?? [];
}

export async function isValidGuessWord(
  track: TrackCode,
  word: string,
): Promise<boolean> {
  const { data, error } = await adminClient()
    .from("words_guesses")
    .select("word")
    .eq("track_code", track)
    .eq("word", word)
    .maybeSingle();
  if (error) throw new Error(`isValidGuessWord: ${error.message}`);
  return data !== null;
}
