// Full structure of Shas: 6 Sedarim, each with Masachtot, each with perek mishna counts.
// Counts sourced from standard editions (Kehati / Albeck).

import { formatHebrewDay } from "../utils/hebrewDate";

export type MishnaEntry = {
  globalIndex: number; // 1-based sequential across all of Shas
  seder: string;
  masechet: string;
  perek: number; // 1-based
  mishna: number; // 1-based within perek
  label: string; // e.g. "ברכות פ״א מ״א"
};

type MasechetData = {
  name: string;
  perakim: number[]; // mishna count per perek
};

type SederData = {
  name: string;
  masachtot: MasechetData[];
};

const SHAS_STRUCTURE: SederData[] = [
  {
    name: "זרעים",
    masachtot: [
      { name: "ברכות", perakim: [5, 8, 6, 7, 5, 8, 5, 8, 5] },
      { name: "פאה", perakim: [6, 8, 8, 11, 8, 11, 8, 9] },
      { name: "דמאי", perakim: [4, 5, 6, 7, 11, 12, 8] },
      { name: "כלאים", perakim: [9, 11, 7, 9, 8, 9, 8, 6, 10] },
      { name: "שביעית", perakim: [8, 10, 10, 10, 9, 6, 7, 11, 9, 9] },
      { name: "תרומות", perakim: [10, 6, 9, 13, 9, 6, 7, 14, 7, 12, 10] },
      { name: "מעשרות", perakim: [8, 8, 10, 6, 8] },
      { name: "מעשר שני", perakim: [7, 10, 13, 12, 15] },
      { name: "חלה", perakim: [9, 8, 10, 11] },
      { name: "ערלה", perakim: [9, 17, 9] },
      { name: "בכורים", perakim: [11, 11, 12, 5] },
    ],
  },
  {
    name: "מועד",
    masachtot: [
      { name: "שבת", perakim: [11, 7, 6, 2, 4, 10, 4, 7, 7, 6, 6, 6, 7, 4, 3, 8, 8, 3, 6, 5, 3, 6, 5, 5] },
      { name: "עירובין", perakim: [10, 6, 9, 11, 9, 10, 11, 11, 4, 15] },
      { name: "פסחים", perakim: [7, 8, 8, 9, 10, 6, 13, 8, 11, 9] },
      { name: "שקלים", perakim: [7, 5, 4, 9, 6, 6, 7, 8] },
      { name: "יומא", perakim: [8, 7, 11, 6, 7, 8, 5, 9] },
      { name: "סוכה", perakim: [11, 9, 15, 10, 8] },
      { name: "ביצה", perakim: [10, 10, 8, 7, 7] },
      { name: "ראש השנה", perakim: [9, 8, 8, 9] },
      { name: "תענית", perakim: [7, 10, 9, 8] },
      { name: "מגילה", perakim: [11, 6, 6, 10] },
      { name: "מועד קטן", perakim: [10, 5, 9] },
      { name: "חגיגה", perakim: [8, 7, 8] },
    ],
  },
  {
    name: "נשים",
    masachtot: [
      { name: "יבמות", perakim: [4, 10, 10, 13, 11, 6, 6, 6, 6, 9, 7, 6, 13, 9, 10, 7] },
      { name: "כתובות", perakim: [10, 10, 9, 12, 9, 7, 9, 8, 9, 6, 6, 4, 11] },
      { name: "נדרים", perakim: [4, 5, 11, 8, 6, 10, 9, 7, 10, 8, 12] },
      { name: "נזיר", perakim: [7, 10, 7, 7, 7, 11, 4, 2, 5] },
      { name: "סוטה", perakim: [9, 6, 8, 3, 5, 4, 8, 7, 15] },
      { name: "גיטין", perakim: [6, 7, 8, 9, 9, 7, 9, 10, 10] },
      { name: "קידושין", perakim: [10, 10, 13, 14] },
    ],
  },
  {
    name: "נזיקין",
    masachtot: [
      { name: "בבא קמא", perakim: [4, 6, 11, 9, 7, 6, 7, 7, 12, 10] },
      { name: "בבא מציעא", perakim: [8, 11, 12, 12, 11, 8, 11, 9, 13, 6] },
      { name: "בבא בתרא", perakim: [6, 14, 9, 9, 11, 8, 4, 8, 10, 8] },
      { name: "סנהדרין", perakim: [6, 5, 8, 5, 5, 6, 11, 7, 6, 6, 6] },
      { name: "מכות", perakim: [10, 8, 16] },
      { name: "שבועות", perakim: [7, 5, 11, 13, 5, 7, 8, 6] },
      { name: "עדיות", perakim: [14, 10, 12, 12, 7, 3, 9, 7] },
      { name: "עבודה זרה", perakim: [9, 7, 10, 12, 12] },
      { name: "אבות", perakim: [18, 16, 18, 22, 23, 11] },
      { name: "הוריות", perakim: [5, 7, 8] },
    ],
  },
  {
    name: "קדשים",
    masachtot: [
      { name: "זבחים", perakim: [4, 5, 6, 6, 8, 7, 6, 12, 7, 8, 8, 6, 8, 10] },
      { name: "מנחות", perakim: [4, 5, 7, 5, 9, 7, 6, 7, 9, 9, 9, 5, 11] },
      { name: "חולין", perakim: [7, 10, 7, 7, 5, 7, 6, 6, 8, 4, 2, 5] },
      { name: "בכורות", perakim: [7, 9, 4, 10, 6, 12, 7, 10, 8] },
      { name: "ערכין", perakim: [4, 6, 5, 4, 6, 5, 5, 7, 8] },
      { name: "תמורה", perakim: [6, 3, 5, 4, 6, 5, 6] },
      { name: "כריתות", perakim: [7, 6, 10, 3, 8, 9] },
      { name: "מעילה", perakim: [4, 9, 8, 6, 5, 6] },
      { name: "תמיד", perakim: [4, 5, 9, 3, 6, 3, 4] },
      { name: "מידות", perakim: [9, 6, 8, 7, 4] },
      { name: "קינים", perakim: [4, 5, 6] },
    ],
  },
  {
    name: "טהרות",
    masachtot: [
      { name: "כלים", perakim: [9, 8, 8, 4, 11, 4, 6, 11, 8, 8, 9, 8, 8, 8, 6, 8, 17, 9, 10, 7, 3, 10, 5, 17, 9, 9, 12, 10, 8, 4] },
      { name: "אהלות", perakim: [8, 7, 7, 3, 7, 7, 6, 6, 16, 7, 9, 8, 6, 7, 10, 5, 5, 10] },
      { name: "נגעים", perakim: [6, 5, 8, 11, 5, 8, 5, 10, 3, 10, 12, 7, 12, 13] },
      { name: "פרה", perakim: [4, 5, 11, 4, 9, 5, 12, 11, 9, 6, 9, 11] },
      { name: "טהרות", perakim: [9, 8, 8, 13, 9, 10, 9, 9, 9, 8] },
      { name: "מקואות", perakim: [8, 10, 4, 5, 6, 11, 7, 5, 7, 8] },
      { name: "נדה", perakim: [7, 7, 7, 7, 9, 14, 5, 4, 11, 8] },
      { name: "מכשירין", perakim: [6, 11, 8, 10, 11, 8] },
      { name: "זבים", perakim: [6, 4, 3, 7, 12] },
      { name: "טבול יום", perakim: [5, 8, 6, 7] },
      { name: "ידים", perakim: [5, 4, 5, 8] },
      { name: "עוקצין", perakim: [6, 10, 12] },
    ],
  },
];

// Hebrew letter numerals for ordinal display (א, ב, ג, ...)
const HEBREW_NUMERALS: Record<number, string> = {
  1: "א", 2: "ב", 3: "ג", 4: "ד", 5: "ה",
  6: "ו", 7: "ז", 8: "ח", 9: "ט", 10: "י",
  11: "יא", 12: "יב", 13: "יג", 14: "יד", 15: "טו",
  16: "טז", 17: "יז", 18: "יח", 19: "יט", 20: "כ",
  21: "כא", 22: "כב", 23: "כג", 24: "כד", 25: "כה",
  26: "כו", 27: "כז", 28: "כח", 29: "כט", 30: "ל",
};

function hebrewOrdinal(n: number): string {
  return HEBREW_NUMERALS[n] ?? String(n);
}

// Build flat list once at module load
let _flatList: MishnaEntry[] | null = null;

export function getAllMishnayot(): MishnaEntry[] {
  if (_flatList) return _flatList;

  const list: MishnaEntry[] = [];
  let globalIndex = 1;

  for (const seder of SHAS_STRUCTURE) {
    for (const masechet of seder.masachtot) {
      for (let p = 0; p < masechet.perakim.length; p++) {
        const perekNum = p + 1;
        const mishnaCount = masechet.perakim[p];
        for (let m = 1; m <= mishnaCount; m++) {
          list.push({
            globalIndex,
            seder: seder.name,
            masechet: masechet.name,
            perek: perekNum,
            mishna: m,
            label: `${masechet.name} פ״${hebrewOrdinal(perekNum)} מ״${hebrewOrdinal(m)}`,
          });
          globalIndex++;
        }
      }
    }
  }

  _flatList = list;
  return list;
}

// Flat perek list for the daily-perek track

export type PerekEntry = {
  index: number; // 1-based sequential perek index across all of Shas
  seder: string;
  masechet: string;
  perek: number;
  mishnaCount: number;
  label: string; // e.g. "ברכות פרק א׳"
};

let _perekList: PerekEntry[] | null = null;

export function getAllPerakim(): PerekEntry[] {
  if (_perekList) return _perekList;

  const list: PerekEntry[] = [];
  let index = 1;
  for (const seder of SHAS_STRUCTURE) {
    for (const masechet of seder.masachtot) {
      for (let p = 0; p < masechet.perakim.length; p++) {
        list.push({
          index,
          seder: seder.name,
          masechet: masechet.name,
          perek: p + 1,
          mishnaCount: masechet.perakim[p],
          label: `${masechet.name} פרק ${formatHebrewDay(p + 1)}`,
        });
        index++;
      }
    }
  }

  _perekList = list;
  return list;
}

export function getPerekCount(): number {
  return getAllPerakim().length;
}

export function getPerekByIndex(index: number): PerekEntry | undefined {
  return getAllPerakim()[index - 1];
}

export function getIndexForPerek(
  sederName: string,
  masechetName: string,
  perekNum: number
): number {
  const entry = getAllPerakim().find(
    (e) => e.seder === sederName && e.masechet === masechetName && e.perek === perekNum
  );
  return entry?.index ?? 1;
}

export function getMishnaByIndex(index: number): MishnaEntry | undefined {
  const list = getAllMishnayot();
  return list[index - 1]; // convert 1-based to 0-based
}

export function getMishnaCount(): number {
  return getAllMishnayot().length;
}

export function getSederList(): string[] {
  return SHAS_STRUCTURE.map((s) => s.name);
}

export function getMasachtotForSeder(sederName: string): string[] {
  const seder = SHAS_STRUCTURE.find((s) => s.name === sederName);
  return seder ? seder.masachtot.map((m) => m.name) : [];
}

export function getPerakimCount(sederName: string, masechetName: string): number {
  const seder = SHAS_STRUCTURE.find((s) => s.name === sederName);
  const masechet = seder?.masachtot.find((m) => m.name === masechetName);
  return masechet ? masechet.perakim.length : 0;
}

export function getMishnotCountForPerek(
  sederName: string,
  masechetName: string,
  perekNum: number
): number {
  const seder = SHAS_STRUCTURE.find((s) => s.name === sederName);
  const masechet = seder?.masachtot.find((m) => m.name === masechetName);
  return masechet ? masechet.perakim[perekNum - 1] ?? 0 : 0;
}

export function getGlobalIndexFor(
  sederName: string,
  masechetName: string,
  perekNum: number,
  mishnaNum: number
): number {
  const list = getAllMishnayot();
  const entry = list.find(
    (e) =>
      e.seder === sederName &&
      e.masechet === masechetName &&
      e.perek === perekNum &&
      e.mishna === mishnaNum
  );
  return entry?.globalIndex ?? 1;
}

// ─── Group ranges (one entry per masechet) for selective study ────────────

export type MishnaGroup = {
  seder: string;
  masechet: string;
  startIndex: number;
  endIndex: number;
};

let _mishnaGroups: MishnaGroup[] | null = null;
let _perekGroups: MishnaGroup[] | null = null;

// Bucket a canonically-ordered flat list into contiguous per-masechet ranges.
function buildGroups(
  entries: { seder: string; masechet: string; index: number }[]
): MishnaGroup[] {
  const groups: MishnaGroup[] = [];
  for (const e of entries) {
    const last = groups[groups.length - 1];
    if (last && last.masechet === e.masechet && last.seder === e.seder) {
      last.endIndex = e.index;
    } else {
      groups.push({
        seder: e.seder,
        masechet: e.masechet,
        startIndex: e.index,
        endIndex: e.index,
      });
    }
  }
  return groups;
}

export function getMishnaGroups(): MishnaGroup[] {
  if (_mishnaGroups) return _mishnaGroups;
  _mishnaGroups = buildGroups(
    getAllMishnayot().map((e) => ({
      seder: e.seder,
      masechet: e.masechet,
      index: e.globalIndex,
    }))
  );
  return _mishnaGroups;
}

export function getPerekGroups(): MishnaGroup[] {
  if (_perekGroups) return _perekGroups;
  _perekGroups = buildGroups(
    getAllPerakim().map((e) => ({
      seder: e.seder,
      masechet: e.masechet,
      index: e.index,
    }))
  );
  return _perekGroups;
}
