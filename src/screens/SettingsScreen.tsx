import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import PlatformDatePicker from "../components/PlatformDatePicker";
import PlatformPicker from "../components/PlatformPicker";
import GroupSelector from "../components/GroupSelector";
import {
  loadSettings,
  updateTrack,
  addTrack,
  removeTrack,
  resetProgress,
  clearAll,
  newTrackId,
  AppSettings,
} from "../store/storage";
import { TrackConfig, TrackType } from "../tracks/types";
import {
  getTrackDefinition,
  getAllTrackTypes,
  getAllGroupKeys,
  startIndexForSelection,
} from "../tracks/registry";
import { formatDateString, parseDateString, getTrackProgress } from "../utils/schedule";
import { toHebrewDate } from "../utils/hebrewDate";
import { confirmAction, notify } from "../utils/dialog";
import theme from "../theme";

type Props = {
  onReset: () => void;
};

type Editing =
  | { trackId: string; field: "date" }
  | { trackId: string; field: "groups"; selected: string[] }
  | null;

export default function SettingsScreen({ onReset }: Props) {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [editing, setEditing] = useState<Editing>(null);
  const [addingTrack, setAddingTrack] = useState(false);
  const [newTrackType, setNewTrackType] = useState<TrackType>("mishna");

  useFocusEffect(
    useCallback(() => {
      loadSettings().then(setSettings);
      setEditing(null);
    }, [])
  );

  async function handleDateChange(track: TrackConfig, date: Date) {
    const updated = await updateTrack(track.id, { startDate: formatDateString(date) });
    setSettings(updated);
    setEditing(null);
  }

  function startEditingGroups(track: TrackConfig) {
    const def = getTrackDefinition(track.trackType);
    setEditing({
      trackId: track.id,
      field: "groups",
      selected: track.selectedGroups ?? getAllGroupKeys(def),
    });
  }

  async function handleGroupsSave(track: TrackConfig, selected: string[]) {
    if (selected.length === 0) return;
    const def = getTrackDefinition(track.trackType);
    const updated = await updateTrack(track.id, {
      selectedGroups: selected,
      startUnitIndex: startIndexForSelection(def, selected),
    });
    setSettings(updated);
    setEditing(null);
  }

  function handleTrackTypeChange(track: TrackConfig, newType: TrackType) {
    if (newType === track.trackType) return;
    const newName = getTrackDefinition(newType).name;
    confirmAction(
      "החלפת מסלול",
      `להחליף ל${newName}? ההתקדמות של המסלול הנוכחי תאופס.`,
      "החלף",
      async () => {
        await resetProgress(track.id);
        const updated = await updateTrack(track.id, {
          trackType: newType,
          startUnitIndex: 1,
          selectedGroups: getAllGroupKeys(getTrackDefinition(newType)),
        });
        setSettings(updated);
        setEditing(null);
      }
    );
  }

  function handleRemoveTrack(track: TrackConfig) {
    const name = getTrackDefinition(track.trackType).name;
    confirmAction(
      "מחיקת מסלול",
      `למחוק את המסלול ${name} ואת התקדמותו?`,
      "מחק",
      async () => {
        const updated = await removeTrack(track.id);
        if (updated) setSettings(updated);
      }
    );
  }

  async function handleAddTrack() {
    const updated = await addTrack({
      id: newTrackId(),
      trackType: newTrackType,
      startDate: formatDateString(new Date()),
      startUnitIndex: 1,
    });
    setSettings(updated);
    setAddingTrack(false);
    setNewTrackType("mishna");
  }

  function confirmResetProgress() {
    confirmAction(
      "איפוס התקדמות",
      "האם לאפס את כל הסימונים? ההגדרות יישמרו.",
      "אפס",
      async () => {
        await resetProgress();
        notify("בוצע", "ההתקדמות אופסה.");
      }
    );
  }

  function confirmFullReset() {
    confirmAction(
      "התחלה מחדש",
      "האם למחוק את כל ההגדרות וההתקדמות?",
      "מחק הכל",
      async () => {
        await clearAll();
        onReset();
      }
    );
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.container}>
      {settings?.tracks.map((track) => {
        const def = getTrackDefinition(track.trackType);
        const startUnit = def.getUnitByIndex(track.startUnitIndex);
        const startDateObj = parseDateString(track.startDate);
        const progress = getTrackProgress(new Date(), track);
        const isEditingDate =
          editing?.trackId === track.id && editing.field === "date";
        const isEditingGroups =
          editing?.trackId === track.id && editing.field === "groups";

        return (
          <View key={track.id} style={styles.card}>
            <Text style={styles.trackTitle}>{def.name}</Text>

            <Text style={styles.pickerLabel}>סוג מסלול</Text>
            <PlatformPicker
              selectedValue={track.trackType}
              onValueChange={(val) => handleTrackTypeChange(track, val as TrackType)}
              items={getAllTrackTypes().map((t) => ({
                label: getTrackDefinition(t).name,
                value: t,
              }))}
            />

            <Row label="תאריך התחלה" value={toHebrewDate(startDateObj).full} />
            <TouchableOpacity
              style={styles.changeButton}
              onPress={() =>
                setEditing(isEditingDate ? null : { trackId: track.id, field: "date" })
              }
            >
              <Text style={styles.changeButtonText}>
                {isEditingDate ? "סגור" : "שנה תאריך"}
              </Text>
            </TouchableOpacity>
            {isEditingDate && (
              <PlatformDatePicker
                value={startDateObj}
                onChange={(d) => handleDateChange(track, d)}
              />
            )}

            <Row label="מתחיל ב" value={startUnit?.label ?? "—"} />
            <ProgressRow
              label="התקדמות בתכנית"
              count={`${progress.current} / ${progress.total}`}
              percent={`${progress.percent}%`}
            />
            <TouchableOpacity
              style={styles.changeButton}
              onPress={() => (isEditingGroups ? setEditing(null) : startEditingGroups(track))}
            >
              <Text style={styles.changeButtonText}>
                {isEditingGroups ? "סגור" : "שנה מסכתות/ספרים"}
              </Text>
            </TouchableOpacity>
            {isEditingGroups && editing?.field === "groups" && (
              <View>
                <GroupSelector
                  definition={def}
                  selected={editing.selected}
                  onChange={(s) =>
                    setEditing({ trackId: track.id, field: "groups", selected: s })
                  }
                />
                <TouchableOpacity
                  style={[
                    styles.saveButton,
                    editing.selected.length === 0 && styles.saveButtonDisabled,
                  ]}
                  onPress={() => handleGroupsSave(track, editing.selected)}
                  disabled={editing.selected.length === 0}
                >
                  <Text style={styles.saveButtonText}>שמור</Text>
                </TouchableOpacity>
              </View>
            )}

            {settings.tracks.length > 1 && (
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => handleRemoveTrack(track)}
              >
                <Text style={styles.removeButtonText}>מחק מסלול</Text>
              </TouchableOpacity>
            )}
          </View>
        );
      })}

      {addingTrack ? (
        <View style={styles.card}>
          <Text style={styles.trackTitle}>מסלול חדש</Text>
          <Text style={styles.pickerLabel}>סוג מסלול</Text>
          <PlatformPicker
            selectedValue={newTrackType}
            onValueChange={(val) => setNewTrackType(val as TrackType)}
            items={getAllTrackTypes().map((t) => ({
              label: getTrackDefinition(t).name,
              value: t,
            }))}
          />
          <View style={styles.addCardButtons}>
            <TouchableOpacity style={styles.saveButton} onPress={handleAddTrack}>
              <Text style={styles.saveButtonText}>צור מסלול</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.changeButton}
              onPress={() => { setAddingTrack(false); setNewTrackType("mishna"); }}
            >
              <Text style={styles.changeButtonText}>ביטול</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <TouchableOpacity style={styles.addButton} onPress={() => setAddingTrack(true)}>
          <Text style={styles.addButtonText}>+ הוסף מסלול</Text>
        </TouchableOpacity>
      )}

      <View style={styles.card}>
        <TouchableOpacity style={styles.dangerButton} onPress={confirmResetProgress}>
          <Text style={styles.dangerButtonText}>אפס התקדמות</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.dangerButton, styles.dangerButtonFull]}
          onPress={confirmFullReset}
        >
          <Text style={[styles.dangerButtonText, { color: theme.colors.background.card }]}>
            התחל מחדש (מחק הכל)
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={rowStyles.row}>
      <Text style={rowStyles.value}>{value}</Text>
      <Text style={rowStyles.label}>{label}</Text>
    </View>
  );
}

function ProgressRow({
  label,
  count,
  percent,
}: {
  label: string;
  count: string;
  percent: string;
}) {
  return (
    <View style={rowStyles.row}>
      <Text style={rowStyles.value}>{percent}</Text>
      <Text style={[rowStyles.value, rowStyles.progressCount]}>{count}</Text>
      <Text style={rowStyles.label}>{label}</Text>
    </View>
  );
}

const rowStyles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
  },
  label: { fontSize: 15, fontFamily: theme.typography.fonts.body, color: theme.colors.text.hint, textAlign: "right" },
  value: { fontSize: 15, fontFamily: theme.typography.fonts.semibold, color: theme.colors.text.primary },
  progressCount: { flex: 1, textAlign: "center" },
});

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.colors.background.primary },
  container: { padding: theme.spacing.lg, paddingBottom: 40 },
  card: {
    backgroundColor: theme.colors.background.card,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    ...theme.shadows.sm,
  },
  trackTitle: {
    fontSize: theme.typography.sizes.lg,
    fontFamily: theme.typography.fonts.extrabold,
    color: theme.colors.text.primary,
    textAlign: "right",
    marginBottom: theme.spacing.sm,
  },
  pickerLabel: {
    fontSize: theme.typography.sizes.sm,
    fontFamily: theme.typography.fonts.semibold,
    color: theme.colors.text.secondary,
    textAlign: "right",
    marginBottom: 2,
  },
  changeButton: {
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
    backgroundColor: theme.colors.background.section,
    borderRadius: theme.borderRadius.md,
    padding: 10,
    alignItems: "center",
  },
  changeButtonText: {
    color: theme.colors.accent.primary,
    fontFamily: theme.typography.fonts.bold,
    fontSize: theme.typography.sizes.base - 1,
  },
  saveButton: {
    marginTop: theme.spacing.md,
    backgroundColor: theme.colors.accent.primary,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    alignItems: "center",
  },
  saveButtonDisabled: { backgroundColor: theme.colors.accent.light },
  saveButtonText: {
    color: theme.colors.background.card,
    fontFamily: theme.typography.fonts.bold,
    fontSize: theme.typography.sizes.base - 1,
  },
  removeButton: {
    marginTop: theme.spacing.md,
    borderWidth: 1.5,
    borderColor: theme.colors.semantic.danger,
    borderRadius: theme.borderRadius.md,
    padding: 10,
    alignItems: "center",
  },
  removeButtonText: {
    color: theme.colors.semantic.danger,
    fontFamily: theme.typography.fonts.bold,
    fontSize: theme.typography.sizes.sm,
  },
  addButton: {
    backgroundColor: theme.colors.background.card,
    borderRadius: theme.borderRadius.xl,
    borderWidth: 1.5,
    borderColor: theme.colors.accent.border,
    borderStyle: "dashed",
    padding: theme.spacing.lg,
    alignItems: "center",
    marginBottom: theme.spacing.lg,
  },
  addButtonText: {
    color: theme.colors.accent.primary,
    fontFamily: theme.typography.fonts.bold,
    fontSize: theme.typography.sizes.base,
  },
  addCardButtons: { marginTop: theme.spacing.sm, gap: theme.spacing.sm },
  dangerButton: {
    borderWidth: 1.5,
    borderColor: theme.colors.semantic.danger,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    alignItems: "center",
    marginTop: theme.spacing.sm,
  },
  dangerButtonFull: {
    backgroundColor: theme.colors.semantic.danger,
    borderColor: theme.colors.semantic.danger,
  },
  dangerButtonText: {
    color: theme.colors.semantic.danger,
    fontFamily: theme.typography.fonts.bold,
    fontSize: theme.typography.sizes.base - 1,
  },
});
