import { createTheme } from "@mui/material/styles";

// Main custom colors
const customColors = {
  // Qubic colors
  qubicBlue: "#61f0fe",
  qubicBlueLight: "#2C3E50",

  // Neutral colors
  white: "#ffffff",
  black: "#000000",
  darkBackground: "#121212",
  darkSurface: "#232323",

  // Gray colors
  gray50: "#f9fafb",
  gray100: "#f3f4f6",
  gray200: "#e5e7eb",
  gray300: "#d1d5db",
  gray400: "#9ca3af",
  gray500: "#6b7280",

  // Accent colors
  error: "#ef4444",
  warning: "#f59e0b",
  success: "#10b981",
};

// Light theme
export const lightTheme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: customColors.qubicBlueLight,
      contrastText: customColors.black,
    },
    secondary: {
      main: customColors.gray200,
      contrastText: customColors.black,
    },
    tertiary: {
      main: customColors.gray500,
    },
    error: {
      main: customColors.error,
    },
    warning: {
      main: customColors.warning,
    },
    success: {
      main: customColors.success,
    },
    background: {
      default: customColors.white,
      paper: customColors.gray100,
      card: customColors.gray100,
    },
    text: {
      primary: customColors.black,
      secondary: customColors.gray500,
    },
    divider: customColors.gray300,
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 600,
      fontSize: "2.5rem",
    },
    h2: {
      fontWeight: 600,
      fontSize: "2rem",
    },
    h3: {
      fontWeight: 600,
      fontSize: "1.75rem",
    },
    body1: {
      fontSize: "1rem",
      lineHeight: 1.5,
    },
    body2: {
      fontSize: "0.875rem",
      lineHeight: 1.5,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 500,
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          backgroundColor: customColors.white,
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: "filled",
      },
    },
  },
});

// Dark theme
export const darkTheme = createTheme({
  ...lightTheme,
  palette: {
    mode: "dark",
    primary: {
      main: customColors.qubicBlue,
      contrastText: customColors.black,
    },
    secondary: {
      main: customColors.gray200,
      contrastText: customColors.white,
    },
    tertiary: {
      main: customColors.gray200,
    },
    error: {
      main: customColors.error,
    },
    warning: {
      main: customColors.warning,
    },
    success: {
      main: customColors.success,
    },
    background: {
      default: customColors.darkBackground,
      paper: customColors.darkSurface,
      card: customColors.black,
    },
    text: {
      primary: customColors.white,
      secondary: customColors.gray400,
    },
    divider: customColors.gray200,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 500,
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          backgroundColor: customColors.darkBackground,
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: "filled",
      },
    },
  },
});
