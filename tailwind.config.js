/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        cyan: {
          500: '#1ADEF5',
        },
        darkBlue: '#101820',
        dark: '#151E27',
        darkBorder: '#282F36',
        cardBorder: '#202E3C',
      },
    },
  },
  plugins: [],
};
