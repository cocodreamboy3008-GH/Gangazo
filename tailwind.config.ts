import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: { DEFAULT: "#FF6B35", dark: "#E85A24", darker: "#D14A1A" },
        blue: { brand: "#004E89", dark: "#003660", light: "#E8F1F8" },
        win: "#76C893",
        premium: "#6A4C93",
        gold: "#FFD60A",
        danger: "#E63946",
        ink: "#1A1A1A",
        soft: "#F5F5F5",
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
      },
      boxShadow: {
        card: "0 2px 8px rgba(0,0,0,0.1)",
        lift: "0 4px 16px rgba(0,0,0,0.15)",
      },
      keyframes: {
        pop: { "0%": { transform: "scale(1)" }, "50%": { transform: "scale(1.15)" }, "100%": { transform: "scale(1)" } },
      },
      animation: { pop: "pop 300ms ease-in-out" },
    },
  },
  plugins: [],
} satisfies Config;
