import { Alert, Platform } from "react-native";

// react-native-web's Alert.alert is a no-op for the buttons array, so the
// destructive onPress never fires on web. Route confirmations through
// window.confirm there and the native Alert everywhere else.
export function confirmAction(
  title: string,
  message: string,
  confirmLabel: string,
  onConfirm: () => void
) {
  if (Platform.OS === "web") {
    if (window.confirm(`${title}\n\n${message}`)) onConfirm();
    return;
  }
  Alert.alert(title, message, [
    { text: "ביטול", style: "cancel" },
    { text: confirmLabel, style: "destructive", onPress: onConfirm },
  ]);
}

export function notify(title: string, message: string) {
  if (Platform.OS === "web") {
    window.alert(`${title}\n\n${message}`);
    return;
  }
  Alert.alert(title, message);
}
