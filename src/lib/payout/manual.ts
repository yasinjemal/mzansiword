import type { PayoutProvider } from "./provider";

// Pilot payout: no API call — the admin sends airtime manually (banking app)
// and marks the prize paid in /admin, recording their own reference.
export const manualPayout: PayoutProvider = {
  name: "manual",
  async send() {
    return { ref: "", status: "manual_required" as const };
  },
};

export function getPayoutProvider(): PayoutProvider {
  return manualPayout;
}
