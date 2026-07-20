import { createContext, useContext } from "react";

export type ApplicationTheme = "light" | "dark";

export interface IThemeContext {
  theme: ApplicationTheme;
  toggleTheme(): void;
}

export const ThemeContext = createContext<IThemeContext | null>(null);

export function useTheme(): IThemeContext {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within ThemeProvider");
  return context;
}
