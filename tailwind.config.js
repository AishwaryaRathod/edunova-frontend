/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js}"],
  theme: {
    extend: {
      colors: {
        customPurple: '#6A41C6',
        'custom-blue': 'rgb(42, 91, 126)',
      },
    },
  },
  plugins: [],
}

