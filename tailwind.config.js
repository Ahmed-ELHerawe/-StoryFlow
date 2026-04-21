/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Playfair Display', 'serif'],
        body: ['DM Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        ink: {
          950: '#0a0a0f',
          900: '#12121a',
          800: '#1c1c28',
          700: '#26263a',
          600: '#3a3a52',
        },
        gold: {
          400: '#f5c842',
          500: '#e8b520',
          600: '#c99a10',
        },
        ember: {
          400: '#ff6b4a',
          500: '#e8532e',
          600: '#c73d18',
        },
        mist: {
          100: '#f0eef8',
          200: '#d8d4ee',
          300: '#b8b2d4',
          400: '#9088b8',
        },
      },
      animation: {
        'fade-up': 'fadeUp 0.6s ease forwards',
        'fade-in': 'fadeIn 0.4s ease forwards',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'choice-in': 'choiceIn 0.5s cubic-bezier(0.34,1.56,0.64,1) forwards',
      },
      keyframes: {
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        pulseGlow: {
          '0%,100%': { boxShadow: '0 0 20px rgba(245,200,66,0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(245,200,66,0.7)' },
        },
        choiceIn: {
          from: { opacity: '0', transform: 'translateX(-30px) scale(0.95)' },
          to: { opacity: '1', transform: 'translateX(0) scale(1)' },
        },
      },
    },
  },
  plugins: [],
}
