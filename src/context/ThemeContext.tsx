import { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { Theme } from '@mui/material';
import { themes, getThemeByName, AppTheme } from '../theme/themes';
import profileService from '../services/profileService';

const THEME_STORAGE_KEY = 'theme';

interface ThemeContextType {
  theme: Theme;
  themeName: string;
  availableThemes: AppTheme[];
  setTheme: (name: string) => Promise<void>;
  isLoading: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeName, setThemeName] = useState<string>('LIGHT');
  const [isLoading, setIsLoading] = useState(true);

  // Load theme on mount: try profile API first, then localStorage, then default
  useEffect(() => {
    const loadTheme = async () => {
      // Try loading from profile API first
      try {
        const profile = await profileService.getProfile();
        if (profile?.theme) {
          const themeFromApi = profile.theme.toUpperCase();
          // Validate it's a known theme
          if (themes.find(t => t.name === themeFromApi)) {
            setThemeName(themeFromApi);
            localStorage.setItem(THEME_STORAGE_KEY, themeFromApi);
            setIsLoading(false);
            return;
          }
        }
      } catch {
        // API failed, fall through to localStorage
      }

      // Fallback to localStorage
      const stored = localStorage.getItem(THEME_STORAGE_KEY);
      if (stored && themes.find(t => t.name === stored)) {
        setThemeName(stored);
      } else {
        setThemeName('LIGHT');
      }
      setIsLoading(false);
    };

    loadTheme();
  }, []);

  // Listen for theme sync from profile API after login
  useEffect(() => {
    const handleProfileTheme = (event: CustomEvent<string>) => {
      const themeFromProfile = event.detail.toUpperCase();
      if (themes.find(t => t.name === themeFromProfile)) {
        setThemeName(themeFromProfile);
        localStorage.setItem(THEME_STORAGE_KEY, themeFromProfile);
      }
    };

    window.addEventListener('profile-theme', handleProfileTheme as EventListener);

    return () => {
      window.removeEventListener('profile-theme', handleProfileTheme as EventListener);
    };
  }, []);

  const setTheme = async (name: string) => {
    const upperName = name.toUpperCase();
    if (!themes.find(t => t.name === upperName)) return;

    setThemeName(upperName);
    localStorage.setItem(THEME_STORAGE_KEY, upperName);

    // Persist to backend (non-blocking)
    try {
      await profileService.updateTheme({ theme: upperName });
    } catch {
      console.warn('Failed to persist theme to backend');
    }
  };

  const theme = useMemo(() => getThemeByName(themeName), [themeName]);

  const value = {
    theme,
    themeName,
    availableThemes: themes,
    setTheme,
    isLoading,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useThemeContext() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useThemeContext must be used within a ThemeProvider');
  }
  return context;
}
