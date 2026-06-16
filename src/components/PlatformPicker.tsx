import React from "react";
import { Platform, StyleSheet, View } from "react-native";
import theme from "../theme";

type Item = { label: string; value: string | number };

type Props = {
  selectedValue: string | number;
  onValueChange: (val: any) => void;
  items: Item[];
};

export default function PlatformPicker({ selectedValue, onValueChange, items }: Props) {
  if (Platform.OS === "web") {
    return (
      <View style={styles.webWrapper}>
        {/* @ts-ignore */}
        <select
          value={String(selectedValue)}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
            const raw = e.target.value;
            const num = Number(raw);
            onValueChange(isNaN(num) || raw !== String(num) ? raw : num);
          }}
          style={webSelectStyle}
        >
          {items.map((item) => (
            // @ts-ignore
            <option key={String(item.value)} value={String(item.value)}>
              {item.label}
            </option>
          ))}
        </select>
      </View>
    );
  }

  const { Picker } = require("@react-native-picker/picker");
  return (
    <View style={styles.nativeWrapper}>
      <Picker selectedValue={selectedValue} onValueChange={onValueChange}>
        {items.map((item) => (
          <Picker.Item key={String(item.value)} label={item.label} value={item.value} />
        ))}
      </Picker>
    </View>
  );
}

const webSelectStyle: React.CSSProperties = {
  fontSize: 16,
  padding: "10px 14px",
  borderRadius: theme.borderRadius.lg,
  border: `1.5px solid ${theme.colors.border.light}`,
  width: "100%",
  boxSizing: "border-box",
  fontFamily: theme.typography.fonts.body,
  color: theme.colors.text.primary,
  backgroundColor: theme.colors.background.section,
  direction: "rtl",
  cursor: "pointer",
  appearance: "auto",
};

const styles = StyleSheet.create({
  webWrapper: {
    width: "100%",
    marginVertical: 4,
  },
  nativeWrapper: {
    backgroundColor: theme.colors.background.section,
    borderRadius: theme.borderRadius.lg,
    overflow: "hidden",
    marginBottom: 4,
  },
});
