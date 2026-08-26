/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#f0f4f9',
          100: '#d9e2ec',
          800: '#1b2a4a',
          900: '#0f172a',
          950: '#080d19',
        }
      }
    },
  },
  plugins: [],
}
