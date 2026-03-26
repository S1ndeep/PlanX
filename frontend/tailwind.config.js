/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#F97316',
        primaryOrange: '#F97316',
        darkBg: '#000000',
        mainBg: '#EDEAE5',
        primaryText: '#111827',
        secondaryText: '#6B7280',
      },
    },
  },
  plugins: [],
}
