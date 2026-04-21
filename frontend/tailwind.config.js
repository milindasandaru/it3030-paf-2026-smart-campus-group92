/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Space Grotesk', 'Segoe UI', 'sans-serif'],
      },
      colors: {
        campus: {
          ink: '#14213d',
          teal: '#0a9396',
          tealStrong: '#005f73',
          sand: '#f8f7f4',
        },
      },
    },
  },
  plugins: [],
};
