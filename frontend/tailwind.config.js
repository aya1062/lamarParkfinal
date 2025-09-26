/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        'cairo': ['Cairo', 'sans-serif'],
        'amiri': ['Amiri', 'serif'],
        'vazir': ['Vazirmatn', 'sans-serif'],
        'sans': ['Vazirmatn', 'Amiri', 'Cairo', 'sans-serif'],
      },
      colors: {
        'gold': '#DfB86c',
        'gold-light': '#e8cfa0',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      }
    },
  },
  plugins: [],
};