"use client";

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  createTheme,
  ThemeProvider as MuiThemeProvider,
} from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

export type ThemeMode = 'corporate' | 'dark';

interface ThemeContextType {
  themeMode: ThemeMode;
  isDark: boolean;
  theme: ThemeMode;
  toggleTheme: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const createAppTheme = (mode: ThemeMode) => {
  const isDark = mode === "dark";

  return createTheme({
    palette: {
      mode: isDark ? "dark" : "light",
      primary: {
        main: isDark ? "#080769" : "#080769",
      },
      secondary: {
        main: isDark ? "#bcbff7" : "#bcbff7",
      },
      background: {
        default: isDark ? "#05050e" : "#F5F5FB",
        paper: isDark ? "#0c0c12" : "#fff",
      },
    },
    components: {
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: isDark ? "#080769" : "#080769",
          },
        },
      },

      MuiListItemButton: {
        styleOverrides: {
          root: {
            "&.Mui-selected": {
              fontWeight: "bold",
              color: isDark
                ? "rgb(255, 255, 255)"
                : "rgb(220, 220, 232)",
            },
            "&.Mui-selected:hover": {
              backgroundColor: isDark
                ? "rgba(255, 255, 255, 0.12)"
                : "rgba(8, 7, 105, 0.12)",
            },
          },
        },
      },
    },
  });
};

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeMode, setThemeMode] = useState<ThemeMode>("corporate");

  useEffect(() => {
    const savedTheme = localStorage.getItem("netuno-theme") as ThemeMode | null;
    if (savedTheme && (savedTheme === "corporate" || savedTheme === "dark")) {
      setThemeMode(savedTheme);
    }
  }, []);

  const toggleTheme = useCallback((mode: ThemeMode) => {
    setThemeMode(mode);
    localStorage.setItem("netuno-theme", mode);
  }, []);

  const isDark = themeMode === "dark";
  const muiTheme = useMemo(() => createAppTheme(themeMode), [themeMode]);

  return (
    <ThemeContext.Provider value={{ themeMode, isDark, toggleTheme, theme: themeMode }}>
      <MuiThemeProvider theme={muiTheme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
