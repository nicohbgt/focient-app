import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/component/**/*.{js,ts,jsx,tsx,mdx}',
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
        'focient-1': '0px 1px 2px 0px rgba(0, 0, 0, 0.30), 0px 1px 3px 1px rgba(0, 0, 0, 0.20)',
        'focient-2': '0px 1px 2px 0px rgba(0, 0, 0, 0.30), 0px 2px 6px 2px rgba(0, 0, 0, 0.20)',
        'focient-3': '0px 1px 2px 0px rgba(0, 0, 0, 0.30), 0px 4px 12px 4px rgba(0, 0, 0, 0.20)',
        'focient-4': '0px 1px 2px 0px rgba(0, 0, 0, 0.30), 0px 8px 24px 8px rgba(0, 0, 0, 0.20)',
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
