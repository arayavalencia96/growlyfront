import { type ReactNode, useEffect, useLayoutEffect, useState } from "react";
import {
  type ApplicationTheme,
  ThemeContext,
} from "@/common/components/theme.context";
import { THEME_STORAGE_KEY } from "@/common/services/session.service";

function readTheme(): ApplicationTheme {
  return localStorage.getItem(THEME_STORAGE_KEY) === "dark" ? "dark" : "light";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<ApplicationTheme>(readTheme);

  useLayoutEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  useEffect(
    () => () => {
      document.documentElement.dataset.theme = "light";
      document.documentElement.style.colorScheme = "light";
    },
    [],
  );

  const toggleTheme = () => {
    setTheme((current) => (current === "light" ? "dark" : "light"));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
