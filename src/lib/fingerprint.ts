// Soft device fingerprint: a coarse hash of stable browser traits, stored at
// signup as a weak second signal against multi-SIM farming (the primary
// identity check is the phone OTP). Not bulletproof; not used to block play.
export async function deviceFingerprint(): Promise<string | null> {
  try {
    const parts = [
      navigator.userAgent,
      `${screen.width}x${screen.height}x${screen.colorDepth}`,
      Intl.DateTimeFormat().resolvedOptions().timeZone,
      navigator.language,
      String(navigator.hardwareConcurrency ?? ""),
    ].join("|");
    const digest = await crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode(parts),
    );
    return Array.from(new Uint8Array(digest))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  } catch {
    return null;
  }
}
