import { notFound } from "next/navigation";
import { JourneyMap } from "@/components/journey/JourneyMap";
import { journeyManifest } from "@/lib/journey/loader";
import { isLiveTrack, TRACK_NAMES } from "@/lib/tracks";

export const metadata = { title: "Journey — Mzansi Word" };

export default async function JourneyTrackPage({
  params,
}: {
  params: Promise<{ track: string }>;
}) {
  const { track } = await params;
  if (!isLiveTrack(track)) notFound();
  const entry = journeyManifest.tracks[track];
  if (!entry) notFound();

  return (
    <JourneyMap
      track={track}
      trackName={TRACK_NAMES[track]}
      chapters={entry.chapters}
      totalLevels={entry.totalLevels}
    />
  );
}
