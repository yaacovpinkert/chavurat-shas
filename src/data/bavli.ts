// Talmud Bavli structure (Vilna edition pagination, Daf Yomi order).
// Dapim normally start at daf 2; Kinnim/Tamid/Middot continue Meilah's
// pagination, so they carry an explicit firstDaf. Total: 2,711 dapim.

import { formatHebrewDay } from "../utils/hebrewDate";

type BavliMasechet = {
  name: string;
  seder: string;
  firstDaf: number;
  lastDaf: number;
};

const BAVLI_STRUCTURE: BavliMasechet[] = [
  { name: "ברכות", seder: "זרעים", firstDaf: 2, lastDaf: 64 },
  { name: "שבת", seder: "מועד", firstDaf: 2, lastDaf: 157 },
  { name: "עירובין", seder: "מועד", firstDaf: 2, lastDaf: 105 },
  { name: "פסחים", seder: "מועד", firstDaf: 2, lastDaf: 121 },
  { name: "שקלים", seder: "מועד", firstDaf: 2, lastDaf: 22 },
  { name: "יומא", seder: "מועד", firstDaf: 2, lastDaf: 88 },
  { name: "סוכה", seder: "מועד", firstDaf: 2, lastDaf: 56 },
  { name: "ביצה", seder: "מועד", firstDaf: 2, lastDaf: 40 },
  { name: "ראש השנה", seder: "מועד", firstDaf: 2, lastDaf: 35 },
  { name: "תענית", seder: "מועד", firstDaf: 2, lastDaf: 31 },
  { name: "מגילה", seder: "מועד", firstDaf: 2, lastDaf: 32 },
  { name: "מועד קטן", seder: "מועד", firstDaf: 2, lastDaf: 29 },
  { name: "חגיגה", seder: "מועד", firstDaf: 2, lastDaf: 27 },
  { name: "יבמות", seder: "נשים", firstDaf: 2, lastDaf: 122 },
  { name: "כתובות", seder: "נשים", firstDaf: 2, lastDaf: 112 },
  { name: "נדרים", seder: "נשים", firstDaf: 2, lastDaf: 91 },
  { name: "נזיר", seder: "נשים", firstDaf: 2, lastDaf: 66 },
  { name: "סוטה", seder: "נשים", firstDaf: 2, lastDaf: 49 },
  { name: "גיטין", seder: "נשים", firstDaf: 2, lastDaf: 90 },
  { name: "קידושין", seder: "נשים", firstDaf: 2, lastDaf: 82 },
  { name: "בבא קמא", seder: "נזיקין", firstDaf: 2, lastDaf: 119 },
  { name: "בבא מציעא", seder: "נזיקין", firstDaf: 2, lastDaf: 119 },
  { name: "בבא בתרא", seder: "נזיקין", firstDaf: 2, lastDaf: 176 },
  { name: "סנהדרין", seder: "נזיקין", firstDaf: 2, lastDaf: 113 },
  { name: "מכות", seder: "נזיקין", firstDaf: 2, lastDaf: 24 },
  { name: "שבועות", seder: "נזיקין", firstDaf: 2, lastDaf: 49 },
  { name: "עבודה זרה", seder: "נזיקין", firstDaf: 2, lastDaf: 76 },
  { name: "הוריות", seder: "נזיקין", firstDaf: 2, lastDaf: 14 },
  { name: "זבחים", seder: "קדשים", firstDaf: 2, lastDaf: 120 },
  { name: "מנחות", seder: "קדשים", firstDaf: 2, lastDaf: 110 },
  { name: "חולין", seder: "קדשים", firstDaf: 2, lastDaf: 142 },
  { name: "בכורות", seder: "קדשים", firstDaf: 2, lastDaf: 61 },
  { name: "ערכין", seder: "קדשים", firstDaf: 2, lastDaf: 34 },
  { name: "תמורה", seder: "קדשים", firstDaf: 2, lastDaf: 34 },
  { name: "כריתות", seder: "קדשים", firstDaf: 2, lastDaf: 28 },
  { name: "מעילה", seder: "קדשים", firstDaf: 2, lastDaf: 22 },
  { name: "קינים", seder: "קדשים", firstDaf: 23, lastDaf: 25 },
  { name: "תמיד", seder: "קדשים", firstDaf: 26, lastDaf: 33 },
  { name: "מדות", seder: "קדשים", firstDaf: 34, lastDaf: 37 },
  { name: "נדה", seder: "טהרות", firstDaf: 2, lastDaf: 73 },
];

export type DafEntry = {
  index: number; // 1-based global daf index
  masechet: string;
  daf: number;
  label: string; // "ברכות דף ב׳"
};

let _dafList: DafEntry[] | null = null;

export function getAllDapim(): DafEntry[] {
  if (_dafList) return _dafList;

  const list: DafEntry[] = [];
  let index = 1;
  for (const m of BAVLI_STRUCTURE) {
    for (let daf = m.firstDaf; daf <= m.lastDaf; daf++) {
      list.push({
        index,
        masechet: m.name,
        daf,
        label: `${m.name} דף ${formatHebrewDay(daf)}`,
      });
      index++;
    }
  }

  _dafList = list;
  return list;
}

export function getDafCount(): number {
  return getAllDapim().length;
}

export function getDafByIndex(index: number): DafEntry | undefined {
  return getAllDapim()[index - 1];
}

export function getBavliMasechtot(): string[] {
  return BAVLI_STRUCTURE.map((m) => m.name);
}

export function getDafRange(masechetName: string): { firstDaf: number; lastDaf: number } {
  const m = BAVLI_STRUCTURE.find((x) => x.name === masechetName);
  return m ? { firstDaf: m.firstDaf, lastDaf: m.lastDaf } : { firstDaf: 2, lastDaf: 2 };
}

export function getIndexForDaf(masechetName: string, daf: number): number {
  const entry = getAllDapim().find((e) => e.masechet === masechetName && e.daf === daf);
  return entry?.index ?? 1;
}

// ─── Amud (half-daf) view over the same structure ─────────────────────────

export type AmudEntry = {
  index: number; // 1-based global amud index
  masechet: string;
  daf: number;
  amud: 1 | 2;
  label: string; // "ברכות דף ב׳ ע״א"
};

export function getAmudCount(): number {
  return getDafCount() * 2;
}

export function getAmudByIndex(index: number): AmudEntry | undefined {
  const dafEntry = getDafByIndex(Math.ceil(index / 2));
  if (!dafEntry) return undefined;
  const amud = (index % 2 === 1 ? 1 : 2) as 1 | 2;
  return {
    index,
    masechet: dafEntry.masechet,
    daf: dafEntry.daf,
    amud,
    label: `${dafEntry.label} ${amud === 1 ? "ע״א" : "ע״ב"}`,
  };
}

export function getIndexForAmud(masechetName: string, daf: number, amud: 1 | 2): number {
  return (getIndexForDaf(masechetName, daf) - 1) * 2 + amud;
}

// ─── Group ranges (one entry per masechet) for selective study ────────────

export type BavliGroup = {
  seder: string;
  masechet: string;
  startIndex: number;
  endIndex: number;
};

let _dafGroups: BavliGroup[] | null = null;
let _amudGroups: BavliGroup[] | null = null;

export function getDafGroups(): BavliGroup[] {
  if (_dafGroups) return _dafGroups;
  const groups: BavliGroup[] = [];
  let index = 1;
  for (const m of BAVLI_STRUCTURE) {
    const count = m.lastDaf - m.firstDaf + 1;
    groups.push({
      seder: m.seder,
      masechet: m.name,
      startIndex: index,
      endIndex: index + count - 1,
    });
    index += count;
  }
  _dafGroups = groups;
  return groups;
}

export function getAmudGroups(): BavliGroup[] {
  if (_amudGroups) return _amudGroups;
  // Each daf is two amudim, so amud ranges are the daf ranges scaled ×2.
  _amudGroups = getDafGroups().map((g) => ({
    seder: g.seder,
    masechet: g.masechet,
    startIndex: (g.startIndex - 1) * 2 + 1,
    endIndex: g.endIndex * 2,
  }));
  return _amudGroups;
}
