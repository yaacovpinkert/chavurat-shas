const theme = {
  colors: {
    background: {
      primary: "#F5F0E8",
      card: "#FFFCF8",
      section: "#F9F5EE",
      disabled: "#F0E8DE",
    },
    text: {
      primary: "#3D3530",
      secondary: "#6B6258",
      hint: "#9B8F83",
      light: "#D4C8BC",
    },
    accent: {
      primary: "#D4A574",
      hover: "#C89666",
      light: "#E8D4B8",
      border: "#D4A574",
    },
    border: {
      light: "#E8DCCF",
      medium: "#D4C8BC",
      strong: "#B8A892",
    },
    semantic: {
      danger: "#D0021B",
      success: "#7ED321",
      warning: "#F5A623",
      info: "#4A90E2",
    },
    // Functional colors for spaced-repetition sessions — DO NOT change
    session: {
      1: "#4A90E2",
      2: "#7ED321",
      3: "#F5A623",
      4: "#D0021B",
      5: "#7B2D8B",
    } as Record<number, string>,
  },

  typography: {
    fonts: {
      body: "Heebo",
      semibold: "Heebo-SemiBold",
      bold: "Heebo-Bold",
      extrabold: "Heebo-ExtraBold",
      heading: "Heebo-Bold",
      mono: "monospace" as const,
    },
    sizes: {
      xs: 12,
      sm: 14,
      base: 16,
      lg: 18,
      xl: 20,
      xxl: 22,
      xxxl: 24,
      xxxxl: 36,
    },
    weights: {
      regular: "400" as const,
      semibold: "600" as const,
      bold: "700" as const,
      extrabold: "800" as const,
    },
    lineHeights: {
      tight: 1.2,
      normal: 1.5,
      relaxed: 1.7,
    },
  },

  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  },

  borderRadius: {
    xs: 4,
    sm: 6,
    md: 8,
    lg: 12,
    xl: 14,
    xxl: 16,
    full: 9999,
  },

  shadows: {
    xs: {
      shadowColor: "#8B7355",
      shadowOpacity: 0.04,
      shadowRadius: 4,
      shadowOffset: { width: 0, height: 2 },
      elevation: 1,
    },
    sm: {
      shadowColor: "#8B7355",
      shadowOpacity: 0.05,
      shadowRadius: 4,
      shadowOffset: { width: 0, height: 2 },
      elevation: 2,
    },
    md: {
      shadowColor: "#8B7355",
      shadowOpacity: 0.08,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 4 },
      elevation: 4,
    },
    lg: {
      shadowColor: "#8B7355",
      shadowOpacity: 0.12,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 6 },
      elevation: 6,
    },
  },
} as const;

export type Theme = typeof theme;
export default theme;

// Helper for web-specific inline CSS styles on <select> and <input> elements,
// which can't use StyleSheet.create().
export const getWebInputStyle = () => ({
  color: theme.colors.text.primary,
  backgroundColor: theme.colors.background.section,
  border: `1.5px solid ${theme.colors.border.light}`,
  fontFamily: theme.typography.fonts.body,
});
