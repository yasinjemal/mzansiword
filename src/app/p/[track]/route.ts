import { NextResponse } from "next/server";
import { isLiveTrack } from "@/lib/tracks";

// Short deep link used on share cards: /p/xh -> /play/xh. WhatsApp's link
// preview crawler follows the redirect and reads OG tags from the play page.
// The query string is preserved so a challenge token (?ch=…, RFC-0004) survives
// the redirect into the play page.
export async function GET(
  request: Request,
  { params }: { params: Promise<{ track: string }> },
) {
  const { track } = await params;
  const target = new URL(
    isLiveTrack(track) ? `/play/${track}` : "/",
    request.url,
  );
  target.search = new URL(request.url).search;
  return NextResponse.redirect(target, 307);
}
