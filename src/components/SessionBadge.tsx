import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { SessionNumber } from "../utils/schedule";
import theme from "../theme";

const SESSION_LABELS: Record<SessionNumber, string> = {
  1: "לימוד",
  2: "חזרה א׳",
  3: "חזרה ב׳",
  4: "חזרה ג׳",
  5: "חזרה ד׳",
};

type Props = {
  session: SessionNumber;
};

export default function SessionBadge({ session }: Props) {
  return (
    <View style={[styles.badge, { backgroundColor: theme.colors.session[session] }]}>
      <Text style={styles.text}>{SESSION_LABELS[session]}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: theme.borderRadius.sm,
    paddingHorizontal: 8,
    paddingVertical: 3,
    alignSelf: "flex-start",
  },
  text: {
    color: theme.colors.background.card,
    fontSize: theme.typography.sizes.xs,
    fontFamily: theme.typography.fonts.bold,
  },
});
