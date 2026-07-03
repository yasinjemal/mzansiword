"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

async function post(body: unknown): Promise<boolean> {
  const res = await fetch("/api/admin/action", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return res.ok;
}

const buttonClass =
  "rounded border border-edge px-2 py-1 text-xs font-medium transition-colors hover:bg-raised disabled:opacity-50";

export function MarkPaidButton({ prizeId }: { prizeId: number }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  return (
    <button
      type="button"
      disabled={busy}
      className={buttonClass}
      onClick={async () => {
        const ref = prompt("Payout reference (e.g. bank app ref):");
        if (!ref?.trim()) return;
        setBusy(true);
        const ok = await post({
          type: "mark_paid",
          prizeId,
          payoutRef: ref.trim(),
        });
        setBusy(false);
        if (ok) router.refresh();
        else alert("Couldn't mark paid — was it already paid?");
      }}
    >
      {busy ? "…" : "Mark paid"}
    </button>
  );
}

export function UnflagButton({ playId }: { playId: number }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  return (
    <button
      type="button"
      disabled={busy}
      className={buttonClass}
      onClick={async () => {
        setBusy(true);
        const ok = await post({ type: "unflag_play", playId });
        setBusy(false);
        if (ok) router.refresh();
      }}
    >
      {busy ? "…" : "Unflag"}
    </button>
  );
}

export function BanButton({
  userId,
  banned,
}: {
  userId: string;
  banned: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  return (
    <button
      type="button"
      disabled={busy}
      className={buttonClass}
      onClick={async () => {
        if (!banned && !confirm("Ban this player from draws and play?")) return;
        setBusy(true);
        const ok = await post({ type: "set_banned", userId, banned: !banned });
        setBusy(false);
        if (ok) router.refresh();
      }}
    >
      {busy ? "…" : banned ? "Unban" : "Ban"}
    </button>
  );
}
