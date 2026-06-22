import { differenceInCalendarDays, startOfDay } from "date-fns";
import { TrackConfig, TrackDefinition, TrackType, TrackUnit } from "../tracks/types";
import { getTrackDefinition } from "../tracks/registry";
import { AppSettings } from "../store/storage";
import {
  toHebrewYMD,
  hebrewToGregorian,
  daysInHebrewMonth,
  nextHebrewMonth,
  prevHebrewMonth,
} from "./hebrewDate";

type Range = { start: number; end: number };

export type SessionNumber = 1 | 2 | 3 | 4 | 5 | 6;

export type ScheduleItem = {
  trackId: string;
  trackType: TrackType;
  trackName: string;
  unit: TrackUnit;
  session: SessionNumber;
};

// Offsets from the day a unit is first learned: session 1=0, 2=+1, 3=+8, 4=+38, 5=+128.
// Session 5 is 90 days (≈3 months) after session 4.
// Session 6 is NOT a fixed offset — it lands on the Hebrew-calendar anniversary
// (one Hebrew year after first study) and is computed separately below.
// Applies to every track type.
type OffsetSession = 1 | 2 | 3 | 4 | 5;

const SESSION_OFFSETS: Record<OffsetSession, number> = {
  1: 0,
  2: 1,
  3: 8,
  4: 38,
  5: 128,
};

const OFFSET_SESSIONS: OffsetSession[] = [1, 2, 3, 4, 5];

// The annual Hebrew-anniversary review. Fires once, on the first Hebrew
// anniversary of the day a unit was first studied (session 1).
const ANNIVERSARY_SESSION: SessionNumber = 6;

// Number of Hebrew months between a unit's first study and its annual review.
const ANNIVERSARY_MONTHS = 12;

// Given the Gregorian date a unit was first studied, return the Gregorian date
// of its annual review — exactly 12 Hebrew months later, counted by position in
// the Hebrew month sequence. Because a leap year has 13 months and a regular
// year 12, advancing a fixed 12 positions naturally produces the expected
// shifts with no Adar-specific logic, e.g. Nisan(regular)→Adar II(leap),
// Adar(regular)→Adar I(leap), Adar I(leap)→Shevat(regular).
// The day is preserved, clamped down when the target month is shorter (a 30-day
// source day in a 29-day target month becomes day 29 — "the day before"). That
// clamp is the only many-to-one case: two study days can share one review day,
// which the scheduler emits for every unit (see anniversarySourceDays).
export function hebrewAnniversary(sourceDate: Date): Date {
  const { year, month, day } = toHebrewYMD(sourceDate);

  let ym = { year, month };
  for (let i = 0; i < ANNIVERSARY_MONTHS; i++) ym = nextHebrewMonth(ym);

  const maxDay = daysInHebrewMonth(ym.year, ym.month);
  const targetDay = Math.min(day, maxDay);

  return startOfDay(hebrewToGregorian(ym.year, ym.month, targetDay));
}

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
//
// The Hebrew-anniversary session (6) is handled separately: rather than a fixed
// day offset it lands one Hebrew year after a unit was first studied, so we
// invert hebrewAnniversary to find which (if any) study day maps onto `date`.
export function getItemsForTrack(date: Date, track: TrackConfig): ScheduleItem[] {
  const start = startOfDay(parseDateString(track.startDate));
  const today = startOfDay(date);
  const k = differenceInCalendarDays(today, start);

  if (k < 0) return []; // before this track's start date

  const def = getTrackDefinition(track.trackType);
  const ranges = buildStudyRanges(track, def);
  const len = studyLength(ranges);
  const startPos = unitIndexToPosition(ranges, track.startUnitIndex) ?? 1;
  const items: ScheduleItem[] = [];

  function pushUnitAtPosition(pos: number, session: SessionNumber) {
    if (pos < 1 || pos > len) return;
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

  // Fixed-offset sessions (1=לימוד … 5=חזרה ד׳).
  for (const session of OFFSET_SESSIONS) {
    const offset = SESSION_OFFSETS[session];
    if (k < offset) continue;
    pushUnitAtPosition(startPos + (k - offset), session);
  }

  // Anniversary session (6=חזרה ה׳): a unit's session 1 is its study day, so we
  // ask "which study day(s), 12 Hebrew months ago, have their review today?".
  // The day-clamp (a 30-day source day in a 29-day target month → 29) is
  // many-to-one, so a single calendar day can be the review day of more than one
  // study day. We emit a session-6 review for each, never dropping a collision.
  for (const sourceDay of anniversarySourceDays(today)) {
    const sourceK = differenceInCalendarDays(sourceDay, start);
    if (sourceK >= 0) pushUnitAtPosition(startPos + sourceK, ANNIVERSARY_SESSION);
  }

  return items;
}

// Inverse of hebrewAnniversary: all study days whose annual review falls exactly
// on `date`. Usually one, but the day-clamp (a 30-day source day landing in a
// 29-day target month) can make two study days share a review day. The source
// month is uniquely today's Hebrew month stepped back 12 positions — the exact
// inverse of the forward step — so there is a single candidate month; we still
// try its day overflow and keep only days whose forward mapping round-trips onto
// `date`, recovering the clamped day-30 source without re-encoding the rule.
function anniversarySourceDays(date: Date): Date[] {
  const { year, month, day } = toHebrewYMD(date);

  let ym = { year, month };
  for (let i = 0; i < ANNIVERSARY_MONTHS; i++) ym = prevHebrewMonth(ym);
  const maxDay = daysInHebrewMonth(ym.year, ym.month);

  const out: Date[] = [];
  // Try the exact day and (for the clamp case) the month's overflow days, so a
  // source day-30 that clamped to a 29-day target month is still recovered.
  for (const d of new Set([Math.min(day, maxDay), day, maxDay])) {
    if (d < 1 || d > maxDay) continue;
    const candidate = startOfDay(hebrewToGregorian(ym.year, ym.month, d));
    if (
      differenceInCalendarDays(hebrewAnniversary(candidate), date) === 0 &&
      !out.some((e) => differenceInCalendarDays(e, candidate) === 0)
    ) {
      out.push(candidate);
    }
  }
  return out;
}

export type TrackProgress = {
  current: number; // days elapsed into the full program (learning + chazara)
  total: number; // total days for the full program to complete
  percent: number; // 0-100, rounded
};

// The last fixed-offset session — the spaced-review cycle ends 128 days after a
// unit is first introduced. The anniversary review (session 6) is deliberately
// excluded from the progress horizon: its offset is a variable Hebrew year
// (354–385 days) rather than a fixed day count, and it is a once-only long-tail
// review, so progress reaches 100% when the core spaced cycle completes and the
// anniversary review trails afterward. This keeps the day-based math clean.
const LAST_SESSION_OFFSET = SESSION_OFFSETS[5];

// Progress through the spaced-review program (learning + sessions 1–5),
// measured in days. Day 0 = first unit introduced; the program ends when
// the last unit completes its final spaced review (session 5), which is
// (unitsRemaining - 1 + LAST_SESSION_OFFSET) days from start.
export function getTrackProgress(date: Date, track: TrackConfig): TrackProgress {
  const def = getTrackDefinition(track.trackType);
  const ranges = buildStudyRanges(track, def);
  const len = studyLength(ranges);
  const startPos = unitIndexToPosition(ranges, track.startUnitIndex) ?? 1;

  // Number of units this track will introduce (from startPos to end of study list).
  const unitsToLearn = len - startPos + 1;
  // Total program length in days: introduce last unit on day (unitsToLearn-1),
  // then wait LAST_SESSION_OFFSET more days for its final review.
  const total = Math.max(unitsToLearn - 1 + LAST_SESSION_OFFSET, 0);

  const start = startOfDay(parseDateString(track.startDate));
  const k = differenceInCalendarDays(startOfDay(date), start);

  const current = k < 0 ? 0 : Math.min(k, total);
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
