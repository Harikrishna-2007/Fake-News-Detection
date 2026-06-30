/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        // ---- Core surfaces ----
        ink: {
          DEFAULT: "#0F1115", // dark mode background
          panel: "#161922",   // dark mode card/panel surface
          border: "#262B36",
        },
        paper: {
          DEFAULT: "#FAFAF7", // light mode background (warm paper white)
          panel: "#FFFFFF",
          border: "#E5E2D8",
        },
        // ---- Verdict semantics ----
        verdict: {
          real: "#2D6A4F",     // verified-real green
          realBg: "#E8F3EC",
          fake: "#9D2933",     // flagged-fake red
          fakeBg: "#FAEAEC",
        },
        // ---- Accent / instrumentation ----
        signal: {
          amber: "#C9A227",   // confidence/measurement accent
          slate: "#6B7280",   // metadata / secondary text
        },
      },
      fontFamily: {
        display: ["'Source Serif 4'", "Georgia", "serif"],
        body: ["'Inter'", "system-ui", "sans-serif"],
        mono: ["'JetBrains Mono'", "ui-monospace", "monospace"],
      },
      boxShadow: {
        stamp: "0 1px 0 rgba(0,0,0,0.04), 0 8px 24px -8px rgba(0,0,0,0.12)",
      },
      borderRadius: {
        card: "10px",
      },
      keyframes: {
        "stamp-in": {
          "0%": { opacity: "0", transform: "scale(1.15) rotate(-3deg)" },
          "60%": { opacity: "1", transform: "scale(0.97) rotate(-3deg)" },
          "100%": { opacity: "1", transform: "scale(1) rotate(-3deg)" },
        },
        "needle-sweep": {
          "0%": { transform: "rotate(-90deg)" },
          "100%": { transform: "rotate(var(--needle-angle, 0deg))" },
        },
      },
      animation: {
        "stamp-in": "stamp-in 420ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards",
        "needle-sweep": "needle-sweep 900ms cubic-bezier(0.22, 1, 0.36, 1) forwards",
      },
    },
  },
  plugins: [],
};
