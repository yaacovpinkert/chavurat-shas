import React, { useMemo, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  I18nManager,
  PanResponder,
} from "react-native";
import {
  HebrewYM,
  hebrewToJDN,
  jdnToGregorian,
  dateToJDN,
  daysInHebrewMonth,
  getHebrewMonthName,
  formatHebrewDay,
  formatHebrewYear,
  nextHebrewMonth,
  prevHebrewMonth,
} from "../utils/hebrewDate";
import { formatDateString } from "../utils/schedule";

export type DayMarking = {
  dotColor?: string;
  selected?: boolean;
  selectedColor?: string;
  checkmark?: boolean;
};

type Props = {
  year: number; // Hebrew year
  month: number; // Hebrew month (Nisan=1..Tishrei=7..)
  markings: Record<string, DayMarking>; // keyed by Gregorian "YYYY-MM-DD"
  onDayPress: (date: Date, hebrew: { year: number; month: number; day: number }) => void;
  onMonthChange: (ym: HebrewYM) => void;
};

const WEEKDAY_LABELS = ["א׳", "ב׳", "ג׳", "ד׳", "ה׳", "ו׳", "ש״ק"]; // Sunday..Shabbat

type Cell = {
  day: number; // 0 = blank cell
  date?: Date;
  dateString?: string;
};

// Weeks are kept in logical Sunday-first order; this direction puts Sunday
// physically on the right whether or not native RTL is active.
const rowDir = { flexDirection: I18nManager.isRTL ? ("row" as const) : ("row-reverse" as const) };

export default function HebrewCalendar({
  year,
  month,
  markings,
  onDayPress,
  onMonthChange,
}: Props) {
  const todayJDN = dateToJDN(new Date());

  const weeks = useMemo<Cell[][]>(() => {
    const jdnFirst = hebrewToJDN(year, month, 1);
    const len = daysInHebrewMonth(year, month);
    const firstWeekday = (jdnFirst + 1) % 7; // 0 = Sunday

    const cells: Cell[] = [];
    for (let i = 0; i < firstWeekday; i++) cells.push({ day: 0 });
    for (let day = 1; day <= len; day++) {
      const date = jdnToGregorian(jdnFirst + day - 1);
      cells.push({ day, date, dateString: formatDateString(date) });
    }
    while (cells.length % 7 !== 0) cells.push({ day: 0 });

    const result: Cell[][] = [];
    for (let i = 0; i < cells.length; i += 7) {
      result.push(cells.slice(i, i + 7));
    }
    return result;
  }, [year, month]);

  // Swipe left (toward the physical left) advances to the next month,
  // matching RTL reading direction. PanResponder dx is in raw screen
  // coordinates and is not flipped by I18nManager.
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_evt, gesture) =>
        Math.abs(gesture.dx) > 20 && Math.abs(gesture.dx) > Math.abs(gesture.dy) * 2,
      onPanResponderRelease: (_evt, gesture) => {
        if (gesture.dx < -50) onMonthChangeRef.current("next");
        else if (gesture.dx > 50) onMonthChangeRef.current("prev");
      },
    })
  ).current;

  // keep latest props inside the stable PanResponder
  const onMonthChangeRef = useRef((_dir: "next" | "prev") => {});
  onMonthChangeRef.current = (dir) => {
    const ym = { year, month };
    onMonthChange(dir === "next" ? nextHebrewMonth(ym) : prevHebrewMonth(ym));
  };

  const title = `${getHebrewMonthName(month, year)} ${formatHebrewYear(year)}`;

  return (
    <View style={styles.container}>
      {/* logical order [prev, title, next] puts prev on the physical right */}
      <View style={[styles.header, rowDir]}>
        <TouchableOpacity
          style={styles.arrowButton}
          onPress={() => onMonthChangeRef.current("prev")}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.arrowText}>›</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{title}</Text>
        <TouchableOpacity
          style={styles.arrowButton}
          onPress={() => onMonthChangeRef.current("next")}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.arrowText}>‹</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.weekRow, rowDir]}>
        {WEEKDAY_LABELS.map((label) => (
          <View key={label} style={styles.weekdayCell}>
            <Text style={styles.weekdayText}>{label}</Text>
          </View>
        ))}
      </View>

      <View {...panResponder.panHandlers}>
        {weeks.map((week, wi) => (
          <View key={wi} style={[styles.weekRow, rowDir]}>
            {week.map((cell, ci) => {
              if (cell.day === 0) {
                return <View key={ci} style={styles.dayCell} />;
              }
              const marking = markings[cell.dateString!] ?? {};
              const isToday =
                hebrewToJDN(year, month, cell.day) === todayJDN;
              return (
                <TouchableOpacity
                  key={ci}
                  style={styles.dayCell}
                  onPress={() => onDayPress(cell.date!, { year, month, day: cell.day })}
                  activeOpacity={0.6}
                >
                  <View
                    style={[
                      styles.dayInner,
                      isToday && styles.todayInner,
                      marking.selected && {
                        backgroundColor: marking.selectedColor ?? "#1a1a2e",
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.dayText,
                        isToday && styles.todayText,
                        marking.selected && styles.selectedText,
                      ]}
                    >
                      {formatHebrewDay(cell.day)}
                    </Text>
                  </View>
                  <View style={styles.dotRow}>
                    {marking.checkmark ? (
                      <Text style={styles.checkmarkText}>✓</Text>
                    ) : marking.dotColor ? (
                      <View style={[styles.dot, { backgroundColor: marking.dotColor }]} />
                    ) : null}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 6,
  },
  header: {
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 10,
    marginBottom: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1a1a2e",
    textAlign: "center",
  },
  arrowButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#f0f4ff",
    alignItems: "center",
    justifyContent: "center",
  },
  arrowText: {
    fontSize: 22,
    color: "#4A90E2",
    fontWeight: "700",
    lineHeight: 26,
  },
  weekRow: {
    width: "100%",
  },
  weekdayCell: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 6,
  },
  weekdayText: {
    fontSize: 13,
    color: "#555",
    fontWeight: "600",
  },
  dayCell: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 4,
    minHeight: 48,
  },
  dayInner: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  todayInner: {
    backgroundColor: "#4A90E2",
  },
  dayText: {
    fontSize: 15,
    color: "#1a1a2e",
    fontWeight: "600",
  },
  todayText: {
    color: "#fff",
  },
  selectedText: {
    color: "#fff",
  },
  dotRow: {
    height: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  checkmarkText: {
    fontSize: 10,
    color: "#7ED321",
    fontWeight: "800",
    lineHeight: 9,
  },
});
