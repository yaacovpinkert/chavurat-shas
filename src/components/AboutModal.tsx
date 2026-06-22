import React from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import theme from "../theme";

type Props = {
  visible: boolean;
  onClose: () => void;
};

/**
 * "אודות" modal — a short description of the חבורת ש"ס method and how to use
 * the app. Opened from the "i" button in every screen's header (see App.tsx).
 */
export default function AboutModal({ visible, onClose }: Props) {
  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay} />
      </TouchableWithoutFeedback>
      <View style={styles.centerWrap} pointerEvents="box-none">
        <View style={styles.card}>
          <Text style={styles.title}>חבורת ש"ס</Text>
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.heading}>מהי חבורת ש"ס?</Text>
            <Text style={styles.paragraph}>
              תוכנית לחזרה ושינון של חומר תורני באופן שמשמר את הנלמד כ"מונח
              בכיס". השיטה מתאימה לכל נושא ולכל כמות — תורה, משנה, גמרא, מוסר
              והלכה, סיכומי דפים, סוגיות ושיעורים.
            </Text>
            <Text style={styles.paragraph}>
              היא מבוססת על מחקרי הזיכרון, המבחינים בין זיכרון לטווח קצר לבין
              זיכרון לטווח ארוך. חזרה מתוזמנת על החומר מעבירה אותו לזיכרון
              ארוך הטווח, עד שהוא הופך לקניין קבוע.
            </Text>

            <Text style={styles.heading}>שיטת החזרות</Text>
            <Text style={styles.paragraph}>
              לאחר הלימוד הראשון חוזרים על החומר בחמישה מועדים קבועים:
            </Text>
            <Text style={styles.bullet}>• פעם ראשונה — תוך 24 שעות</Text>
            <Text style={styles.bullet}>• פעם שניה — כעבור שבוע</Text>
            <Text style={styles.bullet}>• פעם שלישית — כעבור חודש</Text>
            <Text style={styles.bullet}>• פעם רביעית — כעבור 3 חודשים</Text>
            <Text style={styles.bullet}>• פעם חמישית — כעבור שנה</Text> 
            <Text style={styles.heading}>איך משתמשים באפליקציה?</Text>
            <Text style={styles.paragraph}>
              במסך "היום" מופיע מה צריך ללמוד ולחזור היום. סמנו כל פריט בסיום
              הלימוד או החזרה — האפליקציה מתזמנת עבורכם אוטומטית את מועדי החזרה
              הבאים.
            </Text>
            <Text style={styles.paragraph}>
              במסך "לוח שנה" ניתן לראות את כל מועדי הלימוד והחזרה לאורך החודש,
              ולסמן פריטים גם לימים אחרים.
              </Text>
            <Text style={styles.paragraph}>
              במסך "הגדרות" קובעים את תוכנית
              הלימוד האישית.
            </Text>
            <Text style={styles.heading}>אודות</Text>
            <Text style={styles.paragraph}>
              אפליקציה זו נוצרה על ידי <Text style={{ fontFamily: theme.typography.fonts.bold }}>יעקב חיים פינקרט</Text>, מתוך אהבה והערכה עמוקה ללומדי התורה, ובשאיפה שתשמש כלי עזר ללימוד ולזיכרון דברי תורתנו הקדושה.
            </Text>
            <Text style={styles.paragraph}>
              © כל הזכויות שמורות 
            </Text>
          </ScrollView>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>סגור</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  centerWrap: {
    // A Modal renders in its own native root that does NOT inherit the app's
    // forced RTL on Android — set direction here so the whole subtree (card,
    // ScrollView, and every Text inside) resolves RTL alignment correctly.
    direction: "rtl",
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    padding: theme.spacing.xl,
  },
  card: {
    // A Modal renders in its own root that does NOT inherit the screen's RTL
    // direction on Android — set it here so the whole card lays out RTL.
    direction: "rtl",
    backgroundColor: theme.colors.background.card,
    borderRadius: theme.borderRadius.xxl,
    padding: theme.spacing.xl,
    width: "100%",
    maxWidth: 440,
    maxHeight: "82%",
    ...theme.shadows.lg,
  },
  title: {
    fontSize: theme.typography.sizes.xxl,
    fontFamily: theme.typography.fonts.extrabold,
    color: theme.colors.accent.primary,
    textAlign: "center",
    writingDirection: "rtl",
    marginBottom: theme.spacing.md,
  },
  scroll: {
    flexGrow: 0,
  },
  scrollContent: {
    paddingBottom: theme.spacing.xs,
  },
  heading: {
    fontSize: theme.typography.sizes.lg,
    fontFamily: theme.typography.fonts.bold,
    color: theme.colors.text.primary,
    writingDirection: "rtl",
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.xs,
  },
  paragraph: {
    fontSize: theme.typography.sizes.base,
    fontFamily: theme.typography.fonts.body,
    color: theme.colors.text.secondary,
    writingDirection: "rtl",
    lineHeight: theme.typography.sizes.base * theme.typography.lineHeights.relaxed,
    marginBottom: theme.spacing.sm,
  },
  bullet: {
    fontSize: theme.typography.sizes.base,
    fontFamily: theme.typography.fonts.semibold,
    color: theme.colors.text.secondary,
    writingDirection: "rtl",
    lineHeight: theme.typography.sizes.base * theme.typography.lineHeights.relaxed,
  },
  closeButton: {
    marginTop: theme.spacing.lg,
    backgroundColor: theme.colors.background.section,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    alignItems: "center",
  },
  closeButtonText: {
    fontSize: theme.typography.sizes.base,
    fontFamily: theme.typography.fonts.bold,
    color: theme.colors.accent.primary,
  },
});
