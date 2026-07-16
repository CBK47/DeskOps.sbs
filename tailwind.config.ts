import type { Config } from "tailwindcss";
import defaultTheme from "tailwindcss/defaultTheme";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: { "2xl": "1400px" },
    },
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", "Manrope", ...defaultTheme.fontFamily.sans],
        mono: ["var(--font-mono)", "JetBrains Mono", ...defaultTheme.fontFamily.mono],
        display: ["var(--font-sans)", "Manrope", ...defaultTheme.fontFamily.sans],
      },
      colors: {
        border:      "hsl(var(--border))",
        input:       "hsl(var(--input))",
        ring:        "hsl(var(--ring))",
        background:  "hsl(var(--background))",
        foreground:  "hsl(var(--foreground))",
        primary: {
          DEFAULT:    "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT:    "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT:    "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT:    "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT:    "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT:    "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT:    "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // CBK brand palette — direct hex tokens, available as e.g. `bg-cbk-blue`
        cbk: {
          blue:           "#3A5BC7",
          "blue-hover":   "#4A6BD7",
          "blue-muted":   "rgba(58, 91, 199, 0.14)",
          lavender:       "#8B7DCF",
          "lavender-muted": "rgba(139, 125, 207, 0.12)",
          sage:           "#6B9080",
          "sage-muted":   "rgba(107, 144, 128, 0.14)",
          ink:            "#080C14",
          "ink-deeper":   "#050508",
          paper:          "#EEF2FF",
        },
      },
      borderRadius: {
        lg:  "var(--radius)",
        md:  "calc(var(--radius) - 2px)",
        sm:  "calc(var(--radius) - 4px)",
      },
      boxShadow: {
        glow:           "0 0 20px rgba(58, 91, 199, 0.3)",
        "glow-lg":      "0 0 40px rgba(58, 91, 199, 0.4)",
        "glow-lavender":"0 0 20px rgba(139, 125, 207, 0.25)",
      },
      backgroundImage: {
        "gradient-cbk":         "linear-gradient(135deg, #3A5BC7, #8B7DCF)",
        "gradient-cbk-accent":  "linear-gradient(135deg, #8B7DCF, #22D3EE)",
        "gradient-cbk-subtle":  "linear-gradient(180deg, #080C14, #050508)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to:   { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to:   { height: "0" },
        },
        "fade-up": {
          from: { transform: "translateY(20px)", opacity: "0" },
          to:   { transform: "translateY(0)",   opacity: "1" },
        },
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 20px rgba(58, 91, 199, 0.3)" },
          "50%":      { boxShadow: "0 0 40px rgba(58, 91, 199, 0.5)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up":   "accordion-up 0.2s ease-out",
        "fade-up":        "fade-up 0.4s ease-out",
        "pulse-glow":     "pulse-glow 2.4s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
