/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#179A72",
        secondary: "#E1EAE9",
        background: "#f4f6f6",
      },
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
        cantora: ['Cantora One', 'sans-serif'],
      }
    },
  },
  plugins: [],
}