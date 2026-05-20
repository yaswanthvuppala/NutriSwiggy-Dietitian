/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        swiggy: {
          orange: "#FC8019",
          "orange-dark": "#E06D0F",
          "orange-light": "#FFF3E8",
          black: "#282C3F",
          gray: "#686B78"
        },
        healthy: {
          emerald: "#10B981",
          "emerald-dark": "#047857",
          "emerald-light": "#D1FAE5"
        },
        darkBg: {
          DEFAULT: "#0F172A",
          card: "#1E293B",
          border: "#334155"
        }
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "glass-gradient": "linear-gradient(135deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.01))"
      },
      boxShadow: {
        "glass-inset": "inset 0 1px 0 0 rgba(255, 255, 255, 0.05)",
        "glass-card": "0 8px 32px 0 rgba(0, 0, 0, 0.37)"
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "bounce-slow": "bounce 2s infinite"
      }
    },
  },
  plugins: [],
}
