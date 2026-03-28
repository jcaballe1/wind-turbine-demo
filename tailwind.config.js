/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Lora', 'Georgia', 'serif'],
      },
      boxShadow: {
        hard: '4px 4px 0px 0px #0f172a',
        'hard-sm': '2px 2px 0px 0px #0f172a',
      },
    },
  },
  plugins: [],
}
