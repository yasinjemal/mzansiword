// Airtime payout abstraction. The pilot uses ManualPayout (admin sends
// airtime from a banking app and marks the prize paid); a Freepaid or
// Reloadly implementation slots in here later with no call-site changes.

export const NETWORKS = ["vodacom", "mtn", "cellc", "telkom"] as const;
export type Network = (typeof NETWORKS)[number];

export const NETWORK_NAMES: Record<Network, string> = {
  vodacom: "Vodacom",
  mtn: "MTN",
  cellc: "Cell C",
  telkom: "Telkom",
};

export interface PayoutRequest {
  msisdn: string; // +27...
  network: Network;
  amountCents: number;
}

export interface PayoutResult {
  ref: string;
  status: "sent" | "manual_required";
}

export interface PayoutProvider {
  readonly name: string;
  send(request: PayoutRequest): Promise<PayoutResult>;
}
