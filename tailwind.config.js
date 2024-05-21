/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    screens: {
      xs: '375px',
      sm: '560px',
      md: '912px',
      lg: '1280px',
      xl: '1920px',
    },
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
      margin: {
        24: '2.4rem',
        32: '3.2rem',
        48: '4.8rem',
      },
      padding: {
        8: '0.8rem',
        10: '1.0rem',
        16: '1.6rem',
        20: '2.0rem',
        24: '2.4rem',
        32: '3.2rem',
        72: '7.2rem',
      },
      borderWidth: {
        1: '0.1rem',
      },
      fontFamily: {
        space: ['Space Grotesk', 'sans-serif'],
      },
      fontSize: {
        12: ['1.2rem'],
        14: ['1.4rem'],
        16: ['1.6rem'],
        18: ['1.8rem'],
        20: ['2.0rem'],
        48: ['4.8rem'],
      },
      lineHeight: {
        16: '1.6rem',
        18: '1.8rem',
        20: '2.0rem',
        24: '2.4rem',
        26: '2.6rem',
        28: '2.8rem',
        32: '3.2rem',
        36: '3.6rem',
      },
      borderRadius: {
        8: '.8rem',
        12: '1.2rem',
        16: '1.6rem',
        20: '2rem',
        24: '2.4rem',
        28: '2.8rem',
        32: '3.2rem',
      },
      spacing: {
        8: '0.8rem',
        12: '1.2rem',
        16: '1.6rem',
        24: '2.4rem',
      }
    },
  },
  plugins: [],
}

