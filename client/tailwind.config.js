/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      keyframes: {
        flip: {
          '0%':   { transform: 'rotateY(0deg)' },
          '100%': { transform: 'rotateY(180deg)' },
        },
        pulse_glow: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(99,102,241,0.4)' },
          '50%':       { boxShadow: '0 0 0 8px rgba(99,102,241,0)' },
        },
      },
      animation: {
        flip: 'flip 0.5s ease-in-out forwards',
        pulse_glow: 'pulse_glow 1.5s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
