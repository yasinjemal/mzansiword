"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { isLiveTrack } from "@/lib/tracks";

// Journey defaults to English (full 60 levels) unless the player has a
// journey track preference; isiXhosa currently has fewer chapters while the
// wordlist grows.
export default function JourneyIndex() {
  const router = useRouter();
  useEffect(() => {
    let track = "en";
    try {
      const saved = localStorage.getItem("mw:journeyTrack");
      if (saved && isLiveTrack(saved)) track = saved;
    } catch {}
    router.replace(`/journey/${track}`);
  }, [router]);
  return null;
}
