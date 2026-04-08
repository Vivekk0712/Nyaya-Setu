/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'justice-blue': '#1e40af',
        'legal-gold': '#f59e0b',
      }
    },
  },
  plugins: [],
}
