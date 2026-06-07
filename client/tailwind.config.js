/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        flag: '#e9b44c',
        sand: {
          50: '#faf7f2',
          100: '#f6f1e9',
          200: '#ede5d5',
          300: '#ddd3c0',
        },
        course: {
          950: '#071510',
          900: '#0a1f12',
          800: '#0f2d1a',
          700: '#1b4332',
          600: '#2d6a4f',
          500: '#40916c',
          100: '#d8f3dc',
        },
      },
    },
  },
  plugins: [],
}
