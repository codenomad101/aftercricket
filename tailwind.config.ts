import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'primary': '#dc2626',
        'primary-light': '#ef4444',
        'primary-dark': '#b91c1c',
      },
      fontFamily: {
        'papyrus': ['Papyrus', 'fantasy', 'serif'],
      },
    },
  },
  plugins: [],
}
export default config



