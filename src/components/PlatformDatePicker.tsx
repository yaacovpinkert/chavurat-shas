import React from "react";
import { Platform, TextInput, StyleSheet, View } from "react-native";

type Props = {
  value: Date;
  onChange: (date: Date) => void;
};

export default function PlatformDatePicker({ value, onChange }: Props) {
  if (Platform.OS === "web") {
    const iso = value.toISOString().slice(0, 10);
    return (
      <View style={styles.webWrapper}>
        {/* @ts-ignore – web-only input element */}
        <input
          type="date"
          value={iso}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            const d = new Date(e.target.value + "T12:00:00");
            if (!isNaN(d.getTime())) onChange(d);
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
      mode="date"
      display="default"
      onChange={(_: any, date?: Date) => { if (date) onChange(date); }}
      locale="he"
    />
  );
}

const webInputStyle: React.CSSProperties = {
  fontSize: 17,
  padding: "10px 14px",
  borderRadius: 10,
  border: "1.5px solid #ccc",
  width: "100%",
  boxSizing: "border-box",
  fontFamily: "inherit",
  color: "#1a1a2e",
  backgroundColor: "#f0f4ff",
  direction: "rtl",
};

const styles = StyleSheet.create({
  webWrapper: {
    width: "100%",
    marginVertical: 8,
  },
});
