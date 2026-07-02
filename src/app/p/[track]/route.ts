import { NextResponse } from "next/server";
import { isLiveTrack } from "@/lib/tracks";

// Short deep link used on share cards: /p/xh -> /play/xh. WhatsApp's link
// preview crawler follows the redirect and reads OG tags from the play page.
export async function GET(
  request: Request,
  { params }: { params: Promise<{ track: string }> },
) {
  const { track } = await params;
  const target = isLiveTrack(track) ? `/play/${track}` : "/";
  return NextResponse.redirect(new URL(target, request.url), 307);
}
