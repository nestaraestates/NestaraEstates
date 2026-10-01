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
    extend: {},
  },
  plugins: [],
}
