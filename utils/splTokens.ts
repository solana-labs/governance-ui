import { PublicKey } from '@solana/web3.js'

type SplTokenInformation = {
  name: string
  mint: PublicKey
  decimals: number
}

type SupportedSplTokenNames = 'USDC' | 'WSOL'

export const SPL_TOKENS: {
  [key in SupportedSplTokenNames]: SplTokenInformation
} = {
  USDC: {
    name: 'USD Coin',
    mint: new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'),
    decimals: 6,
  },

  WSOL: {
    name: 'Wrapped SOL',
    mint: new PublicKey('So11111111111111111111111111111111111111112'),
    decimals: 9,
  },
} as const
