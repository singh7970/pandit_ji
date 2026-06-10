import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        saffron: {
          50: "#fff8f0",
          100: "#ffecd0",
          400: "#ffb347",
          500: "#FF9933",
          600: "#e6821a",
          700: "#cc6c0a",
        },
        maroon: {
          500: "#8B0000",
          600: "#700000",
        },
        cream: "#FFFDF7",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        heading: ["Poppins", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
