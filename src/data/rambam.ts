// Mishneh Torah (Rambam) structure — 14 books, 83 הלכות, 1,000 chapters total.
// One chapter per day (רמב"ם יומי) completes the full work in ~3 years.

import { formatHebrewDay } from "../utils/hebrewDate";

type RambamBook = {
  name: string; // ספר name
  halakhot: { name: string; chapters: number }[];
};

const RAMBAM_STRUCTURE: RambamBook[] = [
  {
    name: "ספר המדע",
    halakhot: [
      { name: "הלכות יסודי התורה", chapters: 10 },
      { name: "הלכות דעות", chapters: 7 },
      { name: "הלכות תלמוד תורה", chapters: 7 },
      { name: "הלכות עבודה זרה", chapters: 12 },
      { name: "הלכות תשובה", chapters: 10 },
    ],
  },
  {
    name: "ספר אהבה",
    halakhot: [
      { name: "הלכות קריאת שמע", chapters: 4 },
      { name: "הלכות תפילה", chapters: 15 },
      { name: "הלכות תפילין מזוזה וספר תורה", chapters: 10 },
      { name: "הלכות ציצית", chapters: 3 },
      { name: "הלכות ברכות", chapters: 11 },
      { name: "הלכות מילה", chapters: 3 },
    ],
  },
  {
    name: "ספר זמנים",
    halakhot: [
      { name: "הלכות שבת", chapters: 30 },
      { name: "הלכות עירובין", chapters: 8 },
      { name: "הלכות שביתת עשור", chapters: 3 },
      { name: "הלכות שביתת יום טוב", chapters: 8 },
      { name: "הלכות חמץ ומצה", chapters: 8 },
      { name: "הלכות שופר וסוכה ולולב", chapters: 8 },
      { name: "הלכות שקלים", chapters: 4 },
      { name: "הלכות קידוש החודש", chapters: 19 },
      { name: "הלכות תעניות", chapters: 5 },
      { name: "הלכות מגילה וחנוכה", chapters: 4 },
    ],
  },
  {
    name: "ספר נשים",
    halakhot: [
      { name: "הלכות אישות", chapters: 25 },
      { name: "הלכות גירושין", chapters: 13 },
      { name: "הלכות יבום וחליצה", chapters: 8 },
      { name: "הלכות נערה בתולה", chapters: 3 },
      { name: "הלכות סוטה", chapters: 4 },
    ],
  },
  {
    name: "ספר קדושה",
    halakhot: [
      { name: "הלכות איסורי ביאה", chapters: 22 },
      { name: "הלכות מאכלות אסורות", chapters: 17 },
      { name: "הלכות שחיטה", chapters: 14 },
    ],
  },
  {
    name: "ספר הפלאה",
    halakhot: [
      { name: "הלכות שבועות", chapters: 12 },
      { name: "הלכות נדרים", chapters: 13 },
      { name: "הלכות נזירות", chapters: 10 },
      { name: "הלכות ערכין וחרמין", chapters: 8 },
    ],
  },
  {
    name: "ספר זרעים",
    halakhot: [
      { name: "הלכות כלאים", chapters: 10 },
      { name: "הלכות מתנות עניים", chapters: 10 },
      { name: "הלכות תרומות", chapters: 15 },
      { name: "הלכות מעשר", chapters: 14 },
      { name: "הלכות מעשר שני ונטע רבעי", chapters: 11 },
      { name: "הלכות ביכורים ושאר מתנות כהונה שבגבולין", chapters: 12 },
      { name: "הלכות שמיטה ויובל", chapters: 13 },
    ],
  },
  {
    name: "ספר עבודה",
    halakhot: [
      { name: "הלכות בית הבחירה", chapters: 8 },
      { name: "הלכות כלי המקדש והעובדים בו", chapters: 10 },
      { name: "הלכות ביאת המקדש", chapters: 9 },
      { name: "הלכות איסורי מזבח", chapters: 7 },
      { name: "הלכות מעשה הקרבנות", chapters: 19 },
      { name: "הלכות תמידין ומוספין", chapters: 10 },
      { name: "הלכות פסולי המוקדשין", chapters: 19 },
      { name: "הלכות עבודת יום הכיפורים", chapters: 5 },
      { name: "הלכות מעילה", chapters: 8 },
    ],
  },
  {
    name: "ספר קרבנות",
    halakhot: [
      { name: "הלכות קרבן פסח", chapters: 10 },
      { name: "הלכות חגיגה", chapters: 3 },
      { name: "הלכות בכורות", chapters: 8 },
      { name: "הלכות שגגות", chapters: 15 },
      { name: "הלכות מחוסרי כפרה", chapters: 5 },
      { name: "הלכות תמורה", chapters: 4 },
    ],
  },
  {
    name: "ספר טהרה",
    halakhot: [
      { name: "הלכות טומאת מת", chapters: 25 },
      { name: "הלכות פרה אדומה", chapters: 15 },
      { name: "הלכות טומאת צרעת", chapters: 16 },
      { name: "הלכות מטמאי משכב ומושב", chapters: 13 },
      { name: "הלכות שאר אבות הטומאות", chapters: 20 },
      { name: "הלכות טומאת אוכלין", chapters: 16 },
      { name: "הלכות כלים", chapters: 28 },
      { name: "הלכות מקוואות", chapters: 11 },
    ],
  },
  {
    name: "ספר נזיקין",
    halakhot: [
      { name: "הלכות נזקי ממון", chapters: 14 },
      { name: "הלכות גניבה", chapters: 9 },
      { name: "הלכות גזלה ואבדה", chapters: 18 },
      { name: "הלכות חובל ומזיק", chapters: 8 },
      { name: "הלכות רוצח ושמירת נפש", chapters: 13 },
    ],
  },
  {
    name: "ספר קנין",
    halakhot: [
      { name: "הלכות מכירה", chapters: 30 },
      { name: "הלכות זכייה ומתנה", chapters: 12 },
      { name: "הלכות שכנים", chapters: 14 },
      { name: "הלכות שלוחין ושותפין", chapters: 10 },
      { name: "הלכות עבדים", chapters: 9 },
    ],
  },
  {
    name: "ספר משפטים",
    halakhot: [
      { name: "הלכות שכירות", chapters: 13 },
      { name: "הלכות שאלה ופיקדון", chapters: 8 },
      { name: "הלכות מלוה ולוה", chapters: 27 },
      { name: "הלכות טוען ונטען", chapters: 16 },
      { name: "הלכות נחלות", chapters: 11 },
    ],
  },
  {
    name: "ספר שופטים",
    halakhot: [
      { name: "הלכות סנהדרין", chapters: 26 },
      { name: "הלכות עדות", chapters: 22 },
      { name: "הלכות ממרים", chapters: 7 },
      { name: "הלכות אבל", chapters: 14 },
      { name: "הלכות מלכים ומלחמותיהם", chapters: 12 },
    ],
  },
];

export type RambamChapterEntry = {
  index: number;   // 1-based global chapter index
  book: string;    // ספר name
  halakha: string; // הלכות name
  chapter: number; // chapter number within the הלכות
  label: string;   // e.g. "הלכות יסודי התורה פרק א׳"
};

let _chapterList: RambamChapterEntry[] | null = null;

export function getAllRambamChapters(): RambamChapterEntry[] {
  if (_chapterList) return _chapterList;

  const list: RambamChapterEntry[] = [];
  let index = 1;
  for (const book of RAMBAM_STRUCTURE) {
    for (const halakha of book.halakhot) {
      for (let c = 1; c <= halakha.chapters; c++) {
        list.push({
          index,
          book: book.name,
          halakha: halakha.name,
          chapter: c,
          label: `${halakha.name} פרק ${formatHebrewDay(c)}`,
        });
        index++;
      }
    }
  }

  _chapterList = list;
  return list;
}

export function getRambamChapterCount(): number {
  return getAllRambamChapters().length;
}

export function getRambamChapterByIndex(index: number): RambamChapterEntry | undefined {
  return getAllRambamChapters()[index - 1];
}

export function getRambamBooks(): string[] {
  return RAMBAM_STRUCTURE.map((b) => b.name);
}

export function getHalakhotForBook(bookName: string): string[] {
  return RAMBAM_STRUCTURE.find((b) => b.name === bookName)?.halakhot.map((h) => h.name) ?? [];
}

export function getChapterCountForHalakha(bookName: string, halakhaName: string): number {
  const book = RAMBAM_STRUCTURE.find((b) => b.name === bookName);
  return book?.halakhot.find((h) => h.name === halakhaName)?.chapters ?? 0;
}

export function getIndexForRambamChapter(bookName: string, halakhaName: string, chapter: number): number {
  const entry = getAllRambamChapters().find(
    (e) => e.book === bookName && e.halakha === halakhaName && e.chapter === chapter
  );
  return entry?.index ?? 1;
}

// ─── Group ranges (one entry per הלכות) for selective study ──────────────────

export type RambamGroup = {
  book: string;
  halakha: string;
  startIndex: number;
  endIndex: number;
};

let _rambamGroups: RambamGroup[] | null = null;

export function getRambamGroups(): RambamGroup[] {
  if (_rambamGroups) return _rambamGroups;
  const groups: RambamGroup[] = [];
  let index = 1;
  for (const book of RAMBAM_STRUCTURE) {
    for (const halakha of book.halakhot) {
      groups.push({
        book: book.name,
        halakha: halakha.name,
        startIndex: index,
        endIndex: index + halakha.chapters - 1,
      });
      index += halakha.chapters;
    }
  }
  _rambamGroups = groups;
  return groups;
}
