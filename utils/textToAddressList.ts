import { validatePubkey } from '@utils/formValidation'

interface Addresses {
  valid: string[]
  invalid: string[]
}

export const textToAddressList = (textBlock: string): Addresses => {
  const valid: string[] = []
  const invalid: string[] = []

  textBlock.split(/[\s,]+/).forEach((address) => {
    const trimmedAddress = address.trim();
    if (trimmedAddress) {
      if (validatePubkey(trimmedAddress)) {
        valid.push(trimmedAddress)
      } else {
        invalid.push(trimmedAddress)
      }
    }
  })

  return { valid, invalid }
}
