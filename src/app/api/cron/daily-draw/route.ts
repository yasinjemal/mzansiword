import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { adminClient } from "@/lib/supabase/admin";
import {
  expireOverduePrizes,
  runDailyDraw,
  runWeeklyStreakDraw,
} from "@/lib/draw/run-draw";
import { sastDayOfWeek } from "@/lib/time";

// One consolidated nightly job (Vercel Cron, 19:00 UTC = 21:00 SAST):
// expiry sweep -> daily draw (+ rolled-over prizes) -> weekly streak draw on
// Sundays. Idempotent: the unique (draw_date, type) constraint makes a
// second run a no-op.
export const maxDuration = 60;

function authorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const header = request.headers.get("authorization") ?? "";
  const expected = Buffer.from(`Bearer ${secret}`);
  const actual = Buffer.from(header);
  return (
    expected.length === actual.length && timingSafeEqual(expected, actual)
  );
}

export async function GET(request: Request) {
  if (!authorized(request)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const supabase = adminClient();
  const rolledOver = await expireOverduePrizes(supabase);
  const daily = await runDailyDraw(supabase, rolledOver);
  const weekly =
    sastDayOfWeek() === 0 ? await runWeeklyStreakDraw(supabase) : null;

  return NextResponse.json({ rolledOver, daily, weekly });
}
