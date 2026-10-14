/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        cinzel: ['Cinzel', 'serif'],
        serif: ['"Cormorant Garamond"', '"Playfair Display"', 'Georgia', 'serif'],
        playfair: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
      },
      colors: {
        gold: {
          300: '#E5C77A',
          400: '#D4AF37',
          500: '#C59D5F',
          600: '#A8813C',
          700: '#8B6728',
        },
        sand: {
          50: '#FAF7F2',
          100: '#F5EFE6',
          200: '#EDE2D0',
          300: '#E2D2BC',
        },
        midnight: {
          800: '#121E36',
          900: '#0B1325',
          950: '#060A14',
        },
        brand: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          teal: '#0d9488',
          accent: '#f97316'
        }
      }
    },
  },
  plugins: [],
}
