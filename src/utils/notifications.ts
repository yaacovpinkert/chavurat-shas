import { Platform } from "react-native";
import { NotificationSettings } from "../store/storage";

const DAILY_NOTIFICATION_ID_KEY = "daily-reminder";
const NOTIFICATION_BODY = "הגיע הזמן ללמוד ולחזור כדי שתזכור!";

// Lazy-require so the native module is never loaded in Expo Go or on web.
function getNotifications() {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    return require("expo-notifications") as typeof import("expo-notifications");
  } catch {
    return null;
  }
}

export function setupNotificationHandler() {
  if (Platform.OS === "web") return;
  const N = getNotifications();
  if (!N) return;
  try {
    N.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });
  } catch {
    // Native notification module unavailable (e.g. Expo Go) — silently skip.
  }
}

export async function scheduleDaily(settings: NotificationSettings): Promise<void> {
  if (Platform.OS === "web") return;
  const N = getNotifications();
  if (!N) return;

  try {
    await N.cancelScheduledNotificationAsync(DAILY_NOTIFICATION_ID_KEY).catch(() => {});

    if (!settings.enabled) return;

    if (Platform.OS === "android") {
      await N.setNotificationChannelAsync("default", {
        name: "תזכורת יומית",
        importance: N.AndroidImportance.DEFAULT,
      });
    }

    await N.scheduleNotificationAsync({
      identifier: DAILY_NOTIFICATION_ID_KEY,
      content: {
        title: 'חבורת ש"ס',
        body: NOTIFICATION_BODY,
      },
      trigger: {
        type: N.SchedulableTriggerInputTypes.DAILY,
        hour: settings.hour,
        minute: settings.minute,
      },
    });
  } catch {
    // Native notification module unavailable (e.g. Expo Go) — silently skip.
  }
}

export async function cancelDaily(): Promise<void> {
  if (Platform.OS === "web") return;
  const N = getNotifications();
  if (!N) return;
  try {
    await N.cancelScheduledNotificationAsync(DAILY_NOTIFICATION_ID_KEY);
  } catch {
    // silently skip in Expo Go
  }
}
