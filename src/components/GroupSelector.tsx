import React, { useMemo } from "react";
import { Text, StyleSheet, View, TouchableOpacity } from "react-native";
import { TrackDefinition } from "../tracks/types";

type Props = {
  definition: TrackDefinition;
  selected: string[];
  onChange: (selected: string[]) => void;
};

// Multi-select checklist of a track's books/tractates, grouped by section
// (seder, or Torah/Nevi'im/Ketuvim). Offers a master "select all" toggle and
// a per-section toggle. Selection is by group key (masechet/book name).
export default function GroupSelector({ definition, selected, onChange }: Props) {
  const sections = useMemo(() => definition.getSections(), [definition]);
  const allKeys = useMemo(
    () => sections.flatMap((s) => s.groups.map((g) => g.key)),
    [sections]
  );
  const selectedSet = useMemo(() => new Set(selected), [selected]);

  const allSelected = allKeys.length > 0 && allKeys.every((k) => selectedSet.has(k));

  function toggleAll() {
    onChange(allSelected ? [] : allKeys);
  }

  function toggleSection(keys: string[]) {
    const allOn = keys.every((k) => selectedSet.has(k));
    const next = new Set(selectedSet);
    if (allOn) {
      keys.forEach((k) => next.delete(k));
    } else {
      keys.forEach((k) => next.add(k));
    }
    onChange(allKeys.filter((k) => next.has(k))); // keep canonical order
  }

  function toggleGroup(key: string) {
    const next = new Set(selectedSet);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    onChange(allKeys.filter((k) => next.has(k)));
  }

  return (
    <View>
      <TouchableOpacity style={styles.masterRow} onPress={toggleAll}>
        <Checkbox state={allSelected ? "on" : selected.length > 0 ? "partial" : "off"} />
        <Text style={styles.masterLabel}>בחר הכל</Text>
      </TouchableOpacity>

      {sections.map((section) => {
        const keys = section.groups.map((g) => g.key);
        const onCount = keys.filter((k) => selectedSet.has(k)).length;
        const sectionState =
          onCount === 0 ? "off" : onCount === keys.length ? "on" : "partial";
        return (
          <View key={section.label} style={styles.section}>
            <TouchableOpacity
              style={styles.sectionHeader}
              onPress={() => toggleSection(keys)}
            >
              <Checkbox state={sectionState} />
              <Text style={styles.sectionLabel}>{section.label}</Text>
            </TouchableOpacity>

            {section.groups.map((g) => {
              const count = g.endIndex - g.startIndex + 1;
              return (
                <TouchableOpacity
                  key={g.key}
                  style={styles.groupRow}
                  onPress={() => toggleGroup(g.key)}
                >
                  <Checkbox state={selectedSet.has(g.key) ? "on" : "off"} />
                  <Text style={styles.groupLabel}>{g.label}</Text>
                  <Text style={styles.groupCount}>{count}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        );
      })}
    </View>
  );
}

function Checkbox({ state }: { state: "on" | "off" | "partial" }) {
  return (
    <View
      style={[
        styles.checkbox,
        state === "on" && styles.checkboxOn,
        state === "partial" && styles.checkboxPartial,
      ]}
    >
      {state === "on" && <Text style={styles.checkMark}>✓</Text>}
      {state === "partial" && <View style={styles.partialDash} />}
    </View>
  );
}

const styles = StyleSheet.create({
  masterRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e6f5",
    marginBottom: 4,
  },
  masterLabel: {
    fontSize: 17,
    fontWeight: "800",
    color: "#1a1a2e",
    marginRight: 10,
  },
  section: { marginTop: 8 },
  sectionHeader: {
    flexDirection: "row-reverse",
    alignItems: "center",
    paddingVertical: 8,
    backgroundColor: "#f0f4ff",
    borderRadius: 8,
    paddingHorizontal: 8,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: "#4A90E2",
    marginRight: 10,
  },
  groupRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f5f5f5",
  },
  groupLabel: {
    fontSize: 15,
    color: "#1a1a2e",
    marginRight: 10,
    flex: 1,
    textAlign: "right",
  },
  groupCount: {
    fontSize: 13,
    color: "#aaa",
    fontWeight: "600",
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: "#c0c8e0",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  checkboxOn: {
    backgroundColor: "#4A90E2",
    borderColor: "#4A90E2",
  },
  checkboxPartial: {
    borderColor: "#4A90E2",
  },
  checkMark: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "900",
  },
  partialDash: {
    width: 10,
    height: 3,
    borderRadius: 2,
    backgroundColor: "#4A90E2",
  },
});
