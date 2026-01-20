/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
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
        },
        spin: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        }
      },
      animation: {
        ellipsis: 'ellipsis 1.5s infinite',
        spin: 'spin 1s linear infinite'
      }
    },
  },
  plugins: [],
}
