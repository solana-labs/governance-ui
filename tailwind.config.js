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
      backgroundImage: (_) => ({
        'feature-one': "url('../public/img/feature1.png')",
        'feature-two': "url('../public/img/feature2.png')",
        'feature-three': "url('../public/img/feature3.png')",
        'feature-four': "url('../public/img/feature4.png')",
        'bg-texture': "url('../public/img/bgtexture.png')",
        'risk-one': "url('../public/img/risk1.png')",
        'risk-two': "url('../public/img/risk2.png')",
        'risk-three': "url('../public/img/risk3.png')",
        'risk-four': "url('../public/img/risk4.png')",

      }),
      height: {
        575: '575px',
        650: '650px',
        750: '750px',

      },
      cursor: {
        help: 'help',
      },
      colors: {
        primary: { light: '#F2C94C', dark: '#EEB91B' },
        'secondary-1': { light: '#AFD803', dark: '#6CBF00' },
        'secondary-2': { light: '#E54033', dark: '#C7251A' },
        'secondary-3': { light: '#026DF7', dark: '#0259CA' },
        'secondary-4': { light: '#262145', dark: '#1B1735' },
        'bkg-1': '#141125',
        'bkg-2': '#242132',
        'bkg-3': '#393549',
        'bkg-4': '#4F4B63',
        'fgd-1': '#F0EDFF',
        'fgd-2': '#FCFCFF',
        'fgd-3': '#B9B5CE',
        'fgd-4': '#706C81',
        'mango-yellow': '#F2C94C',
        'mango-red': '#E54033',
        'mango-green': '#AFD803',
        'mango-dark': {
          lighter: '#332F46',
          light: '#262337',
          DEFAULT: '#141026',
        },
        'mango-med': {
          light: '#C2BDD9',
          DEFAULT: '#9490A6',
          dark: '#706C81',
        },
        'mango-light': {
          light: '#FCFCFF',
          DEFAULT: '#F0EDFF',
          dark: '#B9B5CE',
        },
        'mango-grey': {
          lighter: '#f7f7f7',
          light: '#e6e6e6',
          dark: '#092e34',
          darker: '#072428',
          darkest: '#061f23',
        },
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
      strokeWidth: {
        3: '3',
        4: '4',
        5: '5',
        6: '6',
        7: '7',
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
