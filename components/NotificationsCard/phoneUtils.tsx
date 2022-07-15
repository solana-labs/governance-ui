import { parsePhoneNumber } from 'libphonenumber-js'

type PhoneData = {
  countryCode: string
  baseNumber: string
}

export const splitPhoneNumber = (phoneNumber: string): PhoneData => {
  const { country: countryCode, nationalNumber: baseNumber } =
    parsePhoneNumber(phoneNumber)
  if (!countryCode || !baseNumber) {
    throw new Error('No country or phone found')
  }

  return { baseNumber, countryCode }
}

export const formatPhoneNumber = (phoneNumber: string) => {
  if (!phoneNumber) {
    throw new Error('No phone data found!')
  }

  return parsePhoneNumber(phoneNumber)
    .formatInternational()
    .replaceAll(' ', '-')
}
