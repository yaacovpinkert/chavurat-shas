import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import {
  getItemsForDate,
  ScheduleItem,
  formatDateString,
  getTodayString,
} from "../utils/schedule";
import {
  toHebrewDate,
  toHebrewYMD,
  hebrewToJDN,
  jdnToGregorian,
  daysInHebrewMonth,
  HebrewYM,
} from "../utils/hebrewDate";
import { loadSettings, loadProgress, markDone, unmarkDone, AppSettings, Progress } from "../store/storage";
import HebrewCalendar, { DayMarking } from "../components/HebrewCalendar";
import SessionBadge from "../components/SessionBadge";

const DOT_COLORS = ["", "#4A90E2", "#F5A623", "#D0021B", "#7B2D8B"];

export default function CalendarScreen() {
  const today = getTodayString();
  const [currentMonth, setCurrentMonth] = useState<HebrewYM>(() => {
    const h = toHebrewYMD(new Date());
    return { year: h.year, month: h.month };
  });
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [progress, setProgress] = useState<Progress>({});
  const [markings, setMarkings] = useState<Record<string, DayMarking>>({});
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedItems, setSelectedItems] = useState<ScheduleItem[]>([]);

  async function load() {
    const s = await loadSettings();
    const p = await loadProgress();
    setSettings(s);
    setProgress(p);
  }

  useFocusEffect(
    useCallback(() => {
      load();
    }, [])
  );

  useEffect(() => {
    if (!settings) return;
    buildMarkings();
  }, [settings, progress, currentMonth, selectedDate]);

  function buildMarkings() {
    if (!settings) return;
    const marks: Record<string, DayMarking> = {};

    const jdnFirst = hebrewToJDN(currentMonth.year, currentMonth.month, 1);
    const len = daysInHebrewMonth(currentMonth.year, currentMonth.month);

    for (let jdn = jdnFirst; jdn < jdnFirst + len; jdn++) {
      const date = jdnToGregorian(jdn);
      const dateString = formatDateString(date);
      const items = getItemsForDate(date, settings);
      if (items.length === 0) continue;

      const allDone = items.every(
        (item) => !!progress[item.trackId]?.[item.unit.index]?.[item.session]
      );
      marks[dateString] = allDone
        ? { checkmark: true }
        : { dotColor: DOT_COLORS[Math.min(items.length, 4)] };
    }

    // Today is always highlighted
    marks[today] = { ...(marks[today] ?? {}), selected: true, selectedColor: "#4A90E2" };

    if (selectedDate) {
      const sel = formatDateString(selectedDate);
      if (sel !== today) {
        marks[sel] = { ...(marks[sel] ?? {}), selected: true, selectedColor: "#1a1a2e" };
      }
    }

    setMarkings(marks);
  }

  function onDayPress(date: Date) {
    if (!settings) return;
    setSelectedDate(date);
    setSelectedItems(getItemsForDate(date, settings));
  }

  async function handleToggleItem(item: ScheduleItem) {
    const done = !!progress[item.trackId]?.[item.unit.index]?.[item.session];
    if (done) {
      await unmarkDone(item.trackId, item.unit.index, item.session);
    } else {
      await markDone(item.trackId, item.unit.index, item.session);
    }
    setProgress(await loadProgress());
  }

  const multiTrack = (settings?.tracks.length ?? 0) > 1;

  return (
    <View style={styles.screen}>
      <View style={styles.calendarWrapper}>
        <HebrewCalendar
          year={currentMonth.year}
          month={currentMonth.month}
          markings={markings}
          onDayPress={onDayPress}
          onMonthChange={setCurrentMonth}
        />
      </View>

      {selectedDate && selectedItems.length > 0 && (
        <Modal
          transparent
          animationType="slide"
          visible={!!selectedDate}
          onRequestClose={() => setSelectedDate(null)}
        >
          <TouchableWithoutFeedback onPress={() => setSelectedDate(null)}>
            <View style={styles.modalOverlay} />
          </TouchableWithoutFeedback>
          <View style={styles.bottomSheet}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetHebrewDate}>
              {toHebrewDate(selectedDate).full}
            </Text>
            <Text style={styles.sheetGregorian}>
              {selectedDate.toLocaleDateString("he-IL", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </Text>
            <ScrollView style={styles.sheetScroll}>
              {selectedItems.map((item) => {
                const done =
                  !!progress[item.trackId]?.[item.unit.index]?.[item.session];
                return (
                  <TouchableOpacity
                    key={`${item.trackId}-${item.unit.index}-${item.session}`}
                    style={[styles.sheetItem, done && styles.sheetItemDone]}
                    onPress={() => handleToggleItem(item)}
                    activeOpacity={0.6}
                  >
                    <SessionBadge session={item.session} />
                    <View style={styles.sheetItemLabels}>
                      <Text
                        style={[styles.sheetItemLabel, done && styles.sheetItemLabelDone]}
                      >
                        {item.unit.label}
                      </Text>
                      {multiTrack && (
                        <Text style={styles.sheetTrackChip}>{item.trackName}</Text>
                      )}
                    </View>
                    {done && <Text style={styles.doneCheck}>✓</Text>}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setSelectedDate(null)}
            >
              <Text style={styles.closeButtonText}>סגור</Text>
            </TouchableOpacity>
          </View>
        </Modal>
      )}

      {selectedDate && selectedItems.length === 0 && (
        <View style={styles.noItemsHint}>
          <Text style={styles.noItemsText}>
            {toHebrewDate(selectedDate).full} ({selectedDate.toLocaleDateString("he-IL")})
            — אין לימוד ביום זה
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#f0f4ff",
  },
  calendarWrapper: {
    marginHorizontal: 12,
    marginTop: 12,
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  bottomSheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 36,
    maxHeight: "60%",
  },
  sheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: "#ddd",
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 16,
  },
  sheetHebrewDate: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1a1a2e",
    textAlign: "right",
    marginBottom: 2,
  },
  sheetGregorian: {
    fontSize: 15,
    color: "#555",
    textAlign: "right",
    marginBottom: 16,
  },
  sheetScroll: {
    maxHeight: 260,
  },
  sheetItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  sheetItemDone: {
    opacity: 0.5,
  },
  sheetItemLabels: {
    flex: 1,
  },
  sheetItemLabel: {
    fontSize: 16,
    color: "#1a1a2e",
    textAlign: "right",
    fontWeight: "600",
  },
  sheetItemLabelDone: {
    textDecorationLine: "line-through",
    color: "#888",
  },
  sheetTrackChip: {
    fontSize: 12,
    color: "#7B2D8B",
    textAlign: "right",
    marginTop: 2,
  },
  doneCheck: {
    fontSize: 16,
    color: "#7ED321",
    fontWeight: "700",
  },
  closeButton: {
    marginTop: 16,
    backgroundColor: "#f0f4ff",
    borderRadius: 10,
    padding: 12,
    alignItems: "center",
  },
  closeButtonText: {
    fontSize: 16,
    color: "#4A90E2",
    fontWeight: "700",
  },
  noItemsHint: {
    padding: 20,
    alignItems: "center",
  },
  noItemsText: {
    fontSize: 15,
    color: "#888",
    textAlign: "center",
  },
});
