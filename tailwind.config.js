module.exports = {
  mode: 'jit',
  purge: ['./pages/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  future: {
    removeDeprecatedGapUtilities: true,
    purgeLayersByDefault: true,
  },
  darkMode: false,
  theme: {
    fontFamily: {
      display: ['PT Mono, monospace'],
      body: ['Lato, sans-serif'],
    },
    extend: {
      cursor: {
        help: 'help',
      },
      colors: {
        primary: { light: '#F2C94C', dark: '#EEB91B' },
        'secondary-1': { light: '#AFD803', dark: '#6CBF00' },
        'secondary-2': { light: '#E54033', dark: '#C7251A' },
        'bkg-1': '#141125',
        'bkg-2': '#242132',
        'bkg-3': '#393549',
        'bkg-4': '#4F4B63',
        'fgd-1': '#F0EDFF',
        'fgd-2': '#FCFCFF',
        'fgd-3': '#B9B5CE',
        'fgd-4': '#706C81',
      },
      animation: {
        'ping-small': 'ping-small 1.5s cubic-bezier(0, 0, 0.2, 1) infinite',
      },
      keyframes: {
        'ping-small': {
          '75%, 100%': {
            transform: 'scale(1.06, 1.25)',
            opacity: 0,
          },
        },
      },
    },
  },
  variants: {
    extend: {
      cursor: ['hover', 'focus', 'disabled'],
      opacity: ['disabled'],
      backgroundColor: ['disabled'],
      textColor: ['disabled'],
    },
  },
  plugins: [],
}
