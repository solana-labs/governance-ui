import { useEffect, useState } from 'react'

const SANCTIONED_COUNTRIES = [
  { country: 'Antigua and Barbuda', code: 'AG' },
  { country: 'Algeria', code: 'DZ' },
  { country: 'Bangladesh', code: 'BD' },
  { country: 'Bolivia', code: 'BO' },
  { country: 'Belarus', code: 'BY' },
  { country: 'Burundi', code: 'BI' },
  { country: 'Burma (Myanmar)', code: 'MM' },
  { country: "Cote D'Ivoire (Ivory Coast)", code: 'CI' },
  { country: 'Cuba', code: 'CU' },
  { country: 'Democratic Republic of Congo', code: 'CD' },
  { country: 'Ecuador', code: 'EC' },
  { country: 'Iran', code: 'IR' },
  { country: 'Iraq', code: 'IQ' },
  { country: 'Liberia', code: 'LR' },
  { country: 'Libya', code: 'LY' },
  { country: 'Mali', code: 'ML' },
  { country: 'Morocco', code: 'MA' },
  { country: 'Nepal', code: 'NP' },
  { country: 'North Korea', code: 'KP' },
  { country: 'Somalia', code: 'SO' },
  { country: 'Sudan', code: 'SD' },
  { country: 'Syria', code: 'SY' },
  { country: 'Venezuela', code: 'VE' },
  { country: 'Yemen', code: 'YE' },
  { country: 'Zimbabwe', code: 'ZW' },
  { country: 'United States', code: 'US' },
]

const SANCTIONED_COUNTRY_CODES = SANCTIONED_COUNTRIES.map(({ code }) => code)

export default function useIpAddress() {
  const [ipAllowed, setIpAllowed] = useState(true)

  useEffect(() => {
    const checkIpLocation = async () => {
      let ipCountryCode
      try {
        const response = await fetch(`https://www.cloudflare.com/cdn-cgi/trace`)
        const parsedResponse = await response.text()
        const ipLocation = parsedResponse.match(/loc=(.+)/)
        ipCountryCode = ipLocation ? ipLocation[1] : ''
      } catch {
        const response = await fetch(`https://countrycode.bonfida.workers.dev/`)
        const parsedResponse = await response.json()
        ipCountryCode = parsedResponse.countryCode
      }

      if (ipCountryCode) {
        setIpAllowed(!SANCTIONED_COUNTRY_CODES.includes(ipCountryCode))
      }
    }

    checkIpLocation()
  }, [])

  return { ipAllowed }
}
