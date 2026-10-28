import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        obsidian: {
          DEFAULT: "#0A0B0E",
          surface: "#12141B",
          elevated: "#181B24",
          border: "#252936",
        },
        ivory: {
          DEFAULT: "#F4F1EA",
          muted: "#9499AB",
          subtle: "#5E6375",
        },
        rec: {
          DEFAULT: "#FF4D00",
          glow: "#FF6A2B",
          dim: "rgba(255, 77, 0, 0.14)",
        },
        role: {
          video: "#FF4D00",
          photo: "#00E5FF",
          edit: "#A855F7",
          design: "#3B82F6",
          tech: "#10B981",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        sans: ["var(--font-sans)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
