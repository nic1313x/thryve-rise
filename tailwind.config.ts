import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './contexts/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        teal: {
          primary: '#1E3D35',
          dark: '#17312A',
          light: '#2d5a4e',
          muted: '#6B7C73',
        },
        orange: {
          accent: '#E8601C',
          hover: '#d4551a',
        },
        cream: '#F5F1EB',
        hulk: '#00875A',
        surface: {
          DEFAULT: '#0f2420',
          raised: '#1a3330',
          elevated: '#1e3d35',
          border: '#2d5a4e',
        },
      },
      fontFamily: {
        serif: ['DM Serif Display', 'Georgia', 'serif'],
        sans: ['DM Sans', 'Inter', 'sans-serif'],
      },
      animation: {
        'float-up': 'floatUp 1.2s ease-out forwards',
        'pulse-once': 'pulseOnce 0.6s ease-out',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        floatUp: {
          '0%': { opacity: '1', transform: 'translateY(0)' },
          '100%': { opacity: '0', transform: 'translateY(-60px)' },
        },
        pulseOnce: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
}

export default config
