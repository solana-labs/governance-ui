// A list of "passes" offered by Civic to verify or gate access to a DAO.
export const availablePasses: {
  name: string
  value: string
  description: string
  isSybilResistance: boolean
}[] = [
  // Default
  {
    name: 'Uniqueness',
    value: 'uniqobk8oGh4XBLMqM68K8M2zNu3CdYX7q5go7whQiv',
    description:
      'A biometric proof of personhood, preventing Sybil attacks while retaining privacy',
    isSybilResistance: true,
  },
  {
    name: 'ID Verification',
    value: 'bni1ewus6aMxTxBi5SAfzEmmXLf8KcVFRmTfproJuKw',
    description:
      'A KYC process for your DAO, allowing users to prove their identity by presenting a government-issued ID',
    isSybilResistance: false,
  },
  {
    name: 'Bot Resistance',
    value: 'ignREusXmGrscGNUesoU9mxfds9AiYTezUKex2PsZV6',
    description: 'A simple CAPTCHA to prevent bots from spamming your DAO',
    isSybilResistance: false,
  },
  {
    name: 'Other',
    value: '',
    description:
      'Set up your own custom verification (contact Civic.com for options)',
    isSybilResistance: false,
  },
]

// Infer the types from the available passes, giving type safety on the `other` and `default` pass types
type ArrayElement<
  ArrayType extends readonly unknown[]
> = ArrayType extends readonly (infer ElementType)[] ? ElementType : never
export type CivicPass = ArrayElement<typeof availablePasses>

// Use this when populating a dropdown
export const defaultPass: CivicPass = availablePasses[0]
// Use this in cases where you are implicitly adding sybil resistance to a DAO (e.g. QV DAO creation), rather than
// offering a choice - this allows defaultPass to be something *other than* sybil resistance without breaking things.
export const defaultSybilResistancePass = availablePasses[0]
