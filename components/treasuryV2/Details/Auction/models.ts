export enum ParticipantPreset {
  S = 1000,
  M = 10_000,
  L = 100_000,
  XL = 1_000_000,
}

export interface SellForm {
  baseMint: string
  quoteMint: string
  areAsksEncrypted: boolean
  areBidsEncrypted: boolean
  minBaseOrderSize: number
  tickSize: number
  orderPhaseLength: number
  decryptionPhaseLength: number
  eventQueueBytes: number
  bidsBytes: number
  asksBytes: number
  maxOrders: number
  tokensForSale: number
  minPrice: number
}
