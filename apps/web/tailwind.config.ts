import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/screens/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      colors: {
        focus: {
          DEFAULT: '#2563EB', // Deep Cobalt Blue
          hover: '#1D4ED8',
          subtle: '#EFF6FF',
          border: '#DBEAFE',
          text: '#1E3A8A',
        },
        efficient: {
          DEFAULT: '#0D9488', // Soft Balance Teal
          hover: '#0F766E',
          subtle: '#F0FDFA',
          border: '#CCFBF1',
          text: '#134E4A',
        },
        accent: {
          DEFAULT: '#7C3AED', // Deep Violet
          hover: '#6D28D9',
          subtle: '#F5F3FF',
          border: '#DDD6FE',
          text: '#4C1D95',
        },
        neutral: {
          canvas: '#F8FAFC',
          card: '#FFFFFF',
          muted: '#F1F5F9',
          border: '#CBD5E1',
          text: '#0F172A',
        },
        warning: {
          DEFAULT: '#D97706', // Warm Amber (guilt-free reschedule guardrail)
          subtle: '#FFFBEB',
          border: '#FDE68A',
          text: '#78350F',
        },
      },
      boxShadow: {
        'focient-1': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'focient-2': '0 1px 3px 0 rgba(0, 0, 0, 0.06), 0 1px 2px -1px rgba(0, 0, 0, 0.06)',
        'focient-3': '0 4px 6px -1px rgba(0, 0, 0, 0.06), 0 2px 4px -2px rgba(0, 0, 0, 0.04)',
        'focient-4': '0 10px 15px -3px rgba(0, 0, 0, 0.06), 0 4px 6px -4px rgba(0, 0, 0, 0.02)',
      },
      transitionDuration: {
        fast: '150ms',
        normal: '200ms',
        moderate: '250ms',
        slow: '300ms',
        deliberate: '400ms',
      },
    },
  },
  plugins: [],
};

export default config;
