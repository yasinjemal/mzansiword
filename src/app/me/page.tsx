import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getMyPrizes, getProfile } from "@/lib/game/db";
import { SignOutButton } from "@/components/SignOutButton";
import { ShieldPips } from "@/components/ShieldPips";
import { FlameIcon, TrophyIcon } from "@/components/icons";

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

  return (
    <div className="flex flex-col gap-6 pb-10">
      <section className="flex flex-col gap-1">
        <h1 className="font-display text-2xl font-bold">
          Molo, {profile.first_name ?? "Player"}
        </h1>
        <p className="text-sm text-muted">{profile.phone}</p>
      </section>

      <section className="flex gap-3">
        <div className="flex flex-1 flex-col items-center gap-1 rounded-2xl border border-edge bg-surface p-4">
          <FlameIcon className="h-6 w-6 animate-flame text-gold" />
          <p className="font-display text-3xl font-bold">
            {profile.current_streak}
          </p>
          <p className="text-xs text-muted">Current streak</p>
        </div>
        <div className="flex flex-1 flex-col items-center gap-1 rounded-2xl border border-edge bg-surface p-4">
          <TrophyIcon className="h-6 w-6 text-brand" />
          <p className="font-display text-3xl font-bold">
            {profile.best_streak}
          </p>
          <p className="text-xs text-muted">Best streak</p>
        </div>
      </section>

      <p className="flex items-center justify-center gap-2 text-xs text-muted">
        <ShieldPips held={profile.streak_shields} />
        <span>
          {profile.streak_shields > 0
            ? `${profile.streak_shields} streak shield${
                profile.streak_shields === 1 ? "" : "s"
              } — each auto-saves a missed day`
            : "No shields — solve every day to keep your streak"}
        </span>
      </p>

      <section className="flex flex-col gap-2">
        <h2 className="font-bold">My prizes</h2>
        {prizes.length === 0 && (
          <p className="text-sm text-muted">
            Nothing yet — solve today&apos;s word to enter the draw!
          </p>
        )}
        {prizes.map((p) => {
          const row = (
            <div
              className="flex items-center justify-between rounded-lg border border-edge bg-surface px-3 py-2 text-sm"
            >
              <span className="font-medium">
                R{(p.amount_cents / 100).toFixed(0)} airtime
              </span>
              <span
                className={
                  p.status === "pending_claim"
                    ? "font-semibold text-brand"
                    : "text-muted"
                }
              >
                {STATUS_LABELS[p.status] ?? p.status}
              </span>
            </div>
          );
          return p.status === "pending_claim" ? (
            <Link key={p.id} href={`/claim/${p.id}`}>
              {row}
            </Link>
          ) : (
            <div key={p.id}>{row}</div>
          );
        })}
      </section>

      <section className="flex flex-col gap-2 text-sm">
        <Link href="/winners" className="cursor-pointer text-muted underline transition-colors hover:text-foreground">
          Winner wall
        </Link>
        <Link href="/how-to-play" className="cursor-pointer text-muted underline transition-colors hover:text-foreground">
          How to play
        </Link>
        <SignOutButton />
      </section>
    </div>
  );
}
