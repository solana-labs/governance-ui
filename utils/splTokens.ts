import { PublicKey } from '@solana/web3.js'
import SolendConfiguration, {
  SupportedCollateralMintNames as SolendSupportedCollateralMintNames,
} from '@tools/sdk/solend/configuration'

type SplTokenInformation = {
  name: string
  mint: PublicKey
  decimals: number
}

type SupportedSplTokenNames =
  | 'USDC'
  | 'WSOL'
  | SolendSupportedCollateralMintNames

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

  ...SolendConfiguration.getSupportedCollateralMintsInformation(),
} as const
