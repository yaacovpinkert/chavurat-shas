import { TrackDefinition, TrackSection, TrackType, TrackUnit } from "./types";
import {
  getMishnaByIndex,
  getMishnaCount,
  getSederList,
  getMasachtotForSeder,
  getPerakimCount,
  getMishnotCountForPerek,
  getGlobalIndexFor,
  getPerekByIndex,
  getPerekCount,
  getIndexForPerek,
  getMishnaGroups,
  getPerekGroups,
} from "../data/mishnayot";
import {
  getBavliMasechtot,
  getDafRange,
  getDafByIndex,
  getDafCount,
  getIndexForDaf,
  getAmudByIndex,
  getAmudCount,
  getIndexForAmud,
  getDafGroups,
  getAmudGroups,
} from "../data/bavli";
import {
  getTanachBooks,
  getChapterCountForBook,
  getTanachChapterByIndex,
  getTanachChapterCount,
  getIndexForTanachChapter,
  getTanachGroups,
} from "../data/tanach";
import { formatHebrewDay } from "../utils/hebrewDate";

function rangeOptions(count: number, labelPrefix: string, from = 1) {
  return Array.from({ length: count }, (_, i) => ({
    label: `${labelPrefix} ${formatHebrewDay(from + i)}`,
    value: from + i,
  }));
}

// Group a flat, canonically-ordered list of {sectionLabel, key, startIndex,
// endIndex} into TrackSections, preserving first-seen section order.
function buildSections(
  groups: { sectionLabel: string; key: string; startIndex: number; endIndex: number }[]
): TrackSection[] {
  const sections: TrackSection[] = [];
  for (const g of groups) {
    let section = sections.find((s) => s.label === g.sectionLabel);
    if (!section) {
      section = { label: g.sectionLabel, groups: [] };
      sections.push(section);
    }
    section.groups.push({
      key: g.key,
      label: g.key,
      startIndex: g.startIndex,
      endIndex: g.endIndex,
    });
  }
  return sections;
}

const mishnaTrack: TrackDefinition = {
  type: "mishna",
  name: "משנה יומית",
  unitCount: getMishnaCount(),
  getUnitByIndex(index): TrackUnit | undefined {
    const e = getMishnaByIndex(index);
    return e && {
      index,
      label: e.label,
      path: [e.seder, e.masechet, e.perek, e.mishna],
    };
  },
  getIndexForPath(path) {
    const [seder, masechet, perek, mishna] = path as [string, string, number, number];
    return getGlobalIndexFor(seder, masechet, perek, mishna);
  },
  getSections() {
    return buildSections(
      getMishnaGroups().map((g) => ({
        sectionLabel: g.seder,
        key: g.masechet,
        startIndex: g.startIndex,
        endIndex: g.endIndex,
      }))
    );
  },
  pickerLevels: [
    {
      key: "seder",
      title: "סדר",
      getOptions: () => getSederList().map((s) => ({ label: s, value: s })),
    },
    {
      key: "masechet",
      title: "מסכת",
      getOptions: ([seder]) =>
        getMasachtotForSeder(seder as string).map((m) => ({ label: m, value: m })),
    },
    {
      key: "perek",
      title: "פרק",
      getOptions: ([seder, masechet]) =>
        rangeOptions(getPerakimCount(seder as string, masechet as string), "פרק"),
    },
    {
      key: "mishna",
      title: "משנה",
      getOptions: ([seder, masechet, perek]) =>
        rangeOptions(
          getMishnotCountForPerek(seder as string, masechet as string, perek as number),
          "משנה"
        ),
    },
  ],
};

const mishnaPerekTrack: TrackDefinition = {
  type: "mishnaPerek",
  name: "פרק יומי במשנה",
  unitCount: getPerekCount(),
  getUnitByIndex(index): TrackUnit | undefined {
    const e = getPerekByIndex(index);
    return e && {
      index,
      label: e.label,
      path: [e.seder, e.masechet, e.perek],
    };
  },
  getIndexForPath(path) {
    const [seder, masechet, perek] = path as [string, string, number];
    return getIndexForPerek(seder, masechet, perek);
  },
  getSections() {
    return buildSections(
      getPerekGroups().map((g) => ({
        sectionLabel: g.seder,
        key: g.masechet,
        startIndex: g.startIndex,
        endIndex: g.endIndex,
      }))
    );
  },
  pickerLevels: [
    {
      key: "seder",
      title: "סדר",
      getOptions: () => getSederList().map((s) => ({ label: s, value: s })),
    },
    {
      key: "masechet",
      title: "מסכת",
      getOptions: ([seder]) =>
        getMasachtotForSeder(seder as string).map((m) => ({ label: m, value: m })),
    },
    {
      key: "perek",
      title: "פרק",
      getOptions: ([seder, masechet]) =>
        rangeOptions(getPerakimCount(seder as string, masechet as string), "פרק"),
    },
  ],
};

const bavliDafTrack: TrackDefinition = {
  type: "bavliDaf",
  name: "דף יומי בגמרא",
  unitCount: getDafCount(),
  getUnitByIndex(index): TrackUnit | undefined {
    const e = getDafByIndex(index);
    return e && { index, label: e.label, path: [e.masechet, e.daf] };
  },
  getIndexForPath(path) {
    const [masechet, daf] = path as [string, number];
    return getIndexForDaf(masechet, daf);
  },
  getSections() {
    return buildSections(
      getDafGroups().map((g) => ({
        sectionLabel: g.seder,
        key: g.masechet,
        startIndex: g.startIndex,
        endIndex: g.endIndex,
      }))
    );
  },
  pickerLevels: [
    {
      key: "masechet",
      title: "מסכת",
      getOptions: () => getBavliMasechtot().map((m) => ({ label: m, value: m })),
    },
    {
      key: "daf",
      title: "דף",
      getOptions: ([masechet]) => {
        const { firstDaf, lastDaf } = getDafRange(masechet as string);
        return rangeOptions(lastDaf - firstDaf + 1, "דף", firstDaf);
      },
    },
  ],
};

const bavliAmudTrack: TrackDefinition = {
  type: "bavliAmud",
  name: "עמוד יומי בגמרא",
  unitCount: getAmudCount(),
  getUnitByIndex(index): TrackUnit | undefined {
    const e = getAmudByIndex(index);
    return e && { index, label: e.label, path: [e.masechet, e.daf, e.amud] };
  },
  getIndexForPath(path) {
    const [masechet, daf, amud] = path as [string, number, 1 | 2];
    return getIndexForAmud(masechet, daf, amud);
  },
  getSections() {
    return buildSections(
      getAmudGroups().map((g) => ({
        sectionLabel: g.seder,
        key: g.masechet,
        startIndex: g.startIndex,
        endIndex: g.endIndex,
      }))
    );
  },
  pickerLevels: [
    {
      key: "masechet",
      title: "מסכת",
      getOptions: () => getBavliMasechtot().map((m) => ({ label: m, value: m })),
    },
    {
      key: "daf",
      title: "דף",
      getOptions: ([masechet]) => {
        const { firstDaf, lastDaf } = getDafRange(masechet as string);
        return rangeOptions(lastDaf - firstDaf + 1, "דף", firstDaf);
      },
    },
    {
      key: "amud",
      title: "עמוד",
      getOptions: () => [
        { label: "ע״א", value: 1 },
        { label: "ע״ב", value: 2 },
      ],
    },
  ],
};

const tanachPerekTrack: TrackDefinition = {
  type: "tanachPerek",
  name: "פרק יומי בתנ״ך",
  unitCount: getTanachChapterCount(),
  getUnitByIndex(index): TrackUnit | undefined {
    const e = getTanachChapterByIndex(index);
    return e && { index, label: e.label, path: [e.book, e.chapter] };
  },
  getIndexForPath(path) {
    const [book, chapter] = path as [string, number];
    return getIndexForTanachChapter(book, chapter);
  },
  getSections() {
    return buildSections(
      getTanachGroups().map((g) => ({
        sectionLabel: g.section,
        key: g.book,
        startIndex: g.startIndex,
        endIndex: g.endIndex,
      }))
    );
  },
  pickerLevels: [
    {
      key: "book",
      title: "ספר",
      getOptions: () => getTanachBooks().map((b) => ({ label: b, value: b })),
    },
    {
      key: "chapter",
      title: "פרק",
      getOptions: ([book]) =>
        rangeOptions(getChapterCountForBook(book as string), "פרק"),
    },
  ],
};

const TRACKS: Record<TrackType, TrackDefinition> = {
  mishna: mishnaTrack,
  mishnaPerek: mishnaPerekTrack,
  bavliDaf: bavliDafTrack,
  bavliAmud: bavliAmudTrack,
  tanachPerek: tanachPerekTrack,
};

export function getTrackDefinition(type: TrackType): TrackDefinition {
  return TRACKS[type];
}

export function getAllTrackTypes(): TrackType[] {
  return Object.keys(TRACKS) as TrackType[];
}

// Default starting path for a track: first option at every picker level.
export function getDefaultPath(def: TrackDefinition): (string | number)[] {
  const path: (string | number)[] = [];
  for (const level of def.pickerLevels) {
    const opts = level.getOptions(path);
    path.push(opts[0]?.value ?? 1);
  }
  return path;
}

// All group keys for a track, in canonical study order.
export function getAllGroupKeys(def: TrackDefinition): string[] {
  return def.getSections().flatMap((s) => s.groups.map((g) => g.key));
}

// The startUnitIndex implied by a selection: the start of the first selected
// group in canonical order. Falls back to 1 if nothing is selected.
export function startIndexForSelection(
  def: TrackDefinition,
  selectedGroups: string[]
): number {
  const selected = new Set(selectedGroups);
  for (const section of def.getSections()) {
    for (const g of section.groups) {
      if (selected.has(g.key)) return g.startIndex;
    }
  }
  return 1;
}
