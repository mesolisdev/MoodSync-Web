/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Poppins", "system-ui", "sans-serif"],
      },
      colors: {
        mood: {
          happy: "#FFB703",
          relaxed: "#80DED9",
          motivated: "#5DE06A",
          melancholic: "#6C63FF",
        },
      },
    },
  },
  plugins: [],
};
