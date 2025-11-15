/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#059669',
        secondary: '#0284c7',
        accent: '#10b981',
        background: '#f0fdf4',
        surface: '#ffffff',
        text: '#064e3b'
      }
    },
  },
  plugins: [],
}