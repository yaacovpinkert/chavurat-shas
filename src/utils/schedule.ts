import { differenceInCalendarDays, startOfDay } from "date-fns";
import { TrackConfig, TrackDefinition, TrackType, TrackUnit } from "../tracks/types";
import { getTrackDefinition } from "../tracks/registry";
import { AppSettings } from "../store/storage";

type Range = { start: number; end: number };

export type SessionNumber = 1 | 2 | 3 | 4 | 5;

export type ScheduleItem = {
  trackId: string;
  trackType: TrackType;
  trackName: string;
  unit: TrackUnit;
  session: SessionNumber;
};

// Offsets from the day a unit is first learned: session 1=0, 2=+1, 3=+8, 4=+38, 5=+128.
// Session 5 is 90 days (≈3 months) after session 4.
// Applies to every track type.
const SESSION_OFFSETS: Record<SessionNumber, number> = {
  1: 0,
  2: 1,
  3: 8,
  4: 38,
  5: 128,
};

const SESSIONS: SessionNumber[] = [1, 2, 3, 4, 5];

// The ordered "study list" for a track: the canonical concatenation of the
// selected books' index ranges. When no books are selected (legacy tracks),
// it is the whole track [1, unitCount] — making the subset path a superset of
// the original linear behavior.
function buildStudyRanges(track: TrackConfig, def: TrackDefinition): Range[] {
  if (!track.selectedGroups || track.selectedGroups.length === 0) {
    return [{ start: 1, end: def.unitCount }];
  }
  const selected = new Set(track.selectedGroups);
  const ranges: Range[] = [];
  for (const section of def.getSections()) {
    for (const g of section.groups) {
      if (selected.has(g.key)) ranges.push({ start: g.startIndex, end: g.endIndex });
    }
  }
  return ranges;
}

function studyLength(ranges: Range[]): number {
  return ranges.reduce((sum, r) => sum + (r.end - r.start + 1), 0);
}

// 1-based position within the study list -> global unit index.
function positionToUnitIndex(ranges: Range[], pos: number): number {
  let remaining = pos;
  for (const r of ranges) {
    const size = r.end - r.start + 1;
    if (remaining <= size) return r.start + remaining - 1;
    remaining -= size;
  }
  return -1; // out of range; caller guards with studyLength
}

// Global unit index -> 1-based position within the study list, or null if the
// index lies outside the selected ranges.
function unitIndexToPosition(ranges: Range[], idx: number): number | null {
  let before = 0;
  for (const r of ranges) {
    if (idx >= r.start && idx <= r.end) return before + (idx - r.start) + 1;
    before += r.end - r.start + 1;
  }
  return null;
}

// For day startDate+k, session S contributes the unit at study-list position
// startPos + (k - SESSION_OFFSETS[S]), when that position exists. startPos is
// where startUnitIndex falls within the (possibly filtered) study list.
// Each track counts from its own startDate, so tracks that began on
// different dates coexist on the same calendar day.
export function getItemsForTrack(date: Date, track: TrackConfig): ScheduleItem[] {
  const start = startOfDay(parseDateString(track.startDate));
  const k = differenceInCalendarDays(startOfDay(date), start);

  if (k < 0) return []; // before this track's start date

  const def = getTrackDefinition(track.trackType);
  const ranges = buildStudyRanges(track, def);
  const len = studyLength(ranges);
  const startPos = unitIndexToPosition(ranges, track.startUnitIndex) ?? 1;
  const items: ScheduleItem[] = [];

  for (const session of SESSIONS) {
    const offset = SESSION_OFFSETS[session];
    if (k < offset) continue;

    const pos = startPos + (k - offset);
    if (pos < 1 || pos > len) continue;

    const unitIndex = positionToUnitIndex(ranges, pos);
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

export type TrackProgress = {
  current: number; // 1-based position reached within the selected program as of date
  total: number; // total units in the selected program
  percent: number; // 0-100, rounded
};

// Progress through the *selected* program (only the chosen books/masechtot),
// measured by the session-1 frontier: on day k the new unit at study-list
// position startPos + k is introduced, so that position is "where you are".
export function getTrackProgress(date: Date, track: TrackConfig): TrackProgress {
  const def = getTrackDefinition(track.trackType);
  const ranges = buildStudyRanges(track, def);
  const total = studyLength(ranges);
  const startPos = unitIndexToPosition(ranges, track.startUnitIndex) ?? 1;

  const start = startOfDay(parseDateString(track.startDate));
  const k = differenceInCalendarDays(startOfDay(date), start);

  const current = k < 0 ? 0 : Math.min(startPos + k, total);
  const percent = total > 0 ? Math.round((current / total) * 100) : 0;
  return { current, total, percent };
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
