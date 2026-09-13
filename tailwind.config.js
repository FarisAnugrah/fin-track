/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'spendee-green': '#10B981', // emerald-500
        'spendee-dark': '#0F172A', // slate-900
        'spendee-light': '#F8FAFC', // slate-50
        'pastel-blue': '#60A5FA',
        'pastel-purple': '#A78BFA',
        'pastel-pink': '#F472B6',
        'pastel-yellow': '#FBBF24',
        'pastel-orange': '#FB923C'
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
