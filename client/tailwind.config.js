/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#61dafb',
        background: '#282c34',
        surface: '#1a1e24',
        text: '#abb2bf'
      }
    },
  },
  plugins: [],
}
