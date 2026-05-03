/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        nyaya: {
          50: '#f8fafc',
          100: '#f1f5f9', // Text primary
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8', // Text secondary
          500: '#475569', // Text muted
          600: '#3b82f6', // Primary accent
          700: '#2563eb',
          800: '#1d4ed8',
          900: '#1e3a8a',
          950: '#172554',
        },
        accent: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b', // Justice gold / Warning yellow
          600: '#d97706',
        },
        surface: {
          0: '#0a0f1e', // Background
          1: '#0d1421', // Surface cards
          2: '#111a2b',
          3: '#152136',
          4: '#1a2741',
        },
        verdict: {
          green: '#10b981', // Safe green
          yellow: '#f59e0b', // Warning yellow
          red: '#ef4444', // Alert red
        },
        emerald: {
          600: '#059669',
        },
        purple: {
          500: '#a855f7',
          700: '#7e22ce',
        },
        amber: {
          600: '#d97706',
        },
        red: {
          600: '#dc2626',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Outfit', 'Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.35s ease-out',
        'slide-right': 'slideRight 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideRight: {
          '0%': { opacity: '0', transform: 'translateX(-12px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      },
    },
  },
  plugins: [],
};
