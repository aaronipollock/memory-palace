/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#D35400',    // Burnt Orange
        secondary: '#F39C12',  // Golden Yellow
        background: '#FDF5E6', // Cream/Off-white
        surface: '#F5DEB3',    // Wheat
        text: '#8B4513',       // Saddle Brown
        accent: '#CD853F',     // Peru (brownish-orange)
      },
      keyframes: {
        ellipsis: {
          '0%': { content: '.' },
          '33%': { content: '..' },
          '66%': { content: '...' },
          '100%': { content: '.' },
        }
      },
      animation: {
        ellipsis: 'ellipsis 1.5s infinite'
      }
    },
  },
  plugins: [],
}
