import React, { Component, ErrorInfo, ReactNode, useEffect, useState } from "react";
import { I18nManager, Platform, ActivityIndicator, View, Text, ScrollView, StyleSheet } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { SafeAreaProvider } from "react-native-safe-area-context";

import SetupScreen from "./src/screens/SetupScreen";
import TodayScreen from "./src/screens/TodayScreen";
import CalendarScreen from "./src/screens/CalendarScreen";
import SettingsScreen from "./src/screens/SettingsScreen";
import { loadSettings } from "./src/store/storage";

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
          style={{ flex: 1, backgroundColor: "#fff2f2" }}
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
  title: { fontSize: 20, fontWeight: "700", color: "#c00", marginBottom: 12 },
  msg: { fontSize: 15, color: "#333", marginBottom: 12 },
  stack: { fontSize: 11, color: "#666", fontFamily: "monospace" },
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
          headerStyle: { backgroundColor: "#f0f4ff" },
          headerTitleAlign: "center",
          headerTitleStyle: { fontWeight: "700", fontSize: 18 },
          tabBarActiveTintColor: "#4A90E2",
          tabBarInactiveTintColor: "#999",
          tabBarStyle: {
            backgroundColor: "#fff",
            borderTopColor: "#e8edf5",
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

  useEffect(() => {
    loadSettings().then((s) => setHasSettings(s !== null));
  }, []);

  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        {hasSettings === null && (
          <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
            <ActivityIndicator size="large" color="#4A90E2" />
          </View>
        )}
        {hasSettings === false && (
          <SetupScreen onComplete={() => setHasSettings(true)} />
        )}
        {hasSettings === true && (
          <MainApp onReset={() => setHasSettings(false)} />
        )}
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}
