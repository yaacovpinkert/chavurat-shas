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
import GroupSelector from "../components/GroupSelector";
import { TrackType } from "../tracks/types";
import {
  getTrackDefinition,
  getAllTrackTypes,
  getAllGroupKeys,
  startIndexForSelection,
} from "../tracks/registry";
import { saveSettings, newTrackId } from "../store/storage";
import { formatDateString } from "../utils/schedule";
import { toHebrewDate, toHebrewYMD } from "../utils/hebrewDate";
import theme from "../theme";

type Props = {
  onComplete: () => void;
};

export default function SetupScreen({ onComplete }: Props) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [trackType, setTrackType] = useState<TrackType>("mishna");
  const [startDate, setStartDate] = useState(new Date());
  const [selectedGroups, setSelectedGroups] = useState<string[]>(() =>
    getAllGroupKeys(getTrackDefinition("mishna"))
  );

  const todayHeb = toHebrewYMD(new Date());
  const [calYear, setCalYear] = useState(todayHeb.year);
  const [calMonth, setCalMonth] = useState(todayHeb.month);

  const definition = getTrackDefinition(trackType);

  function onTrackTypeChange(val: TrackType) {
    setTrackType(val);
    setSelectedGroups(getAllGroupKeys(getTrackDefinition(val)));
  }

  async function handleConfirm() {
    if (selectedGroups.length === 0) return;
    await saveSettings({
      version: 2,
      tracks: [
        {
          id: newTrackId(),
          trackType,
          startDate: formatDateString(startDate),
          startUnitIndex: startIndexForSelection(definition, selectedGroups),
          selectedGroups,
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
            markings={{ [formatDateString(startDate)]: { selected: true, selectedColor: theme.colors.accent.primary } }}
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
          <Text style={styles.sectionTitle}>בחירת מסכתות וספרים</Text>
          <Text style={styles.hint}>מה לומדים ב{definition.name}?</Text>

          <GroupSelector
            definition={definition}
            selected={selectedGroups}
            onChange={setSelectedGroups}
          />

          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.backButton} onPress={() => setStep(2)}>
              <Text style={styles.backButtonText}>חזור</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.nextButton, selectedGroups.length === 0 && styles.nextButtonDisabled]}
              onPress={handleConfirm}
              disabled={selectedGroups.length === 0}
            >
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
    // RTL root for the whole screen — cascades to every descendant via Yoga.
    direction: "rtl",
    flexGrow: 1,
    backgroundColor: theme.colors.background.primary,
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing.xl,
  },
  title: {
    fontSize: theme.typography.sizes.xxxxl,
    fontFamily: theme.typography.fonts.extrabold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
    textAlign: "center",
  },
  subtitle: {
    fontSize: theme.typography.sizes.lg,
    fontFamily: theme.typography.fonts.body,
    color: theme.colors.text.secondary,
    marginBottom: 30,
    textAlign: "center",
  },
  card: {
    backgroundColor: theme.colors.background.card,
    borderRadius: theme.borderRadius.xxl,
    padding: theme.spacing.xxl,
    width: "100%",
    ...theme.shadows.md,
  },
  sectionTitle: {
    fontSize: theme.typography.sizes.xxl,
    fontFamily: theme.typography.fonts.bold,
    color: theme.colors.text.primary,
    writingDirection: "rtl",
    marginBottom: theme.spacing.sm,
  },
  hint: {
    fontSize: theme.typography.sizes.sm,
    fontFamily: theme.typography.fonts.body,
    color: theme.colors.text.hint,
    writingDirection: "rtl",
    marginBottom: theme.spacing.xl,
  },
  selectedDate: {
    fontSize: theme.typography.sizes.lg,
    fontFamily: theme.typography.fonts.bold,
    color: theme.colors.accent.primary,
    textAlign: "center",
    marginBottom: theme.spacing.md,
  },
  buttonRow: {
    // Back button lands on the right, Next on the left (RTL inherited)
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: theme.spacing.xxl,
    gap: theme.spacing.md,
  },
  nextButton: {
    backgroundColor: theme.colors.accent.primary,
    borderRadius: theme.borderRadius.lg,
    padding: 14,
    flex: 1,
    alignItems: "center",
  },
  nextButtonDisabled: {
    backgroundColor: theme.colors.accent.light,
  },
  backButton: {
    backgroundColor: theme.colors.background.disabled,
    borderRadius: theme.borderRadius.lg,
    padding: 14,
    flex: 1,
    alignItems: "center",
  },
  nextButtonText: {
    color: theme.colors.background.card,
    fontSize: theme.typography.sizes.base,
    fontFamily: theme.typography.fonts.bold,
  },
  backButtonText: {
    color: theme.colors.text.secondary,
    fontSize: theme.typography.sizes.base,
    fontFamily: theme.typography.fonts.semibold,
  },
});
