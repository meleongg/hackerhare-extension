/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./popup.tsx",
    "./options.tsx",
    "./contents/**/*.{ts,tsx}",
    "./tabs/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: '#001342',    // Deep space blue
          secondary: '#1b2a5a',  // Lighter card/container blue
        },
        text: {
          primary: '#ebeaf8',    // Bright off-white
          muted: '#a8b2cc',      // Soft blue-gray
          tagline: '#d3ceee',    // Soft lavender
          status: '#fff491',     // Glowing alert yellow
        },
        mascot: {
          lavender: '#d3ceee',   // Bunny tone
        },
        rocket: {
          orange: '#ffa321',     // Accent warning orange
        },
        agent: {
          black: '#212121',      // Suit color
        },
        accent: {
          yellow: '#fff491',     // Warning accent
        },
        card: {
          bg: '#1b2a5a',
          border: 'rgba(139, 149, 179, 0.3)',
        },
        placeholder: {
          bg: '#152045',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        brand: ['Syncopate', 'system-ui', 'sans-serif'],
        mono: ['Space Mono', 'ui-monospace', 'monospace'],
      },
    },
  },
  plugins: [],
}