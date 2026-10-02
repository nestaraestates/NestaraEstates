import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#18181b', // surface-900
    background: '#fafafa', // surface-50
    backgroundElement: '#f4f4f5', // surface-100
    backgroundSelected: '#e4e4e7', // surface-200
    textSecondary: '#71717a', // surface-500
    brand: '#f97316',
  },
  dark: {
    text: '#fafafa', // surface-50
    background: '#09090b', // surface-950
    backgroundElement: '#18181b', // surface-900
    backgroundSelected: '#27272a', // surface-800
    textSecondary: '#a1a1aa', // surface-400
    brand: '#f97316',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 12,
  four: 16,
  five: 20,
  six: 24,
  eight: 32,
  ten: 40,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
