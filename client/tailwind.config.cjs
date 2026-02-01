module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        astral: ["\"Golos Text\"", "\"Segoe UI\"", "Arial", "system-ui", "sans-serif"]
      },
      colors: {
        "astral-bg": "#0b0f1a",
        "astral-panel": "#0f172a",
        "astral-accent": "#5eead4",
        "astral-accent-2": "#60a5fa",
        "astral-glow": "#14b8a6"
      },
      boxShadow: {
        glow: "0 0 25px rgba(20,184,166,0.25)"
      }
    }
  },
  plugins: [require("@tailwindcss/forms")]
};
