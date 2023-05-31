type CountryMetadata = {
  name: string
  dialCode: string
  flag: string
}

type CountryMap = {
  [countryCode: string]: CountryMetadata
}

export const countryMap: CountryMap = {
  US: {
    dialCode: '+1',
    flag: '🇺🇸',
    name: 'United States',
  },
  AU: {
    dialCode: '+61',
    flag: '🇦🇺',
    name: 'Australia',
  },
  AT: {
    dialCode: '+43',
    flag: '🇦🇹',
    name: 'Austria',
  },
  BE: {
    dialCode: '+32',
    flag: '🇧🇪',
    name: 'Belgium',
  },
  BR: {
    dialCode: '+55',
    flag: '🇧🇷',
    name: 'Brazil',
  },
  CA: {
    dialCode: '+1',
    flag: '🇨🇦',
    name: 'Canada',
  },
  DK: {
    dialCode: '+45',
    flag: '🇩🇰',
    name: 'Denmark',
  },
  FI: {
    dialCode: '+358',
    flag: '🇫🇮',
    name: 'Finland',
  },
  FR: {
    dialCode: '+33',
    flag: '🇫🇷',
    name: 'France',
  },
  DE: {
    dialCode: '+49',
    flag: '🇩🇪',
    name: 'Germany',
  },
  HK: {
    dialCode: '+852',
    flag: '🇭🇰',
    name: 'Hong Kong',
  },
  HU: {
    dialCode: '+36',
    flag: '🇭🇺',
    name: 'Hungary',
  },
  IS: {
    dialCode: '+354',
    flag: '🇮🇸',
    name: 'Iceland',
  },
  MY: {
    dialCode: '+60',
    flag: '🇲🇾',
    name: 'Malaysia',
  },
  NO: {
    dialCode: '+47',
    flag: '🇳🇴',
    name: 'Norway',
  },
  PH: {
    dialCode: '+63',
    flag: '🇵🇭',
    name: 'Philippines',
  },
  PL: {
    dialCode: '+48',
    flag: '🇵🇱',
    name: 'Poland',
  },
  PT: {
    dialCode: '+351',
    flag: '🇵🇹',
    name: 'Portugal',
  },
  SG: {
    dialCode: '+65',
    flag: '🇸🇬',
    name: 'Singapore',
  },
  KR: {
    dialCode: '+82',
    flag: '🇰🇷',
    name: 'Korea, Republic of South Korea',
  },
  ES: {
    dialCode: '+34',
    flag: '🇪🇸',
    name: 'Spain',
  },
  SE: {
    dialCode: '+46',
    flag: '🇸🇪',
    name: 'Sweden',
  },
  CH: {
    dialCode: '+41',
    flag: '🇨🇭',
    name: 'Switzerland',
  },
  TW: {
    dialCode: '+886',
    flag: '🇹🇼',
    name: 'Taiwan',
  },
  GB: {
    dialCode: '+44',
    flag: '🇬🇧',
    name: 'United Kingdom',
  },
}
