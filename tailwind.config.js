/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'veloce-navy': '#0F172A',
        'veloce-blue': '#1E3A8A',
        'veloce-teal': '#14B8A6',
        'veloce-red': '#EF4444',
      },
      fontFamily: {
        'rajdhani': ['Rajdhani', 'sans-serif'],
        'inter': ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
