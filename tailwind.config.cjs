/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'warm-beige': '#f5e6d3',
        'warm-orange': '#ff9b71',
        'soft-pink': '#ffd6e0',
        'neon-pink': '#ff52b6',
        'neon-blue': '#00f3ff',
      },
      boxShadow: {
        'neon': '0 0 15px var(--tw-shadow-color)',
      },
      animation: {
        'pulse': 'pulse 1s infinite',
        'glitch': 'glitch 3s infinite linear alternate-reverse',
      },
      keyframes: {
        pulse: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.02)' },
        },
        glitch: {
          '0%': { clip: 'rect(44px, 900px, 56px, 0)' },
          '20%': { clip: 'rect(67px, 900px, 31px, 0)' },
          '40%': { clip: 'rect(22px, 900px, 73px, 0)' },
          '60%': { clip: 'rect(91px, 900px, 11px, 0)' },
          '80%': { clip: 'rect(33px, 900px, 82px, 0)' },
          '100%': { clip: 'rect(17px, 900px, 94px, 0)' },
        },
      },
    },
  },
  plugins: [],
  safelist: [
    'bg-warm-beige',
    'text-warm-orange',
    'bg-neon-pink',
    'bg-neon-blue',
    {
      pattern: /(bg|text|border|shadow)-(warm-beige|warm-orange|soft-pink|neon-pink|neon-blue)/,
      variants: ['hover', 'focus', 'active'],
    },
    {
      pattern: /(bg|text|border)-(warm-beige|warm-orange|soft-pink|neon-pink|neon-blue)\/[0-9]+/,
    },
    {
      pattern: /shadow-neon/,
      variants: ['hover'],
    }
  ],
} 