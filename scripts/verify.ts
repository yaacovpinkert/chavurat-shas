// Temporary verification script (run: npx tsx scripts/verify.ts)
import {
  toHebrewYMD,
  hebrewToGregorian,
  nextHebrewMonth,
  prevHebrewMonth,
  getHebrewMonthName,
  daysInHebrewMonth,
  firstWeekdayOfHebrewMonth,
  getHebrewMonthsInYear,
  toHebrewDate,
} from "../src/utils/hebrewDate";
import { getDafCount, getAmudCount, getDafByIndex, getAmudByIndex } from "../src/data/bavli";
import { getTanachChapterCount, getTanachChapterByIndex } from "../src/data/tanach";
import { getPerekCount, getMishnaCount, getPerekByIndex } from "../src/data/mishnayot";

let failures = 0;
function check(name: string, cond: boolean, extra?: unknown) {
  if (!cond) {
    failures++;
    console.log("FAIL:", name, extra ?? "");
  } else {
    console.log("ok:  ", name);
  }
}

// ── data counts ──
check("bavli dapim = 2711", getDafCount() === 2711, getDafCount());
check("bavli amudim = 5422", getAmudCount() === 5422, getAmudCount());
check("tanach chapters = 929", getTanachChapterCount() === 929, getTanachChapterCount());
check("mishna perakim = 525", getPerekCount() === 525, getPerekCount());
console.log("mishnayot count:", getMishnaCount());
console.log("first daf:", getDafByIndex(1)?.label, "| last daf:", getDafByIndex(2711)?.label);
console.log("amud 1:", getAmudByIndex(1)?.label, "| amud 2:", getAmudByIndex(2)?.label, "| last:", getAmudByIndex(5422)?.label);
console.log("first perek:", getPerekByIndex(1)?.label, "| last:", getPerekByIndex(525)?.label);
console.log("tanach 1:", getTanachChapterByIndex(1)?.label, "| 929:", getTanachChapterByIndex(929)?.label);

// ── Hebrew date round-trip over ~6 years ──
let bad = 0;
for (let i = 0; i < 365 * 6; i++) {
  const d = new Date(2023, 0, 1 + i);
  const h = toHebrewYMD(d);
  const g = hebrewToGregorian(h.year, h.month, h.day);
  if (
    g.getFullYear() !== d.getFullYear() ||
    g.getMonth() !== d.getMonth() ||
    g.getDate() !== d.getDate()
  ) {
    bad++;
    if (bad < 5) console.log("MISMATCH", d.toDateString(), h, g.toDateString());
  }
}
check("round-trip 2023-2028", bad === 0, `${bad} mismatches`);

// ── known dates ──
const today = new Date(2026, 5, 10);
console.log("2026-06-10 =", toHebrewDate(today).full);

// leap year 5784 months include both Adars
const months5784 = getHebrewMonthsInYear(5784).map((m) => m.name);
check("5784 has אדר א׳ + אדר ב׳", months5784.includes("אדר א׳") && months5784.includes("אדר ב׳"), months5784.join(","));
const months5786 = getHebrewMonthsInYear(5786).map((m) => m.name);
check("5786 has plain אדר", months5786.includes("אדר") && !months5786.includes("אדר א׳"), months5786.join(","));

// month navigation across Adar in leap year
let ym = { year: 5784, month: 11 }; // שבט
const seq: string[] = [];
for (let i = 0; i < 3; i++) {
  ym = nextHebrewMonth(ym);
  seq.push(getHebrewMonthName(ym.month, ym.year));
}
check("שבט→אדר א׳→אדר ב׳→ניסן (5784)", seq.join(",") === "אדר א׳,אדר ב׳,ניסן", seq.join(","));

// Elul→Tishrei boundary both directions
const afterElul = nextHebrewMonth({ year: 5786, month: 6 });
check("אלול 5786 → תשרי 5787", afterElul.year === 5787 && afterElul.month === 7, afterElul);
const beforeTishrei = prevHebrewMonth({ year: 5787, month: 7 });
check("תשרי 5787 → אלול 5786", beforeTishrei.year === 5786 && beforeTishrei.month === 6, beforeTishrei);

// Cheshvan/Kislev variable lengths
for (const y of [5785, 5786, 5787]) {
  console.log(y, "חשון:", daysInHebrewMonth(y, 8), "כסלו:", daysInHebrewMonth(y, 9));
}

// external anchors (known civil dates of Hebrew dates)
function sameDay(d: Date, y: number, m: number, day: number) {
  return d.getFullYear() === y && d.getMonth() === m - 1 && d.getDate() === day;
}
check("א' תשרי תשפ\"ו = 23.9.2025", sameDay(hebrewToGregorian(5786, 7, 1), 2025, 9, 23), hebrewToGregorian(5786, 7, 1).toDateString());
check("א' תשרי תשפ\"ד = 16.9.2023", sameDay(hebrewToGregorian(5784, 7, 1), 2023, 9, 16), hebrewToGregorian(5784, 7, 1).toDateString());
check("ט\"ו ניסן תשפ\"ו = 2.4.2026", sameDay(hebrewToGregorian(5786, 1, 15), 2026, 4, 2), hebrewToGregorian(5786, 1, 15).toDateString());
check("א' סיון תשפ\"ו = 17.5.2026", sameDay(hebrewToGregorian(5786, 3, 1), 2026, 5, 17), hebrewToGregorian(5786, 3, 1).toDateString());
check("10.6.2026 = כ\"ה בסיון", toHebrewDate(new Date(2026, 5, 10)).short === "כ״ה בסיון", toHebrewDate(new Date(2026, 5, 10)).full);

// weekday sanity: weekday of 1st of month matches the Gregorian weekday
{
  const g = hebrewToGregorian(5786, 3, 1); // א' סיון תשפ"ו
  check(
    "firstWeekdayOfHebrewMonth matches JS getDay",
    firstWeekdayOfHebrewMonth(5786, 3) === g.getDay(),
    `${firstWeekdayOfHebrewMonth(5786, 3)} vs ${g.getDay()} (${g.toDateString()})`
  );
}

console.log(failures === 0 ? "\nALL CHECKS PASSED" : `\n${failures} FAILURES`);
process.exit(failures === 0 ? 0 : 1);
