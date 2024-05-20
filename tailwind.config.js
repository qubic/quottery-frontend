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
          20: '#CCFCFF',
          30: '#202E3C',
          40: '#61F0FE',
          50: '#61F0FE',
          60: '#101820  ',
          70: '#019AB8',
          90: '#019AB8',
        },
        gray: {
          50: '#808B9B',
          60: '#4B5565',
          70: '#202E3C',
          75: '#282F36',
          80: '#151E27',
          90: '#101820',
          100: '#F5F5F5',
        }
      },
      padding: {
        20: '2.0rem'
      },
      borderWidth: {
        1: '0.1rem'
      }
    },
  },
  plugins: [],
}

