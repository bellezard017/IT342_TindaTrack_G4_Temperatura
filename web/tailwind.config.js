/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#E07A5F",
        secondary: "#F4F1DE",
      },
    },
  },
  plugins: [],
}