import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "var(--font-plex-thai)",
          "var(--font-plex-sans)",
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
        ],
        mono: ["var(--font-plex-mono)", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      colors: {
        ink: { DEFAULT: "#0e1a1f", 2: "#3a4a52" },
        mute: "#6e7e85",
        line: "#e4ece9",
        surface: "#ffffff",
        canvas: "#f3f6f4",
        primary: {
          DEFAULT: "#0d7d6f",
          ink: "#084f47",
          soft: "#d5ece6",
          tint: "#eaf6f2",
        },
        warn: { DEFAULT: "#c2680c", soft: "#fbecd3", ink: "#7a4207" },
        danger: "#b42318",
        success: { DEFAULT: "#0a8a5c", ink: "#085e40", soft: "#e3f2ea" },
      },
      borderRadius: { card: "14px" },
      boxShadow: {
        card: "0 1px 0 rgba(14,26,31,.02), 0 8px 24px -18px rgba(14,26,31,.12)",
        btn: "0 1px 0 rgba(0,0,0,.04), 0 6px 14px -8px rgba(13,125,111,.5)",
      },
      keyframes: {
        "pulse-dot": {
          "0%": { boxShadow: "0 0 0 0 rgba(13,125,111,.55)" },
          "70%": { boxShadow: "0 0 0 10px rgba(13,125,111,0)" },
          "100%": { boxShadow: "0 0 0 0 rgba(13,125,111,0)" },
        },
        "pulse-dot-warn": {
          "0%": { boxShadow: "0 0 0 0 rgba(194,104,12,.55)" },
          "70%": { boxShadow: "0 0 0 10px rgba(194,104,12,0)" },
          "100%": { boxShadow: "0 0 0 0 rgba(194,104,12,0)" },
        },
        caret: {
          "0%,49%": { opacity: "1" },
          "50%,100%": { opacity: "0" },
        },
        draw: {
          from: { strokeDashoffset: "60" },
          to: { strokeDashoffset: "0" },
        },
        fall: {
          "0%": { transform: "translate3d(0,-20px,0) rotate(0)", opacity: "0" },
          "10%": { opacity: "1" },
          "100%": {
            transform: "translate3d(var(--dx,0),100vh,0) rotate(var(--r,540deg))",
            opacity: "0",
          },
        },
        rise: {
          from: { opacity: "0", transform: "translateY(14px)" },
          to: { opacity: "1", transform: "none" },
        },
      },
      animation: {
        "pulse-dot": "pulse-dot 1.8s infinite",
        "pulse-dot-warn": "pulse-dot-warn 2.2s infinite",
        caret: "caret 1s steps(1) infinite",
        draw: "draw 0.55s cubic-bezier(.6,.2,.2,1) both",
        rise: "rise .5s cubic-bezier(.2,.7,.2,1) both",
      },
    },
  },
  plugins: [],
};

export default config;
