export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0A0A0A',
        'ink-muted': '#52525B',
        paper: '#FFFFFF',
        canvas: '#FAFAF9',
        border: '#E7E5E4',
        ember: {
          50: '#FEF2F2',
          600: '#DC2626',
          700: '#B91C1C',
        },
        sky: {
          50: '#F0F9FF',
          500: '#0EA5E9',
          600: '#0284C7',
        },
        sage: {
          50: '#F4F7F1',
          200: '#DDE6D5',
          500: '#8EA37A',
          700: '#5F714F',
        },
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        xs: ['0.75rem', { lineHeight: '1rem' }],
        sm: ['0.875rem', { lineHeight: '1.25rem' }],
        base: ['1rem', { lineHeight: '1.5rem' }],
        lg: ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.75rem', { lineHeight: '2.125rem', letterSpacing: '-0.02em' }],
        '3xl': ['2.25rem', { lineHeight: '2.5rem', letterSpacing: '-0.03em' }],
      },
      borderRadius: {
        lg: '0.5rem',
        xl: '0.75rem',
      },
      boxShadow: {
        card: '0 1px 1px rgba(10,10,10,0.035), 0 8px 24px rgba(10,10,10,0.055)',
        'card-hover': '0 2px 6px rgba(10,10,10,0.06), 0 14px 34px rgba(10,10,10,0.08)',
      },
    },
  },
  plugins: [],
};
