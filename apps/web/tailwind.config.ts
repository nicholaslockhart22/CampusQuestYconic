import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
    "./hooks/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        uri: {
          navy: "#0b1f41",
          gold: "#cba135",
          ink: "#0f1726",
          mist: "#eef3fb",
          sky: "#d6e4ff",
          ember: "#f4c88d"
        },
        /** CampusQuest mobile: dark blue, Keaney pool light blue, white surfaces */
        cq: {
          deep: "#040c18",
          navy: "#0b1f41",
          navyMid: "#0f2747",
          navyLight: "#15325a",
          keaney: "#6bb8e8",
          keaneyBright: "#9fd4f4",
          keaneySoft: "#c8e8f9",
          keaneyIce: "#e3f4fc",
          white: "#ffffff"
        },
        /** Muted text & borders on white (cool blue-gray) */
        ig: {
          border: "#a8d0e8",
          secondary: "#3d5a73",
          bg: "#e8f4fb"
        }
      },
      boxShadow: {
        card: "0 24px 60px rgba(11, 31, 65, 0.14)",
        "cq-card": "0 14px 40px rgba(11, 31, 65, 0.1)",
        "cq-glow": "0 0 36px rgba(107, 184, 232, 0.22)"
      },
      borderRadius: {
        xl2: "1.5rem"
      },
      backgroundImage: {
        parchment:
          "radial-gradient(circle at top left, rgba(214,228,255,0.52), transparent 30%), radial-gradient(circle at top right, rgba(203,161,53,0.22), transparent 28%), linear-gradient(180deg, #f8fbff 0%, #edf3fb 100%)"
      }
    }
  },
  plugins: []
};

export default config;
