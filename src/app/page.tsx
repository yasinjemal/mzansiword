"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { DEFAULT_TRACK, isLiveTrack } from "@/lib/tracks";

// Sends the player to their last-played track, defaulting to isiXhosa.
export default function Home() {
  const router = useRouter();
  useEffect(() => {
    let track: string = DEFAULT_TRACK;
    try {
      const last = localStorage.getItem("mw:lastTrack");
      if (last && isLiveTrack(last)) track = last;
    } catch {}
    router.replace(`/play/${track}`);
  }, [router]);
  return null;
}
