/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        gym: {
          900: '#0a0d14',
          850: '#0f1420',
          800: '#141a29',
          700: '#1e2638',
          600: '#2c374e',
          accent: '#10b981', // emerald
          accentHover: '#059669',
          accentGlow: 'rgba(16, 185, 129, 0.25)',
          pr: '#f59e0b', // gold/amber for PR
          rest: '#3b82f6', // blue for rest timer
          danger: '#ef4444'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 15px rgba(16, 185, 129, 0.4)' },
          '50%': { boxShadow: '0 0 30px rgba(16, 185, 129, 0.8)' },
        },
        prBounce: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.15) rotate(2deg)' }
        }
      },
      animation: {
        pulseGlow: 'pulseGlow 2s infinite',
        prBounce: 'prBounce 0.6s ease-in-out infinite'
      }
    },
  },
  plugins: [],
}
