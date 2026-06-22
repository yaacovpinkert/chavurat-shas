import AsyncStorage from "@react-native-async-storage/async-storage";
import { TrackConfig } from "../tracks/types";

const SETTINGS_KEY = "@chavurat_shas:settings";
const PROGRESS_KEY = "@chavurat_shas:progress";
const PROGRESS_VERSION_KEY = "@chavurat_shas:progress_v";

// Keep in sync with SessionNumber in src/utils/schedule.ts (kept separate to
// avoid a circular import — schedule.ts already imports AppSettings from here).
export type SessionNumber = 1 | 2 | 3 | 4 | 5 | 6;

export type NotificationSettings = {
  enabled: boolean;
  hour: number;
  minute: number;
};

export type AppSettings = {
  version: 2;
  tracks: TrackConfig[];
  notification?: NotificationSettings;
};

export type Progress = {
  [trackId: string]: {
    [unitIndex: number]: {
      [session in SessionNumber]?: boolean;
    };
  };
};

// Pre-track schema: a single mishna track keyed directly by mishna index
type LegacySettingsV1 = {
  startDate: string;
  startMishnaIndex: number;
};

const LEGACY_TRACK_ID = "track-1";

export function newTrackId(): string {
  return `t${Date.now().toString(36)}${Math.floor(Math.random() * 1296).toString(36)}`;
}

export async function loadSettings(): Promise<AppSettings | null> {
  try {
    const raw = await AsyncStorage.getItem(SETTINGS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);

    if (parsed?.version === 2 && Array.isArray(parsed.tracks)) {
      return parsed as AppSettings;
    }

    if (typeof parsed?.startMishnaIndex === "number") {
      return await migrateFromV1(parsed as LegacySettingsV1);
    }

    return null;
  } catch {
    return null;
  }
}

async function migrateFromV1(legacy: LegacySettingsV1): Promise<AppSettings> {
  const settings: AppSettings = {
    version: 2,
    tracks: [
      {
        id: LEGACY_TRACK_ID,
        trackType: "mishna",
        startDate: legacy.startDate,
        startUnitIndex: legacy.startMishnaIndex,
      },
    ],
  };

  // Wrap the old flat progress ({mishnaIndex: {session: bool}}) under the
  // migrated track id, exactly once.
  const progressVersion = await AsyncStorage.getItem(PROGRESS_VERSION_KEY);
  if (progressVersion !== "2") {
    const raw = await AsyncStorage.getItem(PROGRESS_KEY);
    if (raw) {
      try {
        const oldProgress = JSON.parse(raw);
        await AsyncStorage.setItem(
          PROGRESS_KEY,
          JSON.stringify({ [LEGACY_TRACK_ID]: oldProgress })
        );
      } catch {
        // unreadable progress — drop it rather than crash
        await AsyncStorage.removeItem(PROGRESS_KEY);
      }
    }
  }

  await saveSettings(settings);
  return settings;
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  await AsyncStorage.setItem(PROGRESS_VERSION_KEY, "2");
}

export async function addTrack(config: TrackConfig): Promise<AppSettings> {
  const settings = (await loadSettings()) ?? { version: 2 as const, tracks: [] };
  settings.tracks.push(config);
  await saveSettings(settings);
  return settings;
}

export async function updateTrack(
  id: string,
  patch: Partial<Omit<TrackConfig, "id">>
): Promise<AppSettings | null> {
  const settings = await loadSettings();
  if (!settings) return null;
  settings.tracks = settings.tracks.map((t) => (t.id === id ? { ...t, ...patch } : t));
  await saveSettings(settings);
  return settings;
}

export async function removeTrack(id: string): Promise<AppSettings | null> {
  const settings = await loadSettings();
  if (!settings) return null;
  settings.tracks = settings.tracks.filter((t) => t.id !== id);
  await saveSettings(settings);

  const progress = await loadProgress();
  if (progress[id]) {
    delete progress[id];
    await saveProgress(progress);
  }
  return settings;
}

export async function loadProgress(): Promise<Progress> {
  try {
    const raw = await AsyncStorage.getItem(PROGRESS_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Progress;
  } catch {
    return {};
  }
}

async function saveProgress(progress: Progress): Promise<void> {
  await AsyncStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
}

export async function markDone(
  trackId: string,
  unitIndex: number,
  session: SessionNumber
): Promise<void> {
  const progress = await loadProgress();
  if (!progress[trackId]) progress[trackId] = {};
  if (!progress[trackId][unitIndex]) progress[trackId][unitIndex] = {};
  progress[trackId][unitIndex][session] = true;
  await saveProgress(progress);
}

export async function unmarkDone(
  trackId: string,
  unitIndex: number,
  session: SessionNumber
): Promise<void> {
  const progress = await loadProgress();
  const unit = progress[trackId]?.[unitIndex];
  if (unit) {
    delete unit[session];
    if (Object.keys(unit).length === 0) {
      delete progress[trackId][unitIndex];
    }
    if (Object.keys(progress[trackId]).length === 0) {
      delete progress[trackId];
    }
  }
  await saveProgress(progress);
}

// Reset one track's progress, or everything when no id is given.
export async function resetProgress(trackId?: string): Promise<void> {
  if (!trackId) {
    await AsyncStorage.removeItem(PROGRESS_KEY);
    return;
  }
  const progress = await loadProgress();
  delete progress[trackId];
  await saveProgress(progress);
}

export async function clearAll(): Promise<void> {
  await AsyncStorage.multiRemove([SETTINGS_KEY, PROGRESS_KEY, PROGRESS_VERSION_KEY]);
}

export async function updateNotificationSettings(
  notif: NotificationSettings
): Promise<AppSettings | null> {
  const settings = await loadSettings();
  if (!settings) return null;
  settings.notification = notif;
  await saveSettings(settings);
  return settings;
}
