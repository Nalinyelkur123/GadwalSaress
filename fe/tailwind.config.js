/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#FDF2F4',
          100: '#FBE6E9',
          200: '#F6CCD2',
          300: '#EFA3AD',
          400: '#C8384E',
          500: '#8B1E32',
          600: '#701A28',
          700: '#5C101D', // Primary Brand Maroon
          800: '#460C15',
          900: '#32070E',
        },
        gold: {
          50: '#FCF9F2',
          100: '#F7F0DF',
          200: '#EDE0BF',
          300: '#DFCA95',
          400: '#C5A059', // Accent Antique Gold
          500: '#A9833D',
          600: '#8B682C',
          700: '#6E4F1F',
        },
        ivory: {
          50: '#FFFFFF',
          100: '#FDFBF7', // Primary Warm Background
          200: '#F9F6F0', // Card Surface
          300: '#F3EFE6', // Light Border / Divider
          400: '#E8E1D3', // Border Muted
          500: '#D5CBB9',
        },
        charcoal: {
          900: '#1F1E1D', // Primary Heading / Body Text
          800: '#2F2C2A',
          700: '#484440',
          600: '#69635C', // Subtitle / Muted Text
          500: '#8A837A',
          400: '#ABA399',
        }
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        display: ['"Cinzel"', '"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'warm-sm': '0 1px 3px rgba(92, 16, 29, 0.05), 0 1px 2px rgba(0, 0, 0, 0.04)',
        'warm-md': '0 4px 12px rgba(92, 16, 29, 0.08), 0 2px 4px rgba(0, 0, 0, 0.04)',
        'warm-lg': '0 12px 24px rgba(92, 16, 29, 0.10), 0 4px 8px rgba(0, 0, 0, 0.05)',
      }
    },
  },
  plugins: [],
}
