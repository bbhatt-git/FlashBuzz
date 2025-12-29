/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#09090b',
        surface: '#18181b',
        primary: '#6366f1',
        primaryDark: '#4f46e5',
        textMain: '#fafafa',
        textMuted: '#a1a1aa',
      }
    }
  },
  plugins: [],
}