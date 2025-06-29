// theme.ts
import { MD3LightTheme as DefaultTheme } from 'react-native-paper';

const themes: any = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#6200ee',           // Indigo primary color
    onPrimary: '#ffffff',
    secondary: '#bb86fc',         // Light indigo/purple tint
    onSecondary: '#000000',
    background: '#f6f2ff',        // Very light indigo background
    surface: '#ffffff',
    onSurface: '#000000',
    outline: '#6200ee',           // Outline color for TextInput
    surfaceVariant: '#f2f2f2',    // Background for outlined TextInput
    onSurfaceVariant: '#000000',  // Text color in TextInput
    error: '#b00020',
    onError: '#ffffff',
  },
};

export default themes;
