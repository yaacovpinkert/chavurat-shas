import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import PlatformPicker from "../components/PlatformPicker";
import HebrewCalendar from "../components/HebrewCalendar";
import UnitPicker from "../components/UnitPicker";
import { TrackType } from "../tracks/types";
import { getTrackDefinition, getAllTrackTypes, getDefaultPath } from "../tracks/registry";
import { saveSettings, newTrackId } from "../store/storage";
import { formatDateString } from "../utils/schedule";
import { toHebrewDate, toHebrewYMD } from "../utils/hebrewDate";

type Props = {
  onComplete: () => void;
};

export default function SetupScreen({ onComplete }: Props) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [trackType, setTrackType] = useState<TrackType>("mishna");
  const [startDate, setStartDate] = useState(new Date());
  const [path, setPath] = useState<(string | number)[]>(() =>
    getDefaultPath(getTrackDefinition("mishna"))
  );

  const todayHeb = toHebrewYMD(new Date());
  const [calYear, setCalYear] = useState(todayHeb.year);
  const [calMonth, setCalMonth] = useState(todayHeb.month);

  const definition = getTrackDefinition(trackType);

  function onTrackTypeChange(val: TrackType) {
    setTrackType(val);
    setPath(getDefaultPath(getTrackDefinition(val)));
  }

  async function handleConfirm() {
    await saveSettings({
      version: 2,
      tracks: [
        {
          id: newTrackId(),
          trackType,
          startDate: formatDateString(startDate),
          startUnitIndex: definition.getIndexForPath(path),
        },
      ],
    });
    onComplete();
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>חבורת ש״ס</Text>
      <Text style={styles.subtitle}>הגדרת לימוד</Text>

      {step === 1 && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>מסלול לימוד</Text>
          <Text style={styles.hint}>מה לומדים?</Text>

          <PlatformPicker
            selectedValue={trackType}
            onValueChange={(val) => onTrackTypeChange(val as TrackType)}
            items={getAllTrackTypes().map((t) => ({
              label: getTrackDefinition(t).name,
              value: t,
            }))}
          />

          <TouchableOpacity
            style={[styles.nextButton, { marginTop: 24 }]}
            onPress={() => setStep(2)}
          >
            <Text style={styles.nextButtonText}>הבא</Text>
          </TouchableOpacity>
        </View>
      )}

      {step === 2 && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>תאריך התחלה</Text>
          <Text style={styles.hint}>מתי מתחילים ללמוד?</Text>

          <Text style={styles.selectedDate}>{toHebrewDate(startDate).full}</Text>
          <HebrewCalendar
            year={calYear}
            month={calMonth}
            markings={{ [formatDateString(startDate)]: { selected: true, selectedColor: "#4A90E2" } }}
            onDayPress={(date) => setStartDate(date)}
            onMonthChange={(ym) => { setCalYear(ym.year); setCalMonth(ym.month); }}
            highlightToday={false}
          />

          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.backButton} onPress={() => setStep(1)}>
              <Text style={styles.backButtonText}>חזור</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.nextButton} onPress={() => setStep(3)}>
              <Text style={styles.nextButtonText}>הבא</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {step === 3 && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>נקודת התחלה</Text>
          <Text style={styles.hint}>מאיפה מתחילים ב{definition.name}?</Text>

          <UnitPicker definition={definition} path={path} onChange={setPath} />

          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.backButton} onPress={() => setStep(2)}>
              <Text style={styles.backButtonText}>חזור</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.nextButton} onPress={handleConfirm}>
              <Text style={styles.nextButtonText}>התחל !</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#f0f4ff",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 36,
    fontWeight: "900",
    color: "#1a1a2e",
    marginBottom: 4,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 18,
    color: "#555",
    marginBottom: 30,
    textAlign: "center",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    width: "100%",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1a1a2e",
    textAlign: "right",
    marginBottom: 6,
  },
  hint: {
    fontSize: 14,
    color: "#888",
    textAlign: "right",
    marginBottom: 20,
  },
  selectedDate: {
    fontSize: 18,
    fontWeight: "700",
    color: "#4A90E2",
    textAlign: "center",
    marginBottom: 12,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 24,
    gap: 12,
  },
  nextButton: {
    backgroundColor: "#4A90E2",
    borderRadius: 10,
    padding: 14,
    flex: 1,
    alignItems: "center",
  },
  backButton: {
    backgroundColor: "#eee",
    borderRadius: 10,
    padding: 14,
    flex: 1,
    alignItems: "center",
  },
  nextButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  backButtonText: {
    color: "#555",
    fontSize: 16,
    fontWeight: "600",
  },
});
