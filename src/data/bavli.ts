// Talmud Bavli structure (Vilna edition pagination, Daf Yomi order).
// Dapim normally start at daf 2; Kinnim/Tamid/Middot continue Meilah's
// pagination, so they carry an explicit firstDaf. Total: 2,711 dapim.

import { formatHebrewDay } from "../utils/hebrewDate";

type BavliMasechet = {
  name: string;
  firstDaf: number;
  lastDaf: number;
};

const BAVLI_STRUCTURE: BavliMasechet[] = [
  { name: "ברכות", firstDaf: 2, lastDaf: 64 },
  { name: "שבת", firstDaf: 2, lastDaf: 157 },
  { name: "עירובין", firstDaf: 2, lastDaf: 105 },
  { name: "פסחים", firstDaf: 2, lastDaf: 121 },
  { name: "שקלים", firstDaf: 2, lastDaf: 22 },
  { name: "יומא", firstDaf: 2, lastDaf: 88 },
  { name: "סוכה", firstDaf: 2, lastDaf: 56 },
  { name: "ביצה", firstDaf: 2, lastDaf: 40 },
  { name: "ראש השנה", firstDaf: 2, lastDaf: 35 },
  { name: "תענית", firstDaf: 2, lastDaf: 31 },
  { name: "מגילה", firstDaf: 2, lastDaf: 32 },
  { name: "מועד קטן", firstDaf: 2, lastDaf: 29 },
  { name: "חגיגה", firstDaf: 2, lastDaf: 27 },
  { name: "יבמות", firstDaf: 2, lastDaf: 122 },
  { name: "כתובות", firstDaf: 2, lastDaf: 112 },
  { name: "נדרים", firstDaf: 2, lastDaf: 91 },
  { name: "נזיר", firstDaf: 2, lastDaf: 66 },
  { name: "סוטה", firstDaf: 2, lastDaf: 49 },
  { name: "גיטין", firstDaf: 2, lastDaf: 90 },
  { name: "קידושין", firstDaf: 2, lastDaf: 82 },
  { name: "בבא קמא", firstDaf: 2, lastDaf: 119 },
  { name: "בבא מציעא", firstDaf: 2, lastDaf: 119 },
  { name: "בבא בתרא", firstDaf: 2, lastDaf: 176 },
  { name: "סנהדרין", firstDaf: 2, lastDaf: 113 },
  { name: "מכות", firstDaf: 2, lastDaf: 24 },
  { name: "שבועות", firstDaf: 2, lastDaf: 49 },
  { name: "עבודה זרה", firstDaf: 2, lastDaf: 76 },
  { name: "הוריות", firstDaf: 2, lastDaf: 14 },
  { name: "זבחים", firstDaf: 2, lastDaf: 120 },
  { name: "מנחות", firstDaf: 2, lastDaf: 110 },
  { name: "חולין", firstDaf: 2, lastDaf: 142 },
  { name: "בכורות", firstDaf: 2, lastDaf: 61 },
  { name: "ערכין", firstDaf: 2, lastDaf: 34 },
  { name: "תמורה", firstDaf: 2, lastDaf: 34 },
  { name: "כריתות", firstDaf: 2, lastDaf: 28 },
  { name: "מעילה", firstDaf: 2, lastDaf: 22 },
  { name: "קינים", firstDaf: 23, lastDaf: 25 },
  { name: "תמיד", firstDaf: 26, lastDaf: 33 },
  { name: "מדות", firstDaf: 34, lastDaf: 37 },
  { name: "נדה", firstDaf: 2, lastDaf: 73 },
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
