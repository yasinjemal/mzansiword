import type { Metadata } from "next";

export const metadata: Metadata = { title: "Privacy notice — Mzansi Word" };

// POPIA privacy notice. Replace [PROMOTER] placeholders before launch.
export default function Privacy() {
  return (
    <article className="flex flex-col gap-4 pb-10 text-sm leading-6">
      <h1 className="text-xl font-bold">Privacy notice (POPIA)</h1>
      <p className="text-zinc-500">
        Responsible party: [PROMOTER NAME], [CONTACT EMAIL]. Last updated: 2
        July 2026.
      </p>

      <h2 className="font-bold">What we collect and why</h2>
      <ul className="list-disc space-y-1 pl-5">
        <li>
          <strong>Cellphone number</strong> — your account identity, one-time
          sign-in codes, and delivering airtime prizes.
        </li>
        <li>
          <strong>First name</strong> — greeting you, and (only with your
          separate consent at claim time) the winner wall.
        </li>
        <li>
          <strong>Game results</strong> (guesses, solve times, streaks) —
          running the game and the prize draws, and detecting cheating.
        </li>
        <li>
          <strong>Basic device information</strong> — a soft check against
          multi-account abuse.
        </li>
      </ul>

      <h2 className="font-bold">What we don&apos;t do</h2>
      <ul className="list-disc space-y-1 pl-5">
        <li>We don&apos;t sell your information.</li>
        <li>We don&apos;t send marketing without asking you first.</li>
        <li>
          We don&apos;t show your full number publicly — winners appear as
          first name + masked number, and only if you tick the consent box.
        </li>
      </ul>

      <h2 className="font-bold">Storage, retention, your rights</h2>
      <ul className="list-disc space-y-1 pl-5">
        <li>
          Data is stored with our hosting providers (database hosted by
          Supabase; site hosted by Vercel), which may process it outside
          South Africa with appropriate safeguards.
        </li>
        <li>
          Draw and winner records are kept 3 years (Consumer Protection Act);
          other data is kept only while your account is active.
        </li>
        <li>
          You may ask what we hold about you, correct it, or ask us to delete
          your account: [CONTACT EMAIL]. You may complain to the Information
          Regulator (inforegulator.org.za).
        </li>
      </ul>
    </article>
  );
}
