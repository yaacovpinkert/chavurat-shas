// Pure-JS Hebrew calendar conversion — no external dependencies.
// Algorithm: Reingold-Dershowitz "Calendrical Calculations" (4th ed.)

// ─── Core calendar math ────────────────────────────────────────────────────

// JDN baseline for hebrewElapsedDays(year): 1 Tishrei AM 1 = JDN 347998
// (Monday), and hebrewElapsedDays(1) = 1. With this epoch the postponement
// rule lands Rosh Hashana only on Mon/Tue/Thu/Shabbat, as required.
const HEBREW_EPOCH = 347997;

function isLeap(year: number): boolean {
  return ((7 * year + 1) % 19) < 7;
}

function hebrewElapsedDays(year: number): number {
  const monthsElapsed =
    235 * Math.floor((year - 1) / 19) +
    12 * ((year - 1) % 19) +
    Math.floor((7 * ((year - 1) % 19) + 1) / 19);

  const partsElapsed = 204 + 793 * (monthsElapsed % 1080);
  const hoursElapsed =
    5 +
    12 * monthsElapsed +
    793 * Math.floor(monthsElapsed / 1080) +
    Math.floor(partsElapsed / 1080);

  const conjDay = 1 + 29 * monthsElapsed + Math.floor(hoursElapsed / 24);
  const conjParts = 1080 * (hoursElapsed % 24) + (partsElapsed % 1080);

  let altDay: number;
  if (
    conjParts >= 19440 ||
    (conjDay % 7 === 2 && conjParts >= 9924 && !isLeap(year)) ||
    (conjDay % 7 === 1 && conjParts >= 16789 && isLeap(year - 1))
  ) {
    altDay = conjDay + 1;
  } else {
    altDay = conjDay;
  }

  if ([0, 3, 5].includes(altDay % 7)) return altDay + 1;
  return altDay;
}

function roshHashanaJDN(year: number): number {
  return HEBREW_EPOCH + hebrewElapsedDays(year);
}

function daysInYear(year: number): number {
  return roshHashanaJDN(year + 1) - roshHashanaJDN(year);
}

function daysInMonth(month: number, year: number): number {
  if ([2, 4, 6, 10, 13].includes(month)) return 29;
  if (month === 12 && !isLeap(year)) return 29;
  if (month === 8 && daysInYear(year) % 10 !== 5) return 29;
  if (month === 9 && daysInYear(year) % 10 === 3) return 29;
  return 30;
}

// Gregorian date → Julian Day Number
function gregorianToJDN(year: number, month: number, day: number): number {
  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;
  return (
    day +
    Math.floor((153 * m + 2) / 5) +
    365 * y +
    Math.floor(y / 4) -
    Math.floor(y / 100) +
    Math.floor(y / 400) -
    32045
  );
}

// JDN → Hebrew {year, month (Nisan=1..Tishrei=7), day}
function jdnToHebrew(jdn: number): { year: number; month: number; day: number } {
  let year = Math.round((jdn - HEBREW_EPOCH) / 365.24682);
  while (roshHashanaJDN(year + 1) <= jdn) year++;
  while (roshHashanaJDN(year) > jdn) year--;

  const order = monthsInCivilOrder(year);

  let monthStart = roshHashanaJDN(year);
  let month = 7;
  for (const m of order) {
    const mLen = daysInMonth(m, year);
    if (jdn < monthStart + mLen) { month = m; break; }
    monthStart += mLen;
  }

  return { year, month, day: jdn - monthStart + 1 };
}

// ─── Display helpers ───────────────────────────────────────────────────────

const MONTH_NAMES: Record<number, string> = {
  1: "ניסן", 2: "אייר", 3: "סיון", 4: "תמוז", 5: "אב", 6: "אלול",
  7: "תשרי", 8: "חשון", 9: "כסלו", 10: "טבת", 11: "שבט",
  12: "אדר", 13: "אדר ב׳",
};

// Civil-year month order, Tishrei first (Adar I only in leap years)
function monthsInCivilOrder(year: number): number[] {
  const order = [7, 8, 9, 10, 11, 12];
  if (isLeap(year)) order.push(13);
  order.push(1, 2, 3, 4, 5, 6);
  return order;
}

const GEMATRIA_VALS: [number, string][] = [
  [400,"ת"],[300,"ש"],[200,"ר"],[100,"ק"],
  [90,"צ"],[80,"פ"],[70,"ע"],[60,"ס"],[50,"נ"],
  [40,"מ"],[30,"ל"],[20,"כ"],[10,"י"],
  [9,"ט"],[8,"ח"],[7,"ז"],[6,"ו"],[5,"ה"],
  [4,"ד"],[3,"ג"],[2,"ב"],[1,"א"],
];

function toGematria(n: number): string {
  if (n === 15) return "טו";
  if (n === 16) return "טז";
  let result = "";
  let remaining = n;
  for (const [val, letter] of GEMATRIA_VALS) {
    while (remaining >= val) { result += letter; remaining -= val; }
  }
  return result;
}

function formatGematria(n: number): string {
  const g = toGematria(n);
  if (g.length === 1) return g + "׳";
  return g.slice(0, -1) + "״" + g.slice(-1);
}

// ─── Public API ───────────────────────────────────────────────────────────

export type HebrewDateInfo = {
  day: number;
  monthName: string;
  year: number;
  dayGematria: string;
  yearGematria: string;
  short: string;  // "י״ד בסיון"
  full: string;   // "י״ד בסיון תשפ״ו"
};

export function toHebrewDate(date: Date): HebrewDateInfo {
  const jdn = gregorianToJDN(date.getFullYear(), date.getMonth() + 1, date.getDate());
  const { year, month, day } = jdnToHebrew(jdn);

  const monthName = getHebrewMonthName(month, year);
  const dayGematria = formatGematria(day);
  const yearGematria = formatGematria(year % 1000); // drop thousands

  return {
    day,
    monthName,
    year,
    dayGematria,
    yearGematria,
    short: `${dayGematria} ב${monthName}`,
    full: `${dayGematria} ב${monthName} ${yearGematria}`,
  };
}

// ─── Hebrew-month calendar API ────────────────────────────────────────────

export type HebrewYM = { year: number; month: number };

export function isHebrewLeapYear(year: number): boolean {
  return isLeap(year);
}

export function daysInHebrewMonth(year: number, month: number): number {
  return daysInMonth(month, year);
}

export function getHebrewMonthName(month: number, year: number): string {
  if (month === 12 && isLeap(year)) return "אדר א׳";
  return MONTH_NAMES[month] ?? String(month);
}

export function getHebrewMonthsInYear(year: number): { month: number; name: string }[] {
  return monthsInCivilOrder(year).map((m) => ({
    month: m,
    name: getHebrewMonthName(m, year),
  }));
}

export function hebrewToJDN(year: number, month: number, day: number): number {
  let jdn = roshHashanaJDN(year);
  for (const m of monthsInCivilOrder(year)) {
    if (m === month) break;
    jdn += daysInMonth(m, year);
  }
  return jdn + day - 1;
}

// JDN → Gregorian (standard inverse of gregorianToJDN, proleptic Gregorian)
export function jdnToGregorian(jdn: number): Date {
  const a = jdn + 32044;
  const b = Math.floor((4 * a + 3) / 146097);
  const c = a - Math.floor(146097 * b / 4);
  const d = Math.floor((4 * c + 3) / 1461);
  const e = c - Math.floor(1461 * d / 4);
  const m = Math.floor((5 * e + 2) / 153);

  const day = e - Math.floor((153 * m + 2) / 5) + 1;
  const month = m + 3 - 12 * Math.floor(m / 10);
  const year = 100 * b + d - 4800 + Math.floor(m / 10);

  return new Date(year, month - 1, day);
}

export function hebrewToGregorian(year: number, month: number, day: number): Date {
  return jdnToGregorian(hebrewToJDN(year, month, day));
}

export function nextHebrewMonth(ym: HebrewYM): HebrewYM {
  const order = monthsInCivilOrder(ym.year);
  const idx = order.indexOf(ym.month);
  if (idx === order.length - 1) return { year: ym.year + 1, month: 7 }; // Elul → Tishrei
  return { year: ym.year, month: order[idx + 1] };
}

export function prevHebrewMonth(ym: HebrewYM): HebrewYM {
  const order = monthsInCivilOrder(ym.year);
  const idx = order.indexOf(ym.month);
  if (idx === 0) return { year: ym.year - 1, month: 6 }; // Tishrei → Elul
  return { year: ym.year, month: order[idx - 1] };
}

// 0 = Sunday .. 6 = Shabbat
export function firstWeekdayOfHebrewMonth(year: number, month: number): number {
  return (hebrewToJDN(year, month, 1) + 1) % 7;
}

export function toHebrewYMD(date: Date): { year: number; month: number; day: number } {
  const jdn = gregorianToJDN(date.getFullYear(), date.getMonth() + 1, date.getDate());
  return jdnToHebrew(jdn);
}

export function dateToJDN(date: Date): number {
  return gregorianToJDN(date.getFullYear(), date.getMonth() + 1, date.getDate());
}

export function formatHebrewDay(day: number): string {
  return formatGematria(day);
}

export function formatHebrewYear(year: number): string {
  return formatGematria(year % 1000); // drop thousands
}
