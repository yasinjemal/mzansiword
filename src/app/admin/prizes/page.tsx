import { adminClient } from "@/lib/supabase/admin";
import { MarkPaidButton } from "@/components/AdminActions";
import { NETWORK_NAMES, type Network } from "@/lib/payout/provider";

export const dynamic = "force-dynamic";

export default async function AdminPrizes() {
  const { data: prizes } = await adminClient()
    .from("prizes")
    .select(
      "id, status, amount_cents, network, claim_msisdn, claimed_at, paid_at, payout_ref, expires_at, created_at, profiles(first_name, phone)",
    )
    .order("created_at", { ascending: false })
    .limit(100);

  const rows = (prizes ?? []).map((p) => {
    const profile = p.profiles as unknown as {
      first_name: string | null;
      phone: string | null;
    } | null;
    return { ...p, profile };
  });

  return (
    <div className="flex flex-col gap-2">
      <h1 className="font-bold">Prizes</h1>
      <p className="text-xs text-muted">
        Claimed prizes: send the airtime from the banking app, then Mark paid
        with your reference.
      </p>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-edge">
              <th className="py-1 pr-2">Winner</th>
              <th className="py-1 pr-2">Amount</th>
              <th className="py-1 pr-2">Network / number</th>
              <th className="py-1 pr-2">Status</th>
              <th className="py-1 pr-2">Won</th>
              <th className="py-1" />
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => (
              <tr
                key={p.id}
                className="border-b border-edge"
              >
                <td className="py-1 pr-2">
                  {p.profile?.first_name ?? "—"}{" "}
                  <span className="text-muted">{p.profile?.phone}</span>
                </td>
                <td className="py-1 pr-2">
                  R{(p.amount_cents / 100).toFixed(0)}
                </td>
                <td className="py-1 pr-2">
                  {p.network
                    ? `${NETWORK_NAMES[p.network as Network] ?? p.network} · ${p.claim_msisdn}`
                    : "—"}
                </td>
                <td className="py-1 pr-2">
                  {p.status}
                  {p.payout_ref ? ` (${p.payout_ref})` : ""}
                </td>
                <td className="py-1 pr-2">
                  {new Date(p.created_at).toISOString().slice(0, 10)}
                </td>
                <td className="py-1">
                  {p.status === "claimed" && <MarkPaidButton prizeId={p.id} />}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {rows.length === 0 && (
        <p className="text-sm text-muted">No prizes yet.</p>
      )}
    </div>
  );
}
