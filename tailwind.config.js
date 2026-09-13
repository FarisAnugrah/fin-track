/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'reeach-purple': '#5A3F9C',
        'reeach-light': '#F5F5F7',
        'reeach-green': '#34C759',
        'reeach-red': '#FF3B30'
      }
    },
  },
  plugins: [],
}
