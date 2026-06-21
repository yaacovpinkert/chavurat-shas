import React from "react";
import { Platform, StyleSheet, View } from "react-native";
import theme from "../theme";

type Props = {
  value: Date;
  onChange: (date: Date) => void;
  mode?: "date" | "time";
};

export default function PlatformDatePicker({ value, onChange, mode = "date" }: Props) {
  if (Platform.OS === "web") {
    const webValue =
      mode === "time"
        ? `${String(value.getHours()).padStart(2, "0")}:${String(value.getMinutes()).padStart(2, "0")}`
        : value.toISOString().slice(0, 10);
    return (
      <View style={styles.webWrapper}>
        {/* @ts-ignore – web-only input element */}
        <input
          type={mode}
          value={webValue}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            if (mode === "time") {
              const [h, m] = e.target.value.split(":").map(Number);
              const d = new Date(value);
              d.setHours(h, m, 0, 0);
              onChange(d);
            } else {
              const d = new Date(e.target.value + "T12:00:00");
              if (!isNaN(d.getTime())) onChange(d);
            }
          }}
          style={webInputStyle}
        />
      </View>
    );
  }

  // Native: lazy-require so the native module is never imported on web
  const DateTimePicker = require("@react-native-community/datetimepicker").default;
  return (
    <DateTimePicker
      value={value}
      mode={mode}
      display="default"
      onValueChange={(_: any, date?: Date) => { if (date) onChange(date); }}
      locale="he"
    />
  );
}

const webInputStyle: React.CSSProperties = {
  fontSize: 17,
  padding: "10px 14px",
  borderRadius: theme.borderRadius.lg,
  border: `1.5px solid ${theme.colors.border.light}`,
  width: "100%",
  boxSizing: "border-box",
  fontFamily: theme.typography.fonts.body,
  color: theme.colors.text.primary,
  backgroundColor: theme.colors.background.section,
  direction: "rtl",
};

const styles = StyleSheet.create({
  webWrapper: {
    width: "100%",
    marginVertical: theme.spacing.sm,
  },
});
