/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class", 
  theme: {
    // TỐI ƯU CONTAINER CHO MOBILE
    container: {
      center: true, // Luôn căn giữa
      padding: {
        DEFAULT: '1rem', // Mobile: Cách lề 16px
        sm: '2rem',      // Tablet: Cách lề 32px
        lg: '4rem',      // PC: Cách lề 64px
      },
    },
    extend: {
      colors: {
        "primary": "#1313ec",
        "background-light": "#f6f6f8",
        "background-dark": "#101022", 
      },
      fontFamily: {
        "display": ["Quicksand", "sans-serif"], 
        "heading": ["Quicksand", "sans-serif"], 
      },
    },
  },
  plugins: [],
}