/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        'cyber-bg': '#050505',
        'neon-blue': '#00ffff',
        'neon-pink': '#ff00ff',
        'neon-purple': '#bc13fe',
        'solar-white': '#f8fafc',
        'solar-slate': '#1e293b',
      },
      boxShadow: {
        'neon-blue': '0 0 20px rgba(0, 255, 255, 0.7), 0 0 40px rgba(0, 255, 255, 0.2)',
        'neon-pink': '0 0 20px rgba(255, 0, 255, 0.7), 0 0 40px rgba(255, 0, 255, 0.2)',
        'solar-soft': '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
      }
    },
  },
  plugins: [],
}