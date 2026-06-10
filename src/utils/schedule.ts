import { differenceInCalendarDays, startOfDay } from "date-fns";
import { TrackConfig, TrackType, TrackUnit } from "../tracks/types";
import { getTrackDefinition } from "../tracks/registry";
import { AppSettings } from "../store/storage";

export type SessionNumber = 1 | 2 | 3 | 4;

export type ScheduleItem = {
  trackId: string;
  trackType: TrackType;
  trackName: string;
  unit: TrackUnit;
  session: SessionNumber;
};

// Offsets from the day a unit is first learned: session 1=0, 2=+1, 3=+8, 4=+38.
// Applies to every track type.
const SESSION_OFFSETS: Record<SessionNumber, number> = {
  1: 0,
  2: 1,
  3: 8,
  4: 38,
};

const SESSIONS: SessionNumber[] = [1, 2, 3, 4];

// For day startDate+k, session S contributes the unit at index:
// startUnitIndex + k - SESSION_OFFSETS[S], when that index exists.
// Each track counts from its own startDate, so tracks that began on
// different dates coexist on the same calendar day.
export function getItemsForTrack(date: Date, track: TrackConfig): ScheduleItem[] {
  const start = startOfDay(parseDateString(track.startDate));
  const k = differenceInCalendarDays(startOfDay(date), start);

  if (k < 0) return []; // before this track's start date

  const def = getTrackDefinition(track.trackType);
  const items: ScheduleItem[] = [];

  for (const session of SESSIONS) {
    const offset = SESSION_OFFSETS[session];
    if (k < offset) continue;

    const unitIndex = track.startUnitIndex + (k - offset);
    if (unitIndex < 1 || unitIndex > def.unitCount) continue;

    const unit = def.getUnitByIndex(unitIndex);
    if (unit) {
      items.push({
        trackId: track.id,
        trackType: track.trackType,
        trackName: def.name,
        unit,
        session,
      });
    }
  }

  return items;
}

export function getItemsForDate(date: Date, settings: AppSettings): ScheduleItem[] {
  return settings.tracks.flatMap((track) => getItemsForTrack(date, track));
}

export function formatDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function parseDateString(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return startOfDay(new Date(y, m - 1, d));
}

export function getTodayString(): string {
  return formatDateString(new Date());
}
