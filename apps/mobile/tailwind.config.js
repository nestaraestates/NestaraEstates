const path = require('path');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    path.join(__dirname, "./App.{js,jsx,ts,tsx}"),
    path.join(__dirname, "./src/**/*.{js,jsx,ts,tsx}"),
    path.join(__dirname, "./app/**/*.{js,jsx,ts,tsx}")
  ],
  darkMode: 'class',
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
        },
        surface: {
          50: '#fafafa',
          100: '#f4f4f5',
          200: '#e4e4e7',
          300: '#d4d4d8',
          400: '#a1a1aa',
          500: '#71717a',
          600: '#52525b',
          700: '#3f3f46',
          800: '#27272a',
          900: '#18181b',
          950: '#09090b',
        },
        success: '#10b981', // subtle green
        warning: '#f59e0b', // subtle amber
        error: '#ef4444', // subtle red
      }
    },
  },
  plugins: [],
}
