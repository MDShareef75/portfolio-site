/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'spin-slow': 'spin 20s linear infinite',
        'orbit-1': 'orbit 8s linear infinite',
        'orbit-2': 'orbit 12s linear infinite',
        'orbit-3': 'orbit 16s linear infinite',
      },
      keyframes: {
        pulse: {
          '0%, 100%': { opacity: '0.5', transform: 'scale(1)' },
          '50%': { opacity: '0.2', transform: 'scale(1.1)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        orbit: {
          '0%': { transform: 'rotate(0deg) translateX(200px) rotate(0deg)' },
          '100%': { transform: 'rotate(360deg) translateX(200px) rotate(-360deg)' },
        },
      },
      colors: {
        background: '#0f172a',
        surface: '#1e293b',
        accent: '#64ffda',
        text: '#e2e8f0',
        secondary: '#38bdf8',
      },
      perspective: {
        '1200': '1200px',
        '1000': '1000px',
        '500': '500px',
      },
    },
  },
  plugins: [],
} 