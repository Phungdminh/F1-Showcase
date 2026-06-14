/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        // Be Vietnam Pro — designed for Vietnamese; system sans fallback.
        sans: [
          '"Be Vietnam Pro"',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'Roboto',
          'Arial',
          'sans-serif',
        ],
      },
      colors: {
        // F1 brand accent (user-chosen "Đỏ F1 / Carbon" scheme). Used for the
        // global UI accent — active nav, CTAs, links, highlights. Team colors
        // stay scoped to team routes via the --team-primary CSS var.
        f1: {
          DEFAULT: '#E10600',
          hover: '#FF1801',
        },
        carbon: '#0A0A0B',
      },
    },
  },
  plugins: [],
};
