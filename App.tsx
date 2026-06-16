import React, { Component, ErrorInfo, ReactNode, useEffect, useState } from "react";
import { I18nManager, Platform, ActivityIndicator, View, Text, ScrollView, StyleSheet } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useFonts } from "@expo-google-fonts/heebo";

import SetupScreen from "./src/screens/SetupScreen";
import TodayScreen from "./src/screens/TodayScreen";
import CalendarScreen from "./src/screens/CalendarScreen";
import SettingsScreen from "./src/screens/SettingsScreen";
import { loadSettings } from "./src/store/storage";
import theme from "./src/theme";

// The real RTL switch lives in app.json (extra.supportsRTL/forcesRTL via
// expo-localization); these calls only cover a standalone first launch and
// take effect on the next native start.
if (Platform.OS !== "web") {
  I18nManager.allowRTL(true);
  I18nManager.forceRTL(true);
}

// ─── Error Boundary ───────────────────────────────────────────────────────

class ErrorBoundary extends Component<
  { children: ReactNode },
  { error: Error | null }
> {
  state = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[ErrorBoundary]", error.message, info.componentStack);
  }

  render() {
    if (this.state.error) {
      const err = this.state.error as Error;
      return (
        <ScrollView
          style={{ flex: 1, backgroundColor: theme.colors.background.primary }}
          contentContainerStyle={{ padding: 20 }}
        >
          <Text style={eb.title}>שגיאה</Text>
          <Text style={eb.msg}>{err.message}</Text>
          <Text style={eb.stack}>{err.stack}</Text>
        </ScrollView>
      );
    }
    return this.props.children;
  }
}

const eb = StyleSheet.create({
  title: { fontSize: 20, fontWeight: theme.typography.weights.bold, color: theme.colors.semantic.danger, marginBottom: 12 },
  msg: { fontSize: 15, color: theme.colors.text.secondary, marginBottom: 12 },
  stack: { fontSize: 11, color: theme.colors.text.hint, fontFamily: theme.typography.fonts.mono },
});

// ─── Navigation ───────────────────────────────────────────────────────────

const Tab = createBottomTabNavigator();

function TabIcon({ label, color }: { label: string; color: string }) {
  const icons: Record<string, string> = {
    היום: "📖",
    "לוח שנה": "📅",
    הגדרות: "⚙️",
  };
  return <Text style={{ fontSize: 18, color }}>{icons[label] ?? "•"}</Text>;
}

function MainApp({ onReset }: { onReset: () => void }) {
  return (
    <NavigationContainer>
      <Tab.Navigator
        initialRouteName="Today"
        screenOptions={{
          headerStyle: { backgroundColor: theme.colors.background.primary },
          headerTitleAlign: "center",
          headerTitleStyle: { fontWeight: theme.typography.weights.bold, fontSize: 18, fontFamily: theme.typography.fonts.heading },
          tabBarActiveTintColor: theme.colors.accent.primary,
          tabBarInactiveTintColor: theme.colors.text.hint,
          tabBarStyle: {
            backgroundColor: theme.colors.background.card,
            borderTopColor: theme.colors.border.light,
          },
        }}
      >
        {/* Screens are declared in reverse so the tab bar reads right-to-left:
            היום · לוח שנה · הגדרות. The bottom-tab bar lays tabs out in
            declaration order (left→right) and ignores tabBarStyle.flexDirection,
            so order is controlled here. initialRouteName keeps היום as landing. */}
        <Tab.Screen
          name="Settings"
          options={{
            title: "הגדרות",
            tabBarLabel: "הגדרות",
            tabBarIcon: ({ color }) => <TabIcon label="הגדרות" color={color} />,
          }}
        >
          {() => <SettingsScreen onReset={onReset} />}
        </Tab.Screen>
        <Tab.Screen
          name="Calendar"
          component={CalendarScreen}
          options={{
            title: "לוח שנה",
            tabBarLabel: "לוח שנה",
            tabBarIcon: ({ color }) => <TabIcon label="לוח שנה" color={color} />,
          }}
        />
        <Tab.Screen
          name="Today"
          component={TodayScreen}
          options={{
            title: "היום",
            tabBarLabel: "היום",
            tabBarIcon: ({ color }) => <TabIcon label="היום" color={color} />,
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────

export default function App() {
  const [hasSettings, setHasSettings] = useState<boolean | null>(null);
  const [fontsLoaded] = useFonts({
    Heebo: require("./node_modules/@expo-google-fonts/heebo/400Regular/Heebo_400Regular.ttf"),
    "Heebo-SemiBold": require("./node_modules/@expo-google-fonts/heebo/600SemiBold/Heebo_600SemiBold.ttf"),
    "Heebo-Bold": require("./node_modules/@expo-google-fonts/heebo/700Bold/Heebo_700Bold.ttf"),
    "Heebo-ExtraBold": require("./node_modules/@expo-google-fonts/heebo/800ExtraBold/Heebo_800ExtraBold.ttf"),
  });

  useEffect(() => {
    loadSettings().then((s) => setHasSettings(s !== null));
  }, []);

  const ready = fontsLoaded && hasSettings !== null;

  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        {!ready && (
          <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: theme.colors.background.primary }}>
            <ActivityIndicator size="large" color={theme.colors.accent.primary} />
          </View>
        )}
        {ready && hasSettings === false && (
          <SetupScreen onComplete={() => setHasSettings(true)} />
        )}
        {ready && hasSettings === true && (
          <MainApp onReset={() => setHasSettings(false)} />
        )}
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}
