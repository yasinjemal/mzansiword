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
        <p className="text-2xl font-bold">Claimed! 🎉</p>
        <p className="text-sm text-zinc-500">
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
      <h1 className="text-center text-2xl font-bold">
        You won R{rands} airtime! 🎉
      </h1>
      <p className="text-center text-sm text-zinc-500">
        Sent to your number {phone}. Claim within {hoursLeft}h or it rolls into
        the next draw.
      </p>

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-1 text-sm font-medium">Your network</legend>
        {NETWORKS.map((n) => (
          <label
            key={n}
            className={`flex items-center gap-2 rounded border px-3 py-2 ${
              network === n
                ? "border-green-600 bg-green-50 dark:bg-green-950"
                : "border-zinc-300 dark:border-zinc-600"
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

      <label className="flex items-start gap-2 text-sm text-zinc-600 dark:text-zinc-300">
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
        className="rounded bg-green-600 px-4 py-2 font-semibold text-white disabled:opacity-50"
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
