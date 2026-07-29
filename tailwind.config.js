/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#080B14",
          900: "#0D1220",
          800: "#121A2C",
          700: "#1A2338",
          600: "#232D45",
          500: "#323D58",
        },
        mist: {
          400: "#8B93A6",
          200: "#C7CDDA",
          50: "#EDEFF4",
        },
        amber: {
          DEFAULT: "#FFB74A",
          soft: "#3A2E1A",
        },
        clear: {
          DEFAULT: "#4ADE80",
          soft: "#1A2E22",
        },
        slate2: {
          DEFAULT: "#6C7690",
          soft: "#1C2233",
        },
        rust: {
          DEFAULT: "#EF5C5C",
          soft: "#331C1C",
        },
        crimson: {
          DEFAULT: "#E4283C",
          soft: "#3A1418",
        },
        blue: {
          DEFAULT: "#3B6BF6",
          soft: "#16213F",
        },
        gold: {
          DEFAULT: "#F2C14E",
          soft: "#332911",
        },
      },
      fontFamily: {
        display: ["'Sora'", "sans-serif"],
        heading: ["'Sora'", "sans-serif"],
        body: ["'Inter'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
        logo: ["'Ultra'", "serif"],
      },
    },
  },
  plugins: [],
}

