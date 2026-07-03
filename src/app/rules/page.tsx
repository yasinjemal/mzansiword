import type { Metadata } from "next";

export const metadata: Metadata = { title: "Competition rules — Mzansi Word" };

// Plain-language CPA s36 promotional competition rules. Have an attorney
// review before scaling past the pilot; replace the [PROMOTER] placeholders.
export default function Rules() {
  return (
    <article className="flex flex-col gap-4 pb-10 text-sm leading-6">
      <h1 className="text-xl font-bold">Competition rules</h1>
      <p className="text-muted">
        Mzansi Word runs a promotional competition under section 36 of the
        Consumer Protection Act 68 of 2008. Promoter: [PROMOTER NAME],
        [CONTACT EMAIL]. Last updated: 2 July 2026.
      </p>

      <h2 className="font-bold">Entry</h2>
      <ul className="list-disc space-y-1 pl-5">
        <li>
          Entry is <strong>free</strong>. You never pay to play, no airtime or
          data is deducted by us, and no purchase is required. Standard data
          costs from your network to load the site apply, as they would for
          any website.
        </li>
        <li>
          Solving a daily puzzle gives you one entry into that day&apos;s
          draw. Each language track you solve is one entry (max one entry per
          track per day).
        </li>
        <li>
          One account per person, verified by cellphone number. You must be
          18 or older and living in South Africa to win prizes.
        </li>
      </ul>

      <h2 className="font-bold">The draws</h2>
      <ul className="list-disc space-y-1 pl-5">
        <li>
          Daily draw at 21:00: 2 winners of R29 airtime, drawn randomly from
          that day&apos;s solvers by a verifiable computer draw. Every
          draw&apos;s
          random seed and entrant list are recorded so the result can be
          independently reproduced.
        </li>
        <li>
          Weekly streak draw (Sundays): 1 winner of R29 airtime, drawn from
          players with a 7-day solve streak.
        </li>
        <li>
          A player can win at most twice per calendar month — this keeps
          prizes spreading through the community.
        </li>
        <li>
          Suspicious play (for example solving faster than is humanly
          plausible, or multiple accounts) is excluded from draws, and
          repeat abuse leads to a ban.
        </li>
      </ul>

      <h2 className="font-bold">Prizes and claiming</h2>
      <ul className="list-disc space-y-1 pl-5">
        <li>
          Winners are notified in the app. Claim within 72 hours by
          confirming your network; unclaimed prizes roll into the next
          day&apos;s draw.
        </li>
        <li>
          Prizes are airtime sent to your verified number. You never pay
          anything to claim a prize. Prizes cannot be exchanged for cash.
        </li>
        <li>
          Draw and winner records are kept for 3 years as the CPA requires.
        </li>
      </ul>

      <h2 className="font-bold">General</h2>
      <ul className="list-disc space-y-1 pl-5">
        <li>
          The promoter may amend these rules or pause the competition where
          reasonably necessary (for example to prevent abuse); material
          changes are announced in the app.
        </li>
        <li>
          Employees of the promoter and their immediate families may play but
          cannot win prizes.
        </li>
        <li>
          Queries: [CONTACT EMAIL]. This competition is not sponsored by or
          affiliated with any mobile network.
        </li>
      </ul>
    </article>
  );
}
