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
      },
      keyframes: {
        cqVictoryPulse: {
          "0%, 100%": { transform: "scale(1)", filter: "brightness(1)" },
          "50%": { transform: "scale(1.04)", filter: "brightness(1.15)" }
        },
        cqVictoryGlow: {
          "0%, 100%": {
            boxShadow: "0 0 28px rgba(250, 204, 21, 0.55), 0 0 60px rgba(107, 184, 232, 0.35)"
          },
          "50%": {
            boxShadow: "0 0 48px rgba(253, 224, 71, 0.95), 0 0 100px rgba(250, 204, 21, 0.45)"
          }
        },
        cqFloat: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" }
        },
        cqShine: {
          "0%": { transform: "translateX(-120%) skewX(-18deg)", opacity: "0" },
          "20%": { opacity: "0.9" },
          "100%": { transform: "translateX(220%) skewX(-18deg)", opacity: "0" }
        },
        cqPop: {
          "0%": { transform: "scale(0.6)", opacity: "0" },
          "55%": { transform: "scale(1.08)", opacity: "1" },
          "100%": { transform: "scale(1)", opacity: "1" }
        },
        cqSparkle: {
          "0%, 100%": { opacity: "0.35", transform: "scale(0.8)" },
          "50%": { opacity: "1", transform: "scale(1.2)" }
        },
        cqBannerIn: {
          "0%": { opacity: "0", transform: "translateY(-10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        }
      },
      animation: {
        "cq-victory-pulse": "cqVictoryPulse 2.2s ease-in-out infinite",
        "cq-victory-glow": "cqVictoryGlow 1.8s ease-in-out infinite",
        "cq-float": "cqFloat 2.5s ease-in-out infinite",
        "cq-shine": "cqShine 2.8s ease-in-out infinite",
        "cq-pop": "cqPop 0.55s cubic-bezier(0.34, 1.56, 0.64, 1) forwards",
        "cq-sparkle": "cqSparkle 1.4s ease-in-out infinite",
        "cq-banner-in": "cqBannerIn 0.35s ease-out forwards"
      }
    }
  },
  plugins: []
};

export default config;
