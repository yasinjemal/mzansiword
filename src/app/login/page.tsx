"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { deviceFingerprint } from "@/lib/fingerprint";
import { normalizeSaPhone } from "@/lib/phone";

type Step = "phone" | "otp" | "profile";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const rawNext = params.get("next") ?? "/";
  // Only same-site relative paths — never redirect off-site.
  const next = rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : "/";

  const [step, setStep] = useState<Step>("phone");
  const [phoneInput, setPhoneInput] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [firstName, setFirstName] = useState("");
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function sendOtp(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const normalized = normalizeSaPhone(phoneInput);
    if (!normalized) {
      setError("Enter a valid South African cell number, e.g. 073 123 4567");
      return;
    }
    setBusy(true);
    const supabase = createClient();
    const { error: err } = await supabase.auth.signInWithOtp({
      phone: normalized,
    });
    setBusy(false);
    if (err) {
      setError("Couldn't send the code — please try again in a minute.");
      return;
    }
    setPhone(normalized);
    setStep("otp");
  }

  async function verifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const supabase = createClient();
    const { error: err } = await supabase.auth.verifyOtp({
      phone,
      token: otp.trim(),
      type: "sms",
    });
    if (err) {
      setBusy(false);
      setError("That code didn't work — check it and try again.");
      return;
    }
    const me = await fetch("/api/profile/me").then((r) =>
      r.ok ? r.json() : null,
    );
    setBusy(false);
    if (me?.consentGiven) {
      router.push(next);
      router.refresh();
    } else {
      setStep("profile");
    }
  }

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!consent) {
      setError("Please accept the privacy notice to play.");
      return;
    }
    setBusy(true);
    const res = await fetch("/api/profile/consent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        firstName: firstName.trim(),
        consent: true,
        deviceFp: await deviceFingerprint(),
      }),
    });
    setBusy(false);
    if (!res.ok) {
      setError("Something went wrong — please try again.");
      return;
    }
    router.push(next);
    router.refresh();
  }

  const inputClass =
    "w-full rounded-xl border border-edge bg-surface px-4 py-3 text-base text-foreground placeholder:text-muted/60 outline-none transition-colors focus:border-brand";
  const buttonClass =
    "w-full cursor-pointer rounded-xl bg-brand px-4 py-3 font-display text-lg font-semibold text-[#0b1210] transition-transform active:scale-[0.98] disabled:opacity-50";

  return (
    <div className="animate-rise mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-4 pb-24">
      <h1 className="text-center font-display text-2xl font-bold">
        {step === "profile" ? "Almost there!" : "Sign in to play"}
      </h1>

      {step === "phone" && (
        <form onSubmit={sendOtp} className="flex flex-col gap-3">
          <label className="text-sm text-muted">
            Your cell number — we&apos;ll send a one-time code. Free to play,
            no airtime deducted, ever.
          </label>
          <input
            type="tel"
            autoComplete="tel"
            inputMode="tel"
            placeholder="073 123 4567"
            value={phoneInput}
            onChange={(e) => setPhoneInput(e.target.value)}
            className={inputClass}
            required
          />
          <button type="submit" disabled={busy} className={buttonClass}>
            {busy ? "Sending…" : "Send code"}
          </button>
        </form>
      )}

      {step === "otp" && (
        <form onSubmit={verifyOtp} className="flex flex-col gap-3">
          <label className="text-sm text-muted">
            Enter the code we sent to {phone}
          </label>
          <input
            type="text"
            autoComplete="one-time-code"
            inputMode="numeric"
            placeholder="123456"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            className={`${inputClass} text-center tracking-widest`}
            required
          />
          <button type="submit" disabled={busy} className={buttonClass}>
            {busy ? "Checking…" : "Verify"}
          </button>
          <button
            type="button"
            onClick={() => setStep("phone")}
            className="cursor-pointer text-sm text-muted underline transition-colors hover:text-foreground"
          >
            Wrong number?
          </button>
        </form>
      )}

      {step === "profile" && (
        <form onSubmit={saveProfile} className="flex flex-col gap-3">
          <label className="text-sm text-muted">
            What should we call you? (Shown if you win — e.g. “Thabo M.”)
          </label>
          <input
            type="text"
            autoComplete="given-name"
            placeholder="First name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className={inputClass}
            maxLength={40}
            required
          />
          <label className="flex items-start gap-2 text-sm text-muted">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              className="mt-1"
            />
            <span>
              I agree that Mzansi Word stores my phone number and game results
              to run the game and prize draws, as described in the{" "}
              <Link href="/privacy" className="underline">
                privacy notice
              </Link>{" "}
              (POPIA).
            </span>
          </label>
          <button type="submit" disabled={busy} className={buttonClass}>
            {busy ? "Saving…" : "Let's play!"}
          </button>
        </form>
      )}

      {error && (
        <p className="text-center text-sm text-danger">
          {error}
        </p>
      )}
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
