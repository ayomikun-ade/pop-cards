/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        nysc: {
          green: '#006837',
          darkgreen: '#004d28',
          gold: '#FBB03B',
          yellow: '#FFD700',
          cream: '#FFFDF9',
          khaki: '#70774F',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        heading: ['Montserrat', 'Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
