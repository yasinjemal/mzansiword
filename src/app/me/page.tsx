import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getMyPrizes, getProfile } from "@/lib/game/db";
import { SignOutButton } from "@/components/SignOutButton";

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
        <h1 className="text-xl font-bold">
          {profile.first_name ?? "Player"} 👋
        </h1>
        <p className="text-sm text-zinc-500">{profile.phone}</p>
      </section>

      <section className="flex gap-4">
        <div className="flex-1 rounded-lg border border-zinc-200 p-3 text-center dark:border-zinc-700">
          <p className="text-2xl font-bold">🔥 {profile.current_streak}</p>
          <p className="text-xs text-zinc-500">Current streak</p>
        </div>
        <div className="flex-1 rounded-lg border border-zinc-200 p-3 text-center dark:border-zinc-700">
          <p className="text-2xl font-bold">🏆 {profile.best_streak}</p>
          <p className="text-xs text-zinc-500">Best streak</p>
        </div>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="font-bold">My prizes</h2>
        {prizes.length === 0 && (
          <p className="text-sm text-zinc-500">
            Nothing yet — solve today&apos;s word to enter the draw!
          </p>
        )}
        {prizes.map((p) => {
          const row = (
            <div
              className="flex items-center justify-between rounded-lg border border-zinc-200 px-3 py-2 text-sm dark:border-zinc-700"
            >
              <span className="font-medium">
                R{(p.amount_cents / 100).toFixed(0)} airtime
              </span>
              <span
                className={
                  p.status === "pending_claim"
                    ? "font-semibold text-green-600"
                    : "text-zinc-500"
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
        <Link href="/winners" className="text-zinc-500 underline">
          Winner wall
        </Link>
        <Link href="/how-to-play" className="text-zinc-500 underline">
          How to play
        </Link>
        <SignOutButton />
      </section>
    </div>
  );
}
