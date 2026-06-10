import { TrackDefinition, TrackType, TrackUnit } from "./types";
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
} from "../data/bavli";
import {
  getTanachBooks,
  getChapterCountForBook,
  getTanachChapterByIndex,
  getTanachChapterCount,
  getIndexForTanachChapter,
} from "../data/tanach";
import { formatHebrewDay } from "../utils/hebrewDate";

function rangeOptions(count: number, labelPrefix: string, from = 1) {
  return Array.from({ length: count }, (_, i) => ({
    label: `${labelPrefix} ${formatHebrewDay(from + i)}`,
    value: from + i,
  }));
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
