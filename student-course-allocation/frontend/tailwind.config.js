export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: { sans: ['Inter', 'sans-serif'] },
      colors: {
        primary: { DEFAULT: '#7c3aed', dark: '#6d28d9', light: '#a78bfa' },
      },
    }
  },
  plugins: []
}
