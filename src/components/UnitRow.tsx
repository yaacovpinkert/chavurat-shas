import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { ScheduleItem } from "../utils/schedule";
import SessionBadge from "./SessionBadge";
import theme from "../theme";

type Props = {
  item: ScheduleItem;
  done: boolean;
  onToggle: () => void;
  showTrackName?: boolean;
};

export default function UnitRow({ item, done, onToggle, showTrackName }: Props) {
  return (
    <TouchableOpacity
      style={[styles.row, done && styles.rowDone]}
      onPress={onToggle}
      activeOpacity={0.7}
    >
      <View style={styles.main}>
        <SessionBadge session={item.session} />
        <View style={styles.labels}>
          <Text style={[styles.label, done && styles.labelDone]}>
            {item.unit.label}
          </Text>
          {showTrackName && (
            <Text style={styles.trackChip}>{item.trackName}</Text>
          )}
        </View>
      </View>
      <View style={[styles.checkbox, done && styles.checkboxDone]}>
        {done && <Text style={styles.checkmark}>✓</Text>}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: theme.colors.background.card,
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: theme.spacing.sm,
    ...theme.shadows.xs,
  },
  rowDone: {
    opacity: 0.6,
  },
  main: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  labels: {
    flex: 1,
  },
  label: {
    fontSize: theme.typography.sizes.lg,
    fontFamily: theme.typography.fonts.semibold,
    color: theme.colors.text.primary,
    textAlign: "right",
    writingDirection: "rtl",
  },
  labelDone: {
    textDecorationLine: "line-through",
    color: theme.colors.text.hint,
  },
  trackChip: {
    fontSize: theme.typography.sizes.xs,
    fontFamily: theme.typography.fonts.body,
    color: theme.colors.session[5], // purple — semantic track identifier color
    textAlign: "right",
    writingDirection: "rtl",
    marginTop: 2,
  },
  checkbox: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: theme.colors.border.medium,
    alignItems: "center",
    justifyContent: "center",
    marginStart: 10,
  },
  checkboxDone: {
    backgroundColor: theme.colors.accent.primary,
    borderColor: theme.colors.accent.primary,
  },
  checkmark: {
    color: theme.colors.background.card,
    fontSize: 14,
    fontFamily: theme.typography.fonts.bold,
  },
});
