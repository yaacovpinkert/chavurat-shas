// Tanach structure — Masoretic (Hebrew) chapter divisions. Total: 929 chapters.

import { formatHebrewDay } from "../utils/hebrewDate";

type TanachSection = "תורה" | "נביאים" | "כתובים";

type TanachBook = {
  name: string;
  section: TanachSection;
  chapters: number;
};

const TANACH_STRUCTURE: TanachBook[] = [
  { name: "בראשית", section: "תורה", chapters: 50 },
  { name: "שמות", section: "תורה", chapters: 40 },
  { name: "ויקרא", section: "תורה", chapters: 27 },
  { name: "במדבר", section: "תורה", chapters: 36 },
  { name: "דברים", section: "תורה", chapters: 34 },
  { name: "יהושע", section: "נביאים", chapters: 24 },
  { name: "שופטים", section: "נביאים", chapters: 21 },
  { name: "שמואל א", section: "נביאים", chapters: 31 },
  { name: "שמואל ב", section: "נביאים", chapters: 24 },
  { name: "מלכים א", section: "נביאים", chapters: 22 },
  { name: "מלכים ב", section: "נביאים", chapters: 25 },
  { name: "ישעיהו", section: "נביאים", chapters: 66 },
  { name: "ירמיהו", section: "נביאים", chapters: 52 },
  { name: "יחזקאל", section: "נביאים", chapters: 48 },
  { name: "הושע", section: "נביאים", chapters: 14 },
  { name: "יואל", section: "נביאים", chapters: 4 },
  { name: "עמוס", section: "נביאים", chapters: 9 },
  { name: "עובדיה", section: "נביאים", chapters: 1 },
  { name: "יונה", section: "נביאים", chapters: 4 },
  { name: "מיכה", section: "נביאים", chapters: 7 },
  { name: "נחום", section: "נביאים", chapters: 3 },
  { name: "חבקוק", section: "נביאים", chapters: 3 },
  { name: "צפניה", section: "נביאים", chapters: 3 },
  { name: "חגי", section: "נביאים", chapters: 2 },
  { name: "זכריה", section: "נביאים", chapters: 14 },
  { name: "מלאכי", section: "נביאים", chapters: 3 },
  { name: "תהלים", section: "כתובים", chapters: 150 },
  { name: "משלי", section: "כתובים", chapters: 31 },
  { name: "איוב", section: "כתובים", chapters: 42 },
  { name: "שיר השירים", section: "כתובים", chapters: 8 },
  { name: "רות", section: "כתובים", chapters: 4 },
  { name: "איכה", section: "כתובים", chapters: 5 },
  { name: "קהלת", section: "כתובים", chapters: 12 },
  { name: "אסתר", section: "כתובים", chapters: 10 },
  { name: "דניאל", section: "כתובים", chapters: 12 },
  { name: "עזרא", section: "כתובים", chapters: 10 },
  { name: "נחמיה", section: "כתובים", chapters: 13 },
  { name: "דברי הימים א", section: "כתובים", chapters: 29 },
  { name: "דברי הימים ב", section: "כתובים", chapters: 36 },
];

export type TanachChapterEntry = {
  index: number; // 1-based global chapter index
  book: string;
  chapter: number;
  label: string; // "בראשית פרק א׳"
};

let _chapterList: TanachChapterEntry[] | null = null;

export function getAllTanachChapters(): TanachChapterEntry[] {
  if (_chapterList) return _chapterList;

  const list: TanachChapterEntry[] = [];
  let index = 1;
  for (const book of TANACH_STRUCTURE) {
    for (let c = 1; c <= book.chapters; c++) {
      list.push({
        index,
        book: book.name,
        chapter: c,
        label: `${book.name} פרק ${formatHebrewDay(c)}`,
      });
      index++;
    }
  }

  _chapterList = list;
  return list;
}

export function getTanachChapterCount(): number {
  return getAllTanachChapters().length;
}

export function getTanachChapterByIndex(index: number): TanachChapterEntry | undefined {
  return getAllTanachChapters()[index - 1];
}

export function getTanachBooks(): string[] {
  return TANACH_STRUCTURE.map((b) => b.name);
}

export function getChapterCountForBook(bookName: string): number {
  return TANACH_STRUCTURE.find((b) => b.name === bookName)?.chapters ?? 0;
}

export function getIndexForTanachChapter(bookName: string, chapter: number): number {
  const entry = getAllTanachChapters().find(
    (e) => e.book === bookName && e.chapter === chapter
  );
  return entry?.index ?? 1;
}

// ─── Group ranges (one entry per book) for selective study ────────────────

export type TanachGroup = {
  section: TanachSection;
  book: string;
  startIndex: number;
  endIndex: number;
};

let _tanachGroups: TanachGroup[] | null = null;

export function getTanachGroups(): TanachGroup[] {
  if (_tanachGroups) return _tanachGroups;
  const groups: TanachGroup[] = [];
  let index = 1;
  for (const book of TANACH_STRUCTURE) {
    groups.push({
      section: book.section,
      book: book.name,
      startIndex: index,
      endIndex: index + book.chapters - 1,
    });
    index += book.chapters;
  }
  _tanachGroups = groups;
  return groups;
}
