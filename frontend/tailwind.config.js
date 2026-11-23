/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
        serif: ['Merriweather', 'Georgia', 'serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        prodil: {
          blue: '#2563EB',
          hover: '#1D4ED8',
          cyan: '#00A3FF',
          emerald: '#10B981',
          navy: '#06113C',
          wordmark: '#00104B',
          canvas: '#F4F7FC',
        }
      },
      boxShadow: {
        'soft': '0 4px 24px -4px rgba(6, 17, 60, 0.06)',
        'card': '0 12px 32px -6px rgba(37, 99, 235, 0.10)',
        'paper': '0 20px 50px -12px rgba(6, 17, 60, 0.16)',
        'sheet': '0 10px 25px -5px rgba(15, 23, 42, 0.08), 0 8px 10px -6px rgba(15, 23, 42, 0.04)',
      }
    },
  },
  plugins: [],
}
