"use client";

import { useState } from "react";
import { NETWORKS, NETWORK_NAMES, type Network } from "@/lib/payout/provider";

export function ClaimForm({
  prizeId,
  rands,
  phone,
  expiresAt,
}: {
  prizeId: number;
  rands: string;
  phone: string;
  expiresAt: string;
}) {
  const [network, setNetwork] = useState<Network | "">("");
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Display only — the claim API re-validates expiry authoritatively.
  // eslint-disable-next-line react-hooks/purity
  const now = Date.now();
  const hoursLeft = Math.max(
    0,
    Math.floor((new Date(expiresAt).getTime() - now) / 3_600_000),
  );

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!network) {
      setError("Pick your network so we send the right airtime.");
      return;
    }
    setError(null);
    setBusy(true);
    const res = await fetch("/api/prize/claim", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prizeId, network, winnerWallConsent: consent }),
    });
    setBusy(false);
    if (!res.ok) {
      setError("Couldn't claim — refresh and try again.");
      return;
    }
    setDone(true);
  }

  if (done) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center">
        <p className="font-display text-3xl font-bold">Claimed!</p>
        <p className="text-sm text-muted">
          Your R{rands} airtime is on its way to {phone} — your network&apos;s
          SMS will confirm when it lands.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={submit}
      className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-4 pb-24"
    >
      <h1 className="text-center font-display text-3xl font-bold">
        You won R{rands} airtime!
      </h1>
      <p className="text-center text-sm text-muted">
        Sent to your number {phone}. Claim within {hoursLeft}h or it rolls into
        the next draw.
      </p>

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-1 text-sm font-medium">Your network</legend>
        {NETWORKS.map((n) => (
          <label
            key={n}
            className={`flex cursor-pointer items-center gap-2.5 rounded-xl border px-4 py-3 transition-colors ${
              network === n
                ? "border-brand bg-brand/10 font-semibold"
                : "border-edge bg-surface hover:bg-raised"
            }`}
          >
            <input
              type="radio"
              name="network"
              value={n}
              checked={network === n}
              onChange={() => setNetwork(n)}
            />
            {NETWORK_NAMES[n]}
          </label>
        ))}
      </fieldset>

      <label className="flex items-start gap-2 text-sm text-muted">
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          className="mt-1"
        />
        <span>
          Show me on the winner wall (first name + masked number, e.g.
          “Thabo M., 073 *** **21”). Optional.
        </span>
      </label>

      <button
        type="submit"
        disabled={busy}
        className="btn-primary animate-glow cursor-pointer rounded-xl px-4 py-3.5 font-display text-lg font-bold disabled:opacity-50"
      >
        {busy ? "Claiming…" : `Claim R${rands} airtime`}
      </button>

      {error && (
        <p className="text-center text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </form>
  );
}
