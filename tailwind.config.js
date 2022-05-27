module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './components_2/**/*.{js,ts,jsx,tsx}',
    './forms/**/*.{js,ts,jsx,tsx}',
    './Strategies/**/*.{js,ts,jsx,tsx}',
    './VoteStakeRegistry/**/*.{js,ts,jsx,tsx}',
  ],
  future: {
    removeDeprecatedGapUtilities: true,
    purgeLayersByDefault: true,
  },
  theme: {
    fontFamily: {
      serif: [
        'p22-mackinac-pro',
        'ui-serif',
        'Georgia',
        'Cambria',
        '"Times New Roman"',
        'Times',
        'serif',
      ],
      sans: [
        'Ambit',
        'ui-sans-serif',
        'system-ui',
        '-apple-system',
        'BlinkMacSystemFont',
        '"Segoe UI"',
        'Roboto',
        '"Helvetica Neue"',
        'Arial',
        '"Noto Sans"',
        'sans-serif',
        '"Apple Color Emoji"',
        '"Segoe UI Emoji"',
        '"Segoe UI Symbol"',
        '"Noto Color Emoji"',
      ],
      display: ['PT Mono', 'monospace'],
      body: ['Inter', 'sans-serif'],
    },
    extend: {
      fontSize: {
        'landing-page': {
          xs: [
            '12pt',
            {
              letterSpacing: '0pt',
              lineHeight: 1.4,
            },
          ],
          sm: [
            '14pt',
            {
              letterSpacing: '0pt',
              lineHeight: 1.4,
            },
          ],
          base: [
            '18pt',
            {
              letterSpacing: '0pt',
              lineHeight: 1.4,
            },
          ],
          lg: [
            '20pt',
            {
              letterSpacing: '-0.5pt',
              lineHeight: 1.1,
            },
          ],
          xl: [
            '24pt',
            {
              letterSpacing: '-0.5pt',
              lineHeight: 1.1,
            },
          ],
          '2xl': [
            '36pt',
            {
              letterSpacing: '-0.5pt',
              lineHeight: 1.1,
            },
          ],
          '3xl': [
            '50pt',
            {
              letterSpacing: '-0.5pt',
              lineHeight: 1.1,
            },
          ],
        },
      },
      cursor: {
        help: 'help',
      },
      colors: {
        'dark-theme': {
          primary: { light: '#E1CE7A', dark: '#D2B537' },
          'secondary-1': { light: '#AFD803', dark: '#6CBF00' },
          'secondary-2': { light: '#FFCB1B', dark: '#F48F25' },
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
        'light-theme': {
          primary: { light: '#292929', dark: '#101010' },
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
        'realms-theme': {
          primary: { light: '#292929', dark: '#101010' },
          'secondary-1': { light: '#AFD803', dark: '#6CBF00' },
          'secondary-2': { light: '#E54033', dark: '#C7251A' },
          'bkg-11': '#131418',
          'bkg-12': '#0c0d0f',
          'bkg-13': '#50cbf2',
          lightblue: '#B8ECFB',
          blue: '#5BD2F8',
          turquoise: '#47D1C3',
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
        lightblue: 'var(--lightblue)',
        turquoise: 'var(--turquoise)',
        'bkg-11': 'var(--bkg-11)',
        'bkg-12': 'var(--bkg-12)',
        'bkg-13': 'var(--bkg-13)',
        'error-red': '#ff7c7c',
        'confirm-green': '#8effdd',
        'bkg-grey': '#292833',
        'night-grey': '#201F27',
      },
      animation: {
        'connect-wallet-ping':
          'connect-wallet-ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite',
        gradient: 'gradient 4s ease-in-out infinite',
        loader: 'loader 0.6s infinite alternate',
      },
      keyframes: {
        loader: {
          to: {
            opacity: 0.1,
            transform: 'translate3d(0, 0, 0)',
          },
        },
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
