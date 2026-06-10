import React from "react";
import { Platform, StyleSheet, View } from "react-native";

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
  borderRadius: 10,
  border: "1.5px solid #ccc",
  width: "100%",
  boxSizing: "border-box",
  fontFamily: "inherit",
  color: "#1a1a2e",
  backgroundColor: "#f0f4ff",
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
    backgroundColor: "#f0f4ff",
    borderRadius: 10,
    overflow: "hidden",
    marginBottom: 4,
  },
});
