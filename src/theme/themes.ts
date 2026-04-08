import { createTheme, Theme } from '@mui/material';

export interface AppTheme {
  name: string;
  label: string;
  description: string;
  swatch: string;
  swatchBorder?: string;
  theme: Theme;
}

const componentOverrides = {
  MuiButton: {
    styleOverrides: {
      root: {
        borderRadius: 8,
        fontWeight: 500,
      },
      contained: {
        boxShadow: 'none',
        '&:hover': {
          boxShadow: 'none',
        },
      },
    },
  },
  MuiCard: {
    styleOverrides: {
      root: {
        borderRadius: 16,
      },
    },
  },
  MuiPaper: {
    styleOverrides: {
      root: {
        backgroundImage: 'none',
      },
      elevation1: {
        boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
      },
    },
  },
  MuiTextField: {
    styleOverrides: {
      root: {
        '& .MuiOutlinedInput-root': {
          borderRadius: 8,
        },
      },
    },
  },
  MuiChip: {
    styleOverrides: {
      root: {
        fontWeight: 500,
      },
    },
  },
};

const typography = {
  fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  h4: { fontWeight: 600 },
  h5: { fontWeight: 600 },
  h6: { fontWeight: 600 },
  button: { textTransform: 'none' as const },
};

const shape = { borderRadius: 12 };

/** Default light theme */
export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#1976d2' },
    secondary: { main: '#9c27b0' },
    error: { main: '#f44336' },
    warning: { main: '#ed6c02' },
    info: { main: '#0288d1' },
    success: { main: '#2e7d32' },
    background: { default: '#f5f5f5', paper: '#ffffff' },
    text: { primary: '#1a1a1a', secondary: '#5f6368' },
    divider: 'rgba(0,0,0,0.12)',
  },
  typography,
  shape,
  components: componentOverrides,
});

/** Dark mode theme */
export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#90caf9' },
    secondary: { main: '#ce93d8' },
    error: { main: '#ef5350' },
    warning: { main: '#ffa726' },
    info: { main: '#29b6f6' },
    success: { main: '#66bb6a' },
    background: { default: '#121212', paper: '#1e1e1e' },
    text: { primary: '#e0e0e0', secondary: '#a0a0a0' },
    divider: 'rgba(255,255,255,0.12)',
  },
  typography,
  shape,
  components: {
    ...componentOverrides,
    MuiPaper: {
      styleOverrides: {
        root: { backgroundImage: 'none' },
        elevation1: {
          boxShadow: '0 1px 3px rgba(0,0,0,0.4), 0 1px 2px rgba(0,0,0,0.5)',
        },
      },
    },
  },
});

/** Ocean theme — blue/teal vibes */
export const oceanTheme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#0288d1' },
    secondary: { main: '#00acc1' },
    error: { main: '#f44336' },
    warning: { main: '#ed6c02' },
    info: { main: '#0288d1' },
    success: { main: '#00c853' },
    background: { default: '#e0f7fa', paper: '#ffffff' },
    text: { primary: '#0a2e38', secondary: '#4a6b72' },
    divider: 'rgba(0,0,0,0.08)',
  },
  typography,
  shape,
  components: componentOverrides,
});

/** Forest theme — green/nature vibes */
export const forestTheme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#2e7d32' },
    secondary: { main: '#8d6e63' },
    error: { main: '#f44336' },
    warning: { main: '#ed6c02' },
    info: { main: '#0288d1' },
    success: { main: '#2e7d32' },
    background: { default: '#e8f5e9', paper: '#ffffff' },
    text: { primary: '#1b2e1b', secondary: '#4a6b4a' },
    divider: 'rgba(0,0,0,0.08)',
  },
  typography,
  shape,
  components: componentOverrides,
});

/** All available themes */
export const themes: AppTheme[] = [
  { name: 'LIGHT', label: 'Light', description: 'Clean and classic', swatch: '#ffffff', swatchBorder: '#1976d2', theme: lightTheme },
  { name: 'DARK', label: 'Dark', description: 'Easy on the eyes', swatch: '#424242', theme: darkTheme },
  { name: 'OCEAN', label: 'Ocean', description: 'Cool blue vibes', swatch: '#26c6da', theme: oceanTheme },
  { name: 'FOREST', label: 'Forest', description: 'Nature inspired', swatch: '#66bb6a', theme: forestTheme },
];

/** Get theme by name */
export function getThemeByName(name: string): Theme {
  const found = themes.find(t => t.name === name);
  return found?.theme ?? lightTheme;
}

/** Default theme */
export const defaultTheme = lightTheme;
