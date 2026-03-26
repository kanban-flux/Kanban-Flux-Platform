import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "#432776",
          foreground: "#ffffff",
          50: "#f3f0f9",
          100: "#e7e0f3",
          200: "#cfc1e7",
          300: "#b7a2db",
          400: "#9f83cf",
          500: "#432776",
          600: "#3a2268",
          700: "#311d5a",
          800: "#28184c",
          900: "#1f133e",
        },
        secondary: {
          DEFAULT: "#5c4580",
          foreground: "#ffffff",
          50: "#f5f0fa",
          100: "#ebe1f5",
          200: "#d6c3eb",
          300: "#c1a5e1",
          400: "#a080c8",
          500: "#7b5aa5",
          600: "#5c4580",
          700: "#4a3768",
          800: "#382a50",
          900: "#261d38",
        },
        tertiary: {
          DEFAULT: "#8b5cf6",
          50: "#f5f3ff",
          100: "#ede9fe",
          200: "#ddd6fe",
          300: "#c4b5fd",
          400: "#a78bfa",
          500: "#8b5cf6",
          600: "#7c3aed",
          700: "#6d28d9",
        },
        neutral: {
          DEFAULT: "#1D1D1B",
          50: "#f5f5f5",
          100: "#e8e8e7",
          200: "#d1d1d0",
          300: "#b0b0ae",
          400: "#8f8f8d",
          500: "#6e6e6c",
          600: "#4e4e4c",
          700: "#3a3a38",
          800: "#2a2a28",
          900: "#1D1D1B",
        },
        surface: "#F4F5F7",
        success: "#36B37E",
        warning: "#FFAB00",
        danger: "#FF5630",
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "#FF5630",
          foreground: "#ffffff",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
