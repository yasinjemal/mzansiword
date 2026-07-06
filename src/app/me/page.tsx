import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getMyPrizes, getProfile } from "@/lib/game/db";
import { WEEK_LEN, weeksInStreak } from "@/lib/streak/perfect-week";
import { SignOutButton } from "@/components/SignOutButton";
import { ShieldPips } from "@/components/ShieldPips";
import {
  ArrowRightIcon,
  FlameIcon,
  GiftIcon,
  MapIcon,
  TrophyIcon,
} from "@/components/icons";

export const metadata = { title: "My profile — Mzansi Word" };

const STATUS_LABELS: Record<string, string> = {
  pending_claim: "🎁 Claim now!",
  claimed: "⏳ On its way",
  paid: "✅ Paid",
  expired: "Expired",
};

export default async function MePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/me");

  const [profile, prizes] = await Promise.all([
    getProfile(user.id),
    getMyPrizes(user.id),
  ]);
  if (!profile) redirect("/login?next=/me");

  const streak = profile.current_streak;
  const best = profile.best_streak;
  const shields = profile.streak_shields;
  const weeksBanked = weeksInStreak(streak);
  const dayInWeek = streak % WEEK_LEN;
  const ringPct = streak > 0 && dayInWeek === 0 ? 100 : Math.round((dayInWeek / WEEK_LEN) * 100);
  const toNext = WEEK_LEN - dayInWeek;

  const perfectWeekLabel =
    streak === 0
      ? "Solve today's word to light the flame"
      : dayInWeek === 0
        ? `${weeksBanked} perfect week${weeksBanked === 1 ? "" : "s"} banked — start the next!`
        : `${toNext} more day${toNext === 1 ? "" : "s"} to a Perfect Week`;

  return (
    <div className="full-bleed px-4">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 pb-12 pt-1">
        {/* Greeting */}
        <header className="flex flex-col gap-3">
          <div className="ndebele-trim w-28" />
          <div>
            <h1 className="font-display text-3xl font-bold leading-tight">
              Molo, {profile.first_name ?? "Player"}
            </h1>
            <p className="text-sm text-muted">
              {profile.phone ?? "Guest player"}
            </p>
          </div>
        </header>

        {/* Dashboard grid */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Streak hero + Perfect Week ring */}
          <div className="mz-panel mz-panel-gold flex flex-col items-center justify-center gap-4 p-6 sm:col-span-2 lg:row-span-2">
            <div className="relative grid place-items-center">
              <div
                className="progress-ring w-44"
                style={{ "--p": ringPct } as React.CSSProperties}
                role="img"
                aria-label={`${ringPct}% toward the next Perfect Week`}
              />
              <div className="absolute flex flex-col items-center">
                <FlameIcon className="h-9 w-9 animate-flame text-gold" />
                <span className="font-display text-6xl font-extrabold leading-none">
                  {streak}
                </span>
                <span className="mt-1 text-[0.65rem] font-bold uppercase tracking-[0.2em] text-muted">
                  day streak
                </span>
              </div>
            </div>
            <p className="text-center text-sm font-semibold text-gold">
              {perfectWeekLabel}
            </p>
          </div>

          {/* Best streak */}
          <div className="mz-panel flex items-center gap-4 p-5">
            <TrophyIcon className="h-9 w-9 shrink-0 text-brand" />
            <div className="flex flex-col">
              <span className="font-display text-3xl font-bold leading-none">
                {best}
              </span>
              <span className="text-xs text-muted">Best streak</span>
            </div>
          </div>

          {/* Perfect weeks banked */}
          <div className="mz-panel flex items-center gap-4 p-5">
            <span className="font-display text-3xl leading-none">🏆</span>
            <div className="flex flex-col">
              <span className="font-display text-3xl font-bold leading-none">
                {weeksBanked}
              </span>
              <span className="text-xs text-muted">
                Perfect week{weeksBanked === 1 ? "" : "s"}
              </span>
            </div>
          </div>

          {/* Streak shields */}
          <div className="mz-panel flex flex-col justify-center gap-2 p-5 sm:col-span-2 lg:col-span-2">
            <ShieldPips held={shields} size="lg" />
            <div>
              <p className="font-display text-lg font-bold leading-tight">
                {shields} streak shield{shields === 1 ? "" : "s"}
              </p>
              <p className="text-xs text-muted">
                Each one auto-saves a missed day — miss one, keep your streak.
              </p>
            </div>
          </div>
        </section>

        {/* Quick actions */}
        <section className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Link
            href="/play/xh"
            className="btn-primary press-spring flex items-center justify-between rounded-2xl px-5 py-4 font-display text-lg font-bold"
          >
            Play today&apos;s word
            <ArrowRightIcon className="h-5 w-5" />
          </Link>
          <Link
            href="/journey"
            className="mz-panel press-spring flex items-center justify-between gap-3 rounded-2xl px-5 py-4 font-display text-lg font-bold transition-colors hover:border-brand/50"
          >
            <span className="flex items-center gap-2.5">
              <MapIcon className="h-5 w-5 text-brand" />
              Continue Journey
            </span>
            <ArrowRightIcon className="h-5 w-5 text-muted" />
          </Link>
        </section>

        {/* Prizes */}
        <section className="mz-panel flex flex-col gap-3 p-5">
          <h2 className="flex items-center gap-2 font-display text-lg font-bold">
            <GiftIcon className="h-5 w-5 text-gold" />
            My prizes
          </h2>
          {prizes.length === 0 && (
            <p className="text-sm text-muted">
              Nothing yet — solve today&apos;s word to enter tonight&apos;s R29
              airtime draw!
            </p>
          )}
          {prizes.length > 0 && (
            <div className="flex flex-col gap-2">
              {prizes.map((p) => {
                const row = (
                  <div className="flex items-center justify-between rounded-xl border border-edge bg-surface px-4 py-3 text-sm">
                    <span className="font-semibold">
                      R{(p.amount_cents / 100).toFixed(0)} airtime
                    </span>
                    <span
                      className={
                        p.status === "pending_claim"
                          ? "font-semibold text-gold"
                          : "text-muted"
                      }
                    >
                      {STATUS_LABELS[p.status] ?? p.status}
                    </span>
                  </div>
                );
                return p.status === "pending_claim" ? (
                  <Link key={p.id} href={`/claim/${p.id}`} className="press-spring">
                    {row}
                  </Link>
                ) : (
                  <div key={p.id}>{row}</div>
                );
              })}
            </div>
          )}
        </section>

        {/* Links */}
        <nav className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted">
          <Link href="/winners" className="transition-colors hover:text-foreground">
            Winner wall
          </Link>
          <Link href="/how-to-play" className="transition-colors hover:text-foreground">
            How to play
          </Link>
          <Link href="/rules" className="transition-colors hover:text-foreground">
            Rules
          </Link>
          <SignOutButton />
        </nav>
      </div>
    </div>
  );
}
