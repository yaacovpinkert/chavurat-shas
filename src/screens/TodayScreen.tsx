import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import UnitRow from "../components/UnitRow";
import { getItemsForDate, ScheduleItem, getTodayString, parseDateString } from "../utils/schedule";
import { toHebrewDate } from "../utils/hebrewDate";
import {
  loadSettings,
  loadProgress,
  markDone,
  unmarkDone,
  AppSettings,
  Progress,
} from "../store/storage";

export default function TodayScreen() {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [items, setItems] = useState<ScheduleItem[]>([]);
  const [progress, setProgress] = useState<Progress>({});
  const [refreshing, setRefreshing] = useState(false);

  const todayStr = getTodayString();
  const todayDate = parseDateString(todayStr);
  const hebrew = toHebrewDate(todayDate);

  async function load() {
    const s = await loadSettings();
    const p = await loadProgress();
    if (s) {
      setSettings(s);
      setItems(getItemsForDate(todayDate, s));
    }
    setProgress(p);
  }

  useFocusEffect(
    useCallback(() => {
      load();
    }, [])
  );

  async function onRefresh() {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }

  function isDone(item: ScheduleItem): boolean {
    return !!progress[item.trackId]?.[item.unit.index]?.[item.session];
  }

  async function handleToggle(item: ScheduleItem) {
    const { trackId, session } = item;
    const idx = item.unit.index;

    if (isDone(item)) {
      await unmarkDone(trackId, idx, session);
      setProgress((prev) => {
        const next = { ...prev };
        const track = { ...(next[trackId] ?? {}) };
        const unit = { ...(track[idx] ?? {}) };
        delete unit[session];
        if (Object.keys(unit).length === 0) delete track[idx];
        else track[idx] = unit;
        if (Object.keys(track).length === 0) delete next[trackId];
        else next[trackId] = track;
        return next;
      });
    } else {
      await markDone(trackId, idx, session);
      setProgress((prev) => ({
        ...prev,
        [trackId]: {
          ...(prev[trackId] ?? {}),
          [idx]: { ...(prev[trackId]?.[idx] ?? {}), [session]: true },
        },
      }));
    }
  }

  const doneCount = items.filter(isDone).length;
  const multiTrack = (settings?.tracks.length ?? 0) > 1;

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.hebrewDate}>{hebrew.full}</Text>
      </View>

      {items.length > 0 && (
        <View style={styles.progressRow}>
          <ProgressRing done={doneCount} total={items.length} />
          <Text style={styles.progressText}>
            {doneCount}/{items.length} הושלמו
          </Text>
        </View>
      )}

      {items.length === 0 && (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyText}>
            {settings ? "אין לימוד לפני תאריך ההתחלה" : "טוען..."}
          </Text>
        </View>
      )}

      {items.map((item) => (
        <UnitRow
          key={`${item.trackId}-${item.unit.index}-${item.session}`}
          item={item}
          done={isDone(item)}
          onToggle={() => handleToggle(item)}
          showTrackName={multiTrack}
        />
      ))}
    </ScrollView>
  );
}

function ProgressRing({ done, total }: { done: number; total: number }) {
  const pct = total === 0 ? 0 : done / total;
  const color = done === total && total > 0 ? "#7ED321" : "#4A90E2";
  return (
    <View style={[styles.ring, { borderColor: color }]}>
      <Text style={[styles.ringText, { color }]}>
        {Math.round(pct * 100)}%
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#f0f4ff",
  },
  container: {
    padding: 16,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 20,
    alignItems: "flex-end",
  },
  hebrewDate: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1a1a2e",
    textAlign: "right",
  },
  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 12,
    marginBottom: 16,
  },
  progressText: {
    fontSize: 16,
    color: "#444",
    fontWeight: "600",
  },
  ring: {
    width: 54,
    height: 54,
    borderRadius: 27,
    borderWidth: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  ringText: {
    fontSize: 13,
    fontWeight: "700",
  },
  emptyBox: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 24,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#888",
    textAlign: "center",
  },
});
