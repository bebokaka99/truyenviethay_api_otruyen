/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class", 
  theme: {
    extend: {
      colors: {
        "primary": "#1313ec",
        "background-light": "#f6f6f8",
        "background-dark": "#101022", 
      },
      fontFamily: {
        // Đặt Quicksand cho cả 2 loại
        "display": ["Quicksand", "sans-serif"], 
        "heading": ["Quicksand", "sans-serif"], 
      },
    },
  },
  plugins: [],
}