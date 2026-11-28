// Allow a seasonal palette to override the existing brand colors without
// changing the default colors or Tailwind opacity utilities.
const themedPalette = (name, palette) => Object.fromEntries(
  Object.entries(palette).map(([shade, hex]) => {
    const rgb = hex.slice(1).match(/.{2}/g).map((channel) => parseInt(channel, 16)).join(' ')
    return [shade, `rgb(var(--app-${name}-${shade}, ${rgb}) / <alpha-value>)`]
  })
)

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    screens: {
      xs: '420px',
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
    },
    extend: {
      colors: {
        // Custom colors for your app
        primary: themedPalette('primary', {
          50: '#f5f7ff',
          100: '#ebf0ff',
          200: '#d6e0ff',
          300: '#b3c7ff',
          400: '#8da8ff',
          500: '#667eea',
          600: '#5568d3',
          700: '#4451b8',
          800: '#343d94',
          900: '#2a3177',
        }),
        secondary: themedPalette('secondary', {
          50: '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#d8b4fe',
          400: '#c084fc',
          500: '#a855f7',
          600: '#9333ea',
          700: '#7e22ce',
          800: '#6b21a8',
          900: '#581c87',
        }),
      },
      backgroundColor: {
        'dark': '#000000',
      },
      textColor: {
        'dark': '#ffffff',
      },
    },
  },
  plugins: [],
}
