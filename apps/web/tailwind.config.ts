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
        }
      },
      boxShadow: {
        card: "0 24px 60px rgba(11, 31, 65, 0.14)"
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
