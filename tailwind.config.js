/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1A6B4A',
          light: '#2A8B62',
          dark: '#0F4A33',
        },
        accent: {
          DEFAULT: '#F5A623',
          light: '#FBBF4A',
        },
        portal: {
          bg: '#080C0A',
          'bg-secondary': '#0D1410',
          surface: 'rgba(255,255,255,0.03)',
          border: 'rgba(255,255,255,0.07)',
          foreground: '#F0EDE8',
          muted: 'rgba(240,237,232,0.5)',
        },
      },
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
        serif: ['Fraunces', 'serif'],
      },
      fontSize: {
        '2xs': ['10px', { lineHeight: '1.4' }],
      },
      animation: {
        'fade-up': 'fadeUp 0.7s cubic-bezier(0.22, 1, 0.36, 1) both',
      },
    },
  },
  plugins: [],
};