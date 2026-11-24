/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Manrope', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      colors: {
        canvas: '#F7F8FA',
        surface: '#FFFFFF',
        ink: {
          primary: '#172033',
          secondary: '#64748B',
          muted: '#94A3B8',
        },
        accent: {
          50: '#F0F5FA',
          100: '#E1ECF5',
          200: '#C3D9EB',
          300: '#96BDDE',
          400: '#6299CD',
          500: '#315E91', // Specified primary accent
          600: '#264D78',
          700: '#1E3E61',
          800: '#18314D',
          900: '#14273E',
        },
        border: {
          subtle: '#E2E8F0',
          strong: '#CBD5E1',
        }
      },
      borderRadius: {
        'sm': '4px',
        DEFAULT: '6px',
        'md': '8px',
        'lg': '10px',
        'xl': '12px',
      }
    },
  },
  plugins: [],
}
