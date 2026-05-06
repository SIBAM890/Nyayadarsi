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
          50: '#FFFFFF',
          100: '#1A1A1A', // Text primary
          200: '#333333',
          300: '#4A4A4A',
          400: '#5A5A5A', // Text secondary
          500: '#9A9A9A', // Text muted
          600: '#D94040', // Primary accent (Sindoor Red)
          700: '#B03030', // Darker Red
          800: '#8A1F1F',
          900: '#631414',
          950: '#400A0A',
        },
        accent: {
          50: '#F5E6E6',
          100: '#EBC7C7',
          200: '#DFA3A3',
          300: '#CF7A7A',
          400: '#C25959',
          500: '#D94040', // Sindoor Red
          600: '#B03030',
        },
        surface: {
          0: '#FAF9F6', // Background (warm off-white)
          1: '#F5F0E8', // Surface secondary (cream)
          2: '#FFFFFF', // Surface cards
          3: '#F0EBE1',
          4: '#FFFFFF',
        },
        verdict: {
          green: '#2E7D32', // Safe green
          yellow: '#F57F17', // Warning yellow
          red: '#D94040', // Alert red
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
        theme: {
          bg: {
            primary: '#F5F0EB',
            section: '#FDE8E8',
            card: '#FFFFFF',
            active: '#FEF0EE',
            footer: '#F7F2EE',
          },
          brand: {
            DEFAULT: '#C0321F',
            hover: '#A52A18',
          },
          text: {
            heading: '#1A1A1A',
            body: '#4A4A4A',
            muted: '#6B6B6B',
            placeholder: '#A3A3A3',
          },
          border: {
            DEFAULT: '#E8E0D8',
            active: '#D94040',
          },
          status: {
            green: { bg: '#E8F5E9', text: '#2E7D32' },
            yellow: { bg: '#FFF8E1', text: '#F57F17' },
            red: { bg: '#FDE8E8', text: '#D94040' },
          },
          alert: {
            bg: '#FFF3CD',
            border: '#FFEEBA',
          }
        },
      },
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
        display: ['Poppins', 'sans-serif'],
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
