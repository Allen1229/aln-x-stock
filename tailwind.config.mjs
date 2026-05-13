/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: '#0b0f14',
          soft: '#121821',
          card: '#161d27',
        },
        ink: {
          DEFAULT: '#e6edf3',
          mute: '#9aa7b4',
          dim: '#6b7682',
        },
        accent: {
          DEFAULT: '#4ea1ff',
          hover: '#6db4ff',
        },
        up: '#ef4444',
        down: '#22c55e',
        border: '#1f2937',
      },
      fontFamily: {
        sans: ['"Noto Sans TC"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      typography: ({ theme }) => ({
        invert: {
          css: {
            '--tw-prose-body': theme('colors.ink.DEFAULT'),
            '--tw-prose-headings': theme('colors.ink.DEFAULT'),
            '--tw-prose-links': theme('colors.accent.DEFAULT'),
          },
        },
      }),
    },
  },
  plugins: [],
};
