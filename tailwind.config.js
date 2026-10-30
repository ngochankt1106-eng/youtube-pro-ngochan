/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        yt: {
          red: '#FF0033',
          'red-hover': '#CC0029',
          dark: '#0F0F0F',
          card: '#181818',
          'card-hover': '#242424',
          subtle: '#272727',
          border: '#303030',
          text: '#F1F1F1',
          muted: '#AAAAAA',
        },
      },
      borderRadius: {
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      boxShadow: {
        glow: '0 0 25px -5px rgba(255, 0, 51, 0.35)',
        card: '0 4px 20px -2px rgba(0, 0, 0, 0.4)',
      },
    },
  },
  plugins: [],
};
