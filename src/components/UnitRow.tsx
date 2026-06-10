import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { ScheduleItem } from "../utils/schedule";
import SessionBadge from "./SessionBadge";

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
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
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
    fontSize: 17,
    fontWeight: "600",
    color: "#1a1a2e",
    textAlign: "right",
    writingDirection: "rtl",
  },
  labelDone: {
    textDecorationLine: "line-through",
    color: "#888",
  },
  trackChip: {
    fontSize: 12,
    color: "#7B2D8B",
    textAlign: "right",
    writingDirection: "rtl",
    marginTop: 2,
  },
  checkbox: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: "#ccc",
    alignItems: "center",
    justifyContent: "center",
    marginStart: 10,
  },
  checkboxDone: {
    backgroundColor: "#4A90E2",
    borderColor: "#4A90E2",
  },
  checkmark: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },
});
