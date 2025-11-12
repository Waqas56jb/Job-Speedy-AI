/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./public/index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        midnight: "#0b0f1a",
      },
      boxShadow: {
        glow: "0 0 40px rgba(124,58,237,0.35)",
      },
      borderRadius: {
        xl2: "1rem",
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: 0, transform: 'translateY(16px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 600ms ease-out forwards',
      },
    },
  },
  plugins: [],
};


