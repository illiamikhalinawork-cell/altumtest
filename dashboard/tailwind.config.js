/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Refined neutral-zinc dark palette with a single cyan/teal accent.
        canvas: "#09090b", // zinc-950-ish app background
        surface: "#0f0f12", // panel / card background
        "surface-2": "#16161a", // raised surface (hover, inputs)
        line: "#27272a", // zinc-800 borders
        "line-soft": "#1e1e22",
        accent: {
          DEFAULT: "#22d3ee", // cyan-400
          muted: "#0e7490",
          dim: "#155e75",
        },
      },
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
        mono: [
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Monaco",
          "Consolas",
          "monospace",
        ],
      },
      fontSize: {
        "2xs": ["0.6875rem", { lineHeight: "0.875rem" }],
      },
      boxShadow: {
        card: "0 1px 0 0 rgba(255,255,255,0.02) inset, 0 1px 2px 0 rgba(0,0,0,0.4)",
        glow: "0 0 0 1px rgba(34,211,238,0.25), 0 0 24px -8px rgba(34,211,238,0.45)",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(4px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "pulse-soft": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.45" },
        },
        flash: {
          "0%": { boxShadow: "0 0 0 0 rgba(34,211,238,0.6)" },
          "100%": { boxShadow: "0 0 0 0 rgba(34,211,238,0)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.25s ease-out",
        "pulse-soft": "pulse-soft 2s ease-in-out infinite",
        flash: "flash 1.4s ease-out",
      },
    },
  },
  plugins: [],
};
