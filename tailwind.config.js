/ @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./pages//.{js,ts,jsx,tsx}",
    "./components/**/.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
      },
      colors: {
        'primary-bg': '#1a1625',
        'secondary-bg': '#262236',
        'accent-1': '#ff5d73',
        'accent-2': '#ff8e71',
        'light-1': '#f1f1f1',
        'medium-1': '#a9a4b3',
        'success': '#2dd4bf',
        'error': '#ff5d73',
      },
    },
  },
  plugins: [],
}
