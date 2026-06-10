import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { SessionNumber } from "../utils/schedule";

const SESSION_LABELS: Record<SessionNumber, string> = {
  1: "לימוד",
  2: "חזרה א׳",
  3: "חזרה ב׳",
  4: "חזרה ג׳",
  5: "חזרה ד׳",
};

const SESSION_COLORS: Record<SessionNumber, string> = {
  1: "#4A90E2",
  2: "#7ED321",
  3: "#F5A623",
  4: "#D0021B",
  5: "#7B2D8B",
};

type Props = {
  session: SessionNumber;
};

export default function SessionBadge({ session }: Props) {
  return (
    <View style={[styles.badge, { backgroundColor: SESSION_COLORS[session] }]}>
      <Text style={styles.text}>{SESSION_LABELS[session]}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    alignSelf: "flex-start",
  },
  text: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },
});
