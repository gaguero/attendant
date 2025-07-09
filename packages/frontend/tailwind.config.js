/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary-white': '#FFFFFF',
        'primary-midnight': '#1F2937',
        'secondary-teal': '#2CB9B0',
        'secondary-teal-light': '#E6F7F6',
        'accent-amber': '#FFC845',
        'accent-purple': '#8C5CF7',
        'success-green': '#38A169',
        'error-red': '#E53E3E',
        'warning-orange': '#DD6B20',
        'neutral-gray': '#9CA3AF',
        'dark-gray': '#4B5563',
        'background-light': '#F9FAFB',
        'background-surface': '#FFFFFF',
        'background-overlay': 'rgba(31, 41, 55, 0.6)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
      },
      fontSize: {
        'h1': ['32px', { lineHeight: '40px', letterSpacing: '-0.5px' }],
        'h2': ['24px', { lineHeight: '32px', letterSpacing: '-0.25px' }],
        'h3': ['20px', { lineHeight: '28px', letterSpacing: '0px' }],
        'body-l': ['18px', { lineHeight: '28px', letterSpacing: '0px' }],
        'body-m': ['16px', { lineHeight: '24px', letterSpacing: '0px' }],
        'body-s': ['14px', { lineHeight: '20px', letterSpacing: '0.1px' }],
        'caption': ['12px', { lineHeight: '16px', letterSpacing: '0.2px' }],
        'button': ['16px', { lineHeight: '24px', letterSpacing: '0.1px' }],
        'link': ['16px', { lineHeight: '24px', letterSpacing: '0px' }],
      },
      spacing: {
        'xs': '4px',
        'sm': '8px',
        'md': '16px',
        'lg': '24px',
        'xl': '32px',
        'xxl': '48px',
      },
      borderRadius: {
        'card': '12px',
        'form': '8px',
      },
      boxShadow: {
        'card': '0px 2px 8px rgba(31,29,41,0.05)',
      },
      transitionDuration: {
        'standard': '200ms',
        'emphasis': '300ms',
        'micro': '150ms',
        'page': '350ms',
      },
      transitionTimingFunction: {
        'standard': 'cubic-bezier(0.0, 0.0, 0.2, 1)',
        'micro': 'ease-in-out',
        'page': 'cubic-bezier(0.2, 0.8, 0.2, 1)',
      },
    },
  },
  plugins: [],
}; 