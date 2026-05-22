import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          red:      '#C0392B',
          'red-dark': '#a93226',
          'red-light': '#e74c3c',
          black:    '#000000',
          'off-white': '#F5F5F5',
          'white':  '#FFFFFF',
          'gray-100': '#F0F0F0',
          'gray-200': '#E0E0E0',
          'gray-400': '#9E9E9E',
          'gray-600': '#616161',
          'gray-800': '#212121',
        },
      },
      fontFamily: {
        bebas:      ['var(--font-bebas)', 'sans-serif'],
        montserrat: ['var(--font-montserrat)', 'sans-serif'],
      },
      animation: {
        'fade-up':    'fadeUp 0.8s ease-out forwards',
        'fade-in':    'fadeIn 1s ease-out forwards',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float':      'float 6s ease-in-out infinite',
        'marquee':    'marquee 25s linear infinite',
      },
      keyframes: {
        fadeUp: {
          '0%':   { opacity: '0', transform: 'translateY(40px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-16px)' },
        },
        marquee: {
          '0%':   { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
    },
  },
  plugins: [],
}
export default config
