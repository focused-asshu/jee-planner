export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: 'rgb(var(--color-ink) / <alpha-value>)',
        'ink-muted': 'rgb(var(--color-ink-muted) / <alpha-value>)',
        paper: 'rgb(var(--color-paper) / <alpha-value>)',
        canvas: 'rgb(var(--color-canvas) / <alpha-value>)',
        border: 'rgb(var(--color-border) / <alpha-value>)',
        ember: {
          50: 'rgb(var(--color-ember-50) / <alpha-value>)',
          600: 'rgb(var(--color-ember-600) / <alpha-value>)',
          700: 'rgb(var(--color-ember-700) / <alpha-value>)',
        },
        sky: {
          50: 'rgb(var(--color-sky-50) / <alpha-value>)',
          500: 'rgb(var(--color-sky-500) / <alpha-value>)',
          600: 'rgb(var(--color-sky-600) / <alpha-value>)',
        },
        sage: {
          50: 'rgb(var(--color-sage-50) / <alpha-value>)',
          100: 'rgb(var(--color-sage-100) / <alpha-value>)',
          200: 'rgb(var(--color-sage-200) / <alpha-value>)',
          300: 'rgb(var(--color-sage-300) / <alpha-value>)',
          500: 'rgb(var(--color-sage-500) / <alpha-value>)',
          700: 'rgb(var(--color-sage-700) / <alpha-value>)',
          800: 'rgb(var(--color-sage-800) / <alpha-value>)',
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
      borderRadius: { lg: '0.5rem', xl: '0.75rem' },
      boxShadow: {
        card: 'var(--shadow-card)',
        'card-hover': 'var(--shadow-card-hover)',
      },
    },
  },
  plugins: [],
};
