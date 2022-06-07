module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './Strategies/**/*.{js,ts,jsx,tsx}',
    './VoteStakeRegistry/**/*.{js,ts,jsx,tsx}',
  ],
  future: {
    removeDeprecatedGapUtilities: true,
    purgeLayersByDefault: true,
  },
  theme: {
    fontFamily: {
      serif: ['p22-mackinac-pro, ui-serif, serif'],
      sans: ['Ambit, sans-serif'],
      display: ['PT Mono, monospace'],
      body: ['Ambit, sans-serif'],
    },
    extend: {
      cursor: {
        help: 'help',
      },
      colors: {
        'dark-theme': {
          primary: { light: '#5DC9EB', dark: '#cecece' },
          'secondary-1': { light: '#AFD803', dark: '#6CBF00' },
          'secondary-2': { light: '#FFCB1B', dark: '#F48F25' },
          'bkg-1': '#17161c',
          'bkg-2': '#201F27',
          'bkg-3': '#17161c',
          'bkg-4': '#363D44',
          'fgd-1': '#E5E5E6',
          'fgd-2': '#8C8F93',
          'fgd-3': '#A4ACB7',
          'fgd-4': '#40474F',
          orange: '#F7A531',
          red: '#FF7C7C',
          green: '#30C89A',
          blue: '#00e4ff',
        },
        'light-theme': {
          primary: { light: '#5DC9EB', dark: '#101010' },
          'secondary-1': { light: '#AFD803', dark: '#6CBF00' },
          'secondary-2': { light: '#E54033', dark: '#C7251A' },
          'fgd-1': '#3d3d3d',
          'fgd-2': '#7a7a7a',
          'fgd-3': '#adadad',
          'fgd-4': '#cccccc',
          'bkg-1': '#fcfcfc',
          'bkg-2': '#f0f0f0',
          'bkg-3': '#e0e0e0',
          'bkg-4': '#d6d6d6',
          orange: '#F7A531',
          red: '#cb676f',
          green: '#6BBF5F',
          blue: '#3F77DE',
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
  plugins: [],
}
