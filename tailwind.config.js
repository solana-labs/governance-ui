module.exports = {
  mode: 'jit',
  purge: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './Strategies/**/*.{js,ts,jsx,tsx}',
  ],
  future: {
    removeDeprecatedGapUtilities: true,
    purgeLayersByDefault: true,
  },
  darkMode: false,
  theme: {
    fontFamily: {
      display: ['PT Mono, monospace'],
      body: ['Inter, sans-serif'],
    },
    extend: {
      cursor: {
        help: 'help',
      },
      colors: {
        'sierra-theme': {
          primary: { light: '#E1CE7A', dark: '#D2B537' },
          'secondary-1': { light: '#AFD803', dark: '#6CBF00' },
          'secondary-2': { light: '#E54033', dark: '#C7251A' },
          'bkg-1': '#121417',
          'bkg-2': '#202429',
          'bkg-3': '#2F343B',
          'bkg-4': '#363D44',
          'fgd-1': '#F6F5F3',
          'fgd-2': '#D1D6DB',
          'fgd-3': '#A4ACB7',
          'fgd-4': '#40474F',
          orange: '#F7A531',
          red: '#cb676f',
          green: '#78C46C',
          blue: '#8AACEB',
        },
        'mango-theme': {
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
          orange: '#F2C94C',
          red: '#E54033',
          green: '#AFD803',
          blue: '#8AACEB',
        },
        'bkg-1': 'var(--bkg-1)',
        'bkg-2': 'var(--bkg-2)',
        'bkg-3': 'var(--bkg-3)',
        'bkg-4': 'var(--bkg-4)',
        'fgd-1': 'var(--fgd-1)',
        'fgd-2': 'var(--fgd-2)',
        'fgd-3': 'var(--fgd-3)',
        'fgd-4': 'var(--fgd-4)',
        'primary-light': 'var(--primary-light)',
        'primary-dark': 'var(--primary-dark)',
        'secondary-1-light': 'var(--secondary-1-light)',
        'secondary-1-dark': 'var(--secondary-1-dark)',
        'secondary-2-light': 'var(--secondary-2-light)',
        'secondary-2-dark': 'var(--secondary-2-dark)',
        red: 'var(--red)',
        green: 'var(--green)',
        orange: 'var(--orange)',
        blue: 'var(--blue)',
      },
      animation: {
        'connect-wallet-ping':
          'connect-wallet-ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite',
        gradient: 'gradient 4s ease-in-out infinite',
      },
      keyframes: {
        'connect-wallet-ping': {
          '75%, 100%': {
            transform: 'scale(1.06, 1.3)',
            opacity: '10%',
          },
        },
        gradient: {
          '0%': {
            'background-position': '15% 0%',
          },
          '50%': {
            'background-position': '85% 100%',
          },
          '100%': {
            'background-position': '15% 0%',
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
      borderWidth: ['last'],
    },
  },
  plugins: [],
}
