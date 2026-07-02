import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { adminClient } from "@/lib/supabase/admin";
import { getProfile } from "@/lib/game/db";
import { ClaimForm } from "@/components/ClaimForm";

export const metadata = { title: "Claim your airtime — Mzansi Word" };

export default async function ClaimPage({
  params,
}: {
  params: Promise<{ prizeId: string }>;
}) {
  const { prizeId } = await params;
  const id = Number(prizeId);
  if (!Number.isInteger(id) || id <= 0) notFound();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=/claim/${id}`);

  const [{ data: prize }, profile] = await Promise.all([
    adminClient()
      .from("prizes")
      .select("id, user_id, amount_cents, status, expires_at")
      .eq("id", id)
      .eq("user_id", user.id)
      .maybeSingle(),
    getProfile(user.id),
  ]);
  if (!prize) notFound();

  const rands = (prize.amount_cents / 100).toFixed(0);

  if (prize.status !== "pending_claim") {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center">
        <p className="text-xl font-bold">
          {prize.status === "expired"
            ? "This prize has expired 😔"
            : `R${rands} airtime — ${prize.status === "paid" ? "sent!" : "claimed ✔"}`}
        </p>
        <p className="text-sm text-zinc-500">
          {prize.status === "expired"
            ? "Unclaimed prizes roll into the next draw. Keep playing!"
            : prize.status === "paid"
              ? "Check your phone — your network's SMS confirms it landed."
              : "We're sending your airtime — it lands within a day."}
        </p>
      </div>
    );
  }

  if (new Date(prize.expires_at).getTime() < Date.now()) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <p className="text-xl font-bold">This prize has expired 😔</p>
      </div>
    );
  }

  return (
    <ClaimForm
      prizeId={prize.id}
      rands={rands}
      phone={profile?.phone ?? ""}
      expiresAt={prize.expires_at}
    />
  );
}
