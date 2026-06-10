import React from "react";
import { Text, StyleSheet, View } from "react-native";
import PlatformPicker from "./PlatformPicker";
import { TrackDefinition } from "../tracks/types";

type Props = {
  definition: TrackDefinition;
  path: (string | number)[];
  onChange: (path: (string | number)[]) => void;
};

// Generic cascading picker driven by a track's pickerLevels. Changing a
// level resets all deeper levels to their first option.
export default function UnitPicker({ definition, path, onChange }: Props) {
  function handleLevelChange(levelIndex: number, value: string | number) {
    const next = path.slice(0, levelIndex);
    next.push(value);
    for (let i = levelIndex + 1; i < definition.pickerLevels.length; i++) {
      const opts = definition.pickerLevels[i].getOptions(next);
      next.push(opts[0]?.value ?? 1);
    }
    onChange(next);
  }

  return (
    <View>
      {definition.pickerLevels.map((level, i) => (
        <View key={level.key}>
          <Text style={styles.pickerLabel}>{level.title}</Text>
          <PlatformPicker
            selectedValue={path[i]}
            onValueChange={(val) => handleLevelChange(i, val)}
            items={level.getOptions(path.slice(0, i))}
          />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  pickerLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#444",
    textAlign: "right",
    marginTop: 12,
    marginBottom: 2,
  },
});
