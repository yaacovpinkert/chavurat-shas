import React, { useMemo } from "react";
import { Text, StyleSheet, View, TouchableOpacity } from "react-native";
import { TrackDefinition } from "../tracks/types";
import theme from "../theme";

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
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.medium,
    marginBottom: 4,
  },
  masterLabel: {
    fontSize: theme.typography.sizes.lg,
    fontFamily: theme.typography.fonts.extrabold,
    color: theme.colors.text.primary,
    marginStart: 10,
  },
  section: { marginTop: theme.spacing.sm },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.background.section,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.sm,
  },
  sectionLabel: {
    fontSize: theme.typography.sizes.base,
    fontFamily: theme.typography.fonts.bold,
    color: theme.colors.accent.primary,
    marginStart: 10,
  },
  groupRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
  },
  groupLabel: {
    fontSize: theme.typography.sizes.base - 1,
    fontFamily: theme.typography.fonts.body,
    color: theme.colors.text.primary,
    marginHorizontal: 10,
    flex: 1,
    writingDirection: "rtl",
  },
  groupCount: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.text.hint,
    fontFamily: theme.typography.fonts.semibold,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: theme.borderRadius.xs,
    borderWidth: 2,
    borderColor: theme.colors.border.medium,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.background.card,
  },
  checkboxOn: {
    backgroundColor: theme.colors.accent.primary,
    borderColor: theme.colors.accent.primary,
  },
  checkboxPartial: {
    borderColor: theme.colors.accent.primary,
  },
  checkMark: {
    color: theme.colors.background.card,
    fontSize: 14,
    fontFamily: theme.typography.fonts.extrabold,
  },
  partialDash: {
    width: 10,
    height: 3,
    borderRadius: 2,
    backgroundColor: theme.colors.accent.primary,
  },
});
