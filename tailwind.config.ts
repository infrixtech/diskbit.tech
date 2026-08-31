import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          DEFAULT: "#E8F0EE",
          50: "#F4F8F7",
          100: "#E8F0EE",
          200: "#C3D4D0",
        },
        ink: {
          DEFAULT: "#1B2423",
          muted: "#5B6C69",
        },
        accent: {
          50: "#E7F3F0",
          100: "#CDE6E0",
          200: "#A8D0C8",
          300: "#74B3A8",
          400: "#4A9388",
          500: "#347A70",
          600: "#2C6B63",
          700: "#245750",
          800: "#1C4440",
          900: "#132F2C",
        },
      },
    },
  },
  plugins: [],
};

export default config;
