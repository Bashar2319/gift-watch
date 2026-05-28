/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f6f3',
          100: '#dbece3',
          200: '#b9dac8',
          300: '#8bc1a5',
          400: '#5fa37f',
          500: '#3e8661',
          600: '#2f6b4d',
          700: '#25553e',
          800: '#0f3e27', // Deep Forest Green
          900: '#072719',
        },
        gold: {
          50: '#fbf7e7',
          100: '#f6ebc4',
          200: '#eed688',
          300: '#e4bd4d',
          400: '#daa523',
          500: '#c29b38', // Accent Gold
          605: '#a37d2b',
          700: '#7e5f1f',
          800: '#594315',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
