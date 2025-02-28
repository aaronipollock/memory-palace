/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#e4000f',     /* Mario Red */
        secondary: '#5b8200',   /* Luigi Green */
        background: '#89CFEF',  /* Mario Sky Blue */
        text: '#333333',        /* Dark text */
        accent1: '#F6B330',     /* Question Block Gold */
        accent2: '#794044',     /* Castle Brown */
        // primary: '#D35400',    // Burnt Orange
        // secondary: '#F39C12',  // Golden Yellow
        // background: '#FDF5E6', // Cream/Off-white
        // surface: '#F5DEB3',    // Wheat
        // text: '#8B4513',       // Saddle Brown
        // accent: '#CD853F',     // Peru (brownish-orange)
      },
      fontFamily: {
        mario: ['"Press Start 2P"', 'cursive'],
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
