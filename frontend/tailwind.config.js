/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dark: 'var(--color-dark)',
        blue: 'var(--color-blue)',
        green: {
          DEFAULT: 'var(--color-green)',
          100: '#dcfce7',
          500: '#22c55e',
          600: '#16a34a'
        },
        red: {
          100: '#fee2e2',
          600: '#dc2626'
        },
        yellow: {
          100: '#fef9c3',
          500: '#eab308',
          600: '#ca8a04'
        }
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
}