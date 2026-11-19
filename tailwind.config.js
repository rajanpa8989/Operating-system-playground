/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          base: '#0a0c10',
          surface: '#11141c',
          card: '#161a24',
          subtle: '#1b202e',
          active: '#23293b',
        },
        border: {
          hairline: '#212738',
          muted: '#2d354a',
          accent: '#3e4964',
        },
        lab: {
          lime: '#9cf944',
          limeMuted: '#7ec837',
          olive: '#2d3c2c',
          oliveLight: '#435a42',
          cyan: '#38bdf8',
          amber: '#fbbf24',
          rose: '#f43f5e',
          purple: '#a855f7',
        },
        text: {
          primary: '#f3f4f6',
          secondary: '#94a3b8',
          muted: '#64748b',
          dim: '#475569',
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Menlo', 'Monaco', 'Courier New', 'monospace'],
        sans: ['Geist', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'lab-glow': '0 0 15px -3px rgba(156, 249, 68, 0.15)',
        'lab-cyan-glow': '0 0 15px -3px rgba(56, 189, 248, 0.15)',
        'panel': '0 4px 20px -2px rgba(0, 0, 0, 0.5)',
      },
      backgroundImage: {
        'lab-grid': "radial-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px)",
      }
    },
  },
  plugins: [],
}
