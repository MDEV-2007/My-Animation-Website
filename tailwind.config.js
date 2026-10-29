/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/app/**/*.{js,jsx,ts,tsx}',
    './src/components/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['var(--font-display)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
      },
      colors: {
        ink: '#05060a',
        void: '#02030a',
        glow: '#7cf6ff',
        ember: '#ff8a5c',
        aurora: '#a78bfa',
      },
      letterSpacing: {
        tightest: '-0.06em',
      },
    },
  },
  plugins: [],
};
