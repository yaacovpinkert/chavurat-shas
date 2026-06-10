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
import UnitPicker from "../components/UnitPicker";
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
import { getTrackDefinition, getAllTrackTypes, getDefaultPath } from "../tracks/registry";
import { formatDateString, parseDateString } from "../utils/schedule";
import { toHebrewDate } from "../utils/hebrewDate";
import { confirmAction, notify } from "../utils/dialog";

type Props = {
  onReset: () => void;
};

type Editing =
  | { trackId: string; field: "date" }
  | { trackId: string; field: "unit"; path: (string | number)[] }
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

  function startEditingUnit(track: TrackConfig) {
    const def = getTrackDefinition(track.trackType);
    const unit = def.getUnitByIndex(track.startUnitIndex);
    setEditing({
      trackId: track.id,
      field: "unit",
      path: unit?.path ?? getDefaultPath(def),
    });
  }

  async function handleUnitSave(track: TrackConfig, path: (string | number)[]) {
    const def = getTrackDefinition(track.trackType);
    const updated = await updateTrack(track.id, {
      startUnitIndex: def.getIndexForPath(path),
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
        const isEditingDate =
          editing?.trackId === track.id && editing.field === "date";
        const isEditingUnit =
          editing?.trackId === track.id && editing.field === "unit";

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

            <Row label="נקודת התחלה" value={startUnit?.label ?? "—"} />
            <Row
              label="מיקום במסלול"
              value={`${track.startUnitIndex} / ${def.unitCount}`}
            />
            <TouchableOpacity
              style={styles.changeButton}
              onPress={() => (isEditingUnit ? setEditing(null) : startEditingUnit(track))}
            >
              <Text style={styles.changeButtonText}>
                {isEditingUnit ? "סגור" : "שנה נקודת התחלה"}
              </Text>
            </TouchableOpacity>
            {isEditingUnit && editing?.field === "unit" && (
              <View>
                <UnitPicker
                  definition={def}
                  path={editing.path}
                  onChange={(p) => setEditing({ trackId: track.id, field: "unit", path: p })}
                />
                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={() => handleUnitSave(track, editing.path)}
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
          <Text style={[styles.dangerButtonText, { color: "#fff" }]}>
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

const rowStyles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  label: { fontSize: 15, color: "#888", textAlign: "right" },
  value: { fontSize: 15, fontWeight: "600", color: "#1a1a2e" },
});

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#f0f4ff" },
  container: { padding: 16, paddingBottom: 40 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  trackTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1a1a2e",
    textAlign: "right",
    marginBottom: 8,
  },
  pickerLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#444",
    textAlign: "right",
    marginBottom: 2,
  },
  changeButton: {
    marginTop: 8,
    marginBottom: 8,
    backgroundColor: "#f0f4ff",
    borderRadius: 8,
    padding: 10,
    alignItems: "center",
  },
  changeButtonText: { color: "#4A90E2", fontWeight: "700", fontSize: 15 },
  saveButton: {
    marginTop: 12,
    backgroundColor: "#4A90E2",
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
  },
  saveButtonText: { color: "#fff", fontWeight: "700", fontSize: 15 },
  removeButton: {
    marginTop: 12,
    borderWidth: 1.5,
    borderColor: "#D0021B",
    borderRadius: 8,
    padding: 10,
    alignItems: "center",
  },
  removeButtonText: { color: "#D0021B", fontWeight: "700", fontSize: 14 },
  addButton: {
    backgroundColor: "#fff",
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#4A90E2",
    borderStyle: "dashed",
    padding: 16,
    alignItems: "center",
    marginBottom: 16,
  },
  addButtonText: { color: "#4A90E2", fontWeight: "700", fontSize: 16 },
  addCardButtons: { marginTop: 8, gap: 8 },
  dangerButton: {
    borderWidth: 1.5,
    borderColor: "#D0021B",
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
    marginTop: 8,
  },
  dangerButtonFull: { backgroundColor: "#D0021B", borderColor: "#D0021B" },
  dangerButtonText: { color: "#D0021B", fontWeight: "700", fontSize: 15 },
});
