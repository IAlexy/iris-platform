/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        obsidian: {
          950: '#06050C',
          900: '#0A0812', // Main background
          800: '#130E24', // Card background
          700: '#1D1636', // Elevated surface
          600: '#2E2254', // Border
        },
        amethyst: {
          500: '#8B5CF6',
          600: '#7C3AED', // Primary brand
          700: '#6D28D9',
        },
        lavender: {
          100: '#F5F3FF',
          200: '#EDE9FE',
          300: '#DDD6FE', // Accent text
          400: '#C4B5FD',
        },
        emerald: {
          500: '#10B981', // Verified Gear
        },
        coral: {
          500: '#F43F5E', // AI Warning
        },
        indigo: {
          500: '#6366F1', // Social Import
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
