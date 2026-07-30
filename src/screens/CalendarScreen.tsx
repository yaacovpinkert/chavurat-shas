import React, { useCallback, useEffect, useLayoutEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
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
  formatHebrewDay,
  HebrewYM,
} from "../utils/hebrewDate";
import { loadSettings, loadProgress, markDone, unmarkDone, AppSettings, Progress } from "../store/storage";
import HebrewCalendar, { DayMarking } from "../components/HebrewCalendar";
import SessionBadge from "../components/SessionBadge";
import theme from "../theme";

// Semantic dot colors based on item count — these are functional indicators, not branding
const DOT_COLORS = ["", "#4A90E2", "#F5A623", "#D0021B", "#7B2D8B"];

export default function CalendarScreen() {
  const navigation = useNavigation();
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

  useLayoutEffect(() => {
    navigation.setOptions({
      // Under forced RTL the header swaps sides, so headerRight renders at
      // the visual upper-left corner (see App.tsx for the headerLeft/"i" button).
      headerRight: () => {
        const h = toHebrewYMD(new Date());
        return (
          <TouchableOpacity
            onPress={() => setCurrentMonth({ year: h.year, month: h.month })}
            style={styles.todayHeaderButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessibilityLabel="חזרה לחודש הנוכחי"
            accessibilityRole="button"
          >
            <Text style={styles.todayHeaderButtonIcon}>{formatHebrewDay(h.day)}</Text>
          </TouchableOpacity>
        );
      },
    });
  }, [navigation]);

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

    // Today is always highlighted with the primary accent
    marks[today] = { ...(marks[today] ?? {}), selected: true, selectedColor: theme.colors.accent.primary };

    if (selectedDate) {
      const sel = formatDateString(selectedDate);
      if (sel !== today) {
        marks[sel] = { ...(marks[sel] ?? {}), selected: true, selectedColor: theme.colors.text.primary };
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
                    <SessionBadge session={item.session} />
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
    // RTL root for the whole screen — cascades to every descendant via Yoga.
    direction: "rtl",
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },
  calendarWrapper: {
    marginHorizontal: theme.spacing.md,
    marginTop: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.sm,
  },
  todayHeaderButton: {
    marginHorizontal: theme.spacing.lg,
    minWidth: 30,
    height: 30,
    paddingHorizontal: 4,
    borderRadius: 15,
    borderWidth: 1.5,
    borderColor: theme.colors.accent.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  todayHeaderButtonIcon: {
    fontSize: 12,
    fontFamily: theme.typography.fonts.bold,
    color: theme.colors.accent.primary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  bottomSheet: {
    // A Modal renders in its own root that does NOT inherit the screen's RTL
    // direction on Android — set it here so the whole sheet (and its text)
    // lays out RTL.
    direction: "rtl",
    backgroundColor: theme.colors.background.card,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: theme.spacing.xl,
    paddingBottom: 36,
    maxHeight: "60%",
  },
  sheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: theme.colors.border.medium,
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: theme.spacing.lg,
  },
  sheetHebrewDate: {
    fontSize: theme.typography.sizes.xl,
    fontFamily: theme.typography.fonts.bold,
    color: theme.colors.text.primary,
    writingDirection: "rtl",
    marginBottom: 2,
  },
  sheetGregorian: {
    fontSize: theme.typography.sizes.base - 1,
    fontFamily: theme.typography.fonts.body,
    color: theme.colors.text.secondary,
    writingDirection: "rtl",
    marginBottom: theme.spacing.lg,
  },
  sheetScroll: {
    maxHeight: 260,
  },
  sheetItem: {
    // label block on the right, session badge on the left (RTL inherited from sheet)
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
  },
  sheetItemDone: {
    opacity: 0.5,
  },
  sheetItemLabels: {
    flex: 1,
  },
  sheetItemLabel: {
    fontSize: theme.typography.sizes.base,
    fontFamily: theme.typography.fonts.semibold,
    color: theme.colors.text.primary,
    writingDirection: "rtl",
  },
  sheetItemLabelDone: {
    textDecorationLine: "line-through",
    color: theme.colors.text.hint,
  },
  sheetTrackChip: {
    fontSize: theme.typography.sizes.xs,
    fontFamily: theme.typography.fonts.body,
    color: theme.colors.session[5], // purple — semantic track identifier color
    writingDirection: "rtl",
    marginTop: 2,
  },
  doneCheck: {
    fontSize: theme.typography.sizes.base,
    fontFamily: theme.typography.fonts.bold,
    color: theme.colors.semantic.success,
  },
  closeButton: {
    marginTop: theme.spacing.lg,
    backgroundColor: theme.colors.background.section,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    alignItems: "center",
  },
  closeButtonText: {
    fontSize: theme.typography.sizes.base,
    fontFamily: theme.typography.fonts.bold,
    color: theme.colors.accent.primary,
  },
  noItemsHint: {
    padding: theme.spacing.xl,
    alignItems: "center",
  },
  noItemsText: {
    fontSize: theme.typography.sizes.base - 1,
    fontFamily: theme.typography.fonts.body,
    color: theme.colors.text.hint,
    textAlign: "center",
  },
});
