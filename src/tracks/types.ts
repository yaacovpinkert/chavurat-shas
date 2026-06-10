// Generic study-track abstraction. Every track is a 1-based sequence of
// units (mishna / perek / daf / amud / Tanach chapter) that screens consume
// without knowing the underlying data source.

export type TrackType =
  | "mishna"
  | "mishnaPerek"
  | "bavliDaf"
  | "bavliAmud"
  | "tanachPerek";

export type TrackUnit = {
  index: number; // 1-based within the track
  label: string; // display label, e.g. "ברכות פ״א מ״א"
  path: (string | number)[]; // picker-level values, e.g. ["זרעים", "ברכות", 1, 1]
};

export type PickerLevel = {
  key: string;
  title: string; // Hebrew label shown above the picker
  getOptions(parentPath: (string | number)[]): { label: string; value: string | number }[];
};

export type TrackDefinition = {
  type: TrackType;
  name: string; // e.g. "משנה יומית"
  unitCount: number;
  getUnitByIndex(index: number): TrackUnit | undefined;
  getIndexForPath(path: (string | number)[]): number;
  pickerLevels: PickerLevel[];
};

// A user-configured instance of a track. Each track has its own independent
// start date and starting unit; several can run in parallel.
export type TrackConfig = {
  id: string;
  trackType: TrackType;
  startDate: string; // ISO "YYYY-MM-DD"
  startUnitIndex: number; // 1-based
};
