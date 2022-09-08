module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './Strategies/**/*.{js,ts,jsx,tsx}',
    './VoteStakeRegistry/**/*.{js,ts,jsx,tsx}',
    './hub/**/*.{js,ts,jsx,tsx}',
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
      body: ['Inter, sans-serif'],
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
          'bkg-3': '#292833',
          'bkg-4': '#363D44',
          'bkg-5': '#2A2D34',
          'fgd-1': '#F6F5F3',
          'fgd-2': '#D1D6DB',
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
        'bkg-5': 'var(--bkg-5)',
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
        'error-red': '#ff7c7c',
        'confirm-green': '#8effdd',
        'bkg-grey': '#292833',
        'night-grey': '#201F27',
        'bkg-black': '#212429',
        'secondary-grey': '#D5D4D7',
        'red-50': '#fef2f2',
        'red-100': '#fee2e2',
        'red-200': '#fecaca',
        'red-300': '#fca5a5',
        'red-400': '#f87171',
        'red-500': '#ef4444',
        'red-600': '#dc2626',
        'red-700': '#b91c1c',
        'red-800': '#991b1b',
        'red-900': '#7f1d1d',
        'green-50': '#f0fdf4',
        'green-100': '#dcfce7',
        'green-200': '#bbf7d0',
        'green-300': '#86efac',
        'green-400': '#4ade80',
        'green-500': '#22c55e',
        'green-600': '#16a34a',
        'green-700': '#15803d',
        'green-800': '#166534',
        'green-900': '#14532d',
        'orange-50': '#fff7ed',
        'orange-100': '#ffedd5',
        'orange-200': '#fed7aa',
        'orange-300': '#fdba74',
        'orange-400': '#fb923c',
        'orange-500': '#f97316',
        'orange-600': '#ea580c',
        'orange-700': '#c2410c',
        'orange-800': '#9a3412',
        'orange-900': '#7c2d12',
        'blue-50': '#eff6ff',
        'blue-100': '#dbeafe',
        'blue-200': '#bfdbfe',
        'blue-300': '#93c5fd',
        'blue-400': '#60a5fa',
        'blue-500': '#3b82f6',
        'blue-600': '#2563eb',
        'blue-700': '#1d4ed8',
        'blue-800': '#1e40af',
        'blue-900': '#1e3a8a',
      },
      animation: {
        'connect-wallet-ping':
          'connect-wallet-ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite',
        gradient: 'gradient 4s ease-in-out infinite',
        loader: 'loader 0.6s infinite alternate',
        'staggered-bounce': 'staggered-bounce 1600ms infinite',
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
        loader: {
          to: {
            opacity: 0.1,
            transform: 'translate3d(0, 0, 0)',
          },
        },
        'staggered-bounce': {
          '0%, 25%': {
            transform: 'translateY(0)',
            'animation-timing-function': 'cubic-bezier(0, 0, 0.2, 1)',
          },
          '12.5%': {
            transform: 'translateY(-50%)',
            'animation-timing-function': 'cubic-bezier(0.8, 0, 1, 1)',
          },
        },
      },
      fontFamily: {
        rota: ['Rota', 'sans-serif'],
        roboto: ['Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
