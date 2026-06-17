import React, { useEffect, useRef, useState } from "react";
import { View, Image, Text, ActivityIndicator, Animated, StyleSheet } from "react-native";
import theme from "../theme";

interface Props {
  visible: boolean;
}

export default function SplashScreen({ visible }: Props) {
  const opacity = useRef(new Animated.Value(1)).current;
  const [mounted, setMounted] = useState(true);

  useEffect(() => {
    if (!visible) {
      const timer = setTimeout(() => {
        Animated.timing(opacity, {
          toValue: 0,
          duration: 750,
          useNativeDriver: true,
        }).start(() => setMounted(false));
      }, 1250);
      return () => clearTimeout(timer);
    }
  }, [visible]);

  if (!mounted) return null;

  return (
    <Animated.View style={[StyleSheet.absoluteFill, styles.container, { opacity }]}>
      <Image
        source={require("../../assets/logo_with_text.png")}
        style={styles.image}
      />
      <ActivityIndicator size="large" color={theme.colors.accent.primary} />
      <View style={styles.footer}>
        <Text style={styles.copyright}>
          © כל הזכויות שמורות ליעקב חיים פינקרט
        </Text>
        <Text style={styles.dedication}>
          מוקדש ב-❤️ ללומדי התורה
        </Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffff",
    zIndex: 999,
  },
  image: {
    width: "100%",
    resizeMode: "contain",
    marginBottom: 20,
  },
  footer: {
    position: "absolute",
    bottom: 60,
    alignItems: "center",
  },
  copyright: {
    fontSize: 18,
    color: "#666",
    marginBottom: 20,
  },
  dedication: {
    fontSize: 18,
    color: "#666",
  },
});
