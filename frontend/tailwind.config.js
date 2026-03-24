/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'bg-primary': '#0a0a0a',
        'bg-card': '#111111',
        'bg-navbar': '#0d0d0d',
        'text-primary': '#ffffff',
        'text-secondary': '#9ca3af',
        'quality-badge': '#ef4444',
        'pagination-active': '#ef4444',
        'pagination-inactive': '#eab308',
      },
    },
  },
  plugins: [],
}
