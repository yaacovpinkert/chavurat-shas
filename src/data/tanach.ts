// Tanach structure — Masoretic (Hebrew) chapter divisions. Total: 929 chapters.

import { formatHebrewDay } from "../utils/hebrewDate";

type TanachBook = {
  name: string;
  chapters: number;
};

const TANACH_STRUCTURE: TanachBook[] = [
  // תורה
  { name: "בראשית", chapters: 50 },
  { name: "שמות", chapters: 40 },
  { name: "ויקרא", chapters: 27 },
  { name: "במדבר", chapters: 36 },
  { name: "דברים", chapters: 34 },
  // נביאים
  { name: "יהושע", chapters: 24 },
  { name: "שופטים", chapters: 21 },
  { name: "שמואל א", chapters: 31 },
  { name: "שמואל ב", chapters: 24 },
  { name: "מלכים א", chapters: 22 },
  { name: "מלכים ב", chapters: 25 },
  { name: "ישעיהו", chapters: 66 },
  { name: "ירמיהו", chapters: 52 },
  { name: "יחזקאל", chapters: 48 },
  { name: "הושע", chapters: 14 },
  { name: "יואל", chapters: 4 },
  { name: "עמוס", chapters: 9 },
  { name: "עובדיה", chapters: 1 },
  { name: "יונה", chapters: 4 },
  { name: "מיכה", chapters: 7 },
  { name: "נחום", chapters: 3 },
  { name: "חבקוק", chapters: 3 },
  { name: "צפניה", chapters: 3 },
  { name: "חגי", chapters: 2 },
  { name: "זכריה", chapters: 14 },
  { name: "מלאכי", chapters: 3 },
  // כתובים
  { name: "תהלים", chapters: 150 },
  { name: "משלי", chapters: 31 },
  { name: "איוב", chapters: 42 },
  { name: "שיר השירים", chapters: 8 },
  { name: "רות", chapters: 4 },
  { name: "איכה", chapters: 5 },
  { name: "קהלת", chapters: 12 },
  { name: "אסתר", chapters: 10 },
  { name: "דניאל", chapters: 12 },
  { name: "עזרא", chapters: 10 },
  { name: "נחמיה", chapters: 13 },
  { name: "דברי הימים א", chapters: 29 },
  { name: "דברי הימים ב", chapters: 36 },
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
