import { LiquidityPoolKeys, jsonInfo2PoolKeys } from '@raydium-io/raydium-sdk'
import { PublicKey } from '@solana/web3.js'

export const UXP_USDC_POOL_KEYS: LiquidityPoolKeys = jsonInfo2PoolKeys({
  id: '6tmFJbMk5yVHFcFy7X2K8RwHjKLr6KVFLYXpgpBNeAxB',
  baseMint: 'UXPhBoR3qG4UCiGNJfV7MqhHyFqKN68g45GoYvAeL2M',
  quoteMint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
  lpMint: 'AyuurXCCF2KdYTURbN3JsDKzZFZSiRqKc8UcZnrgBsGm',
  version: 4,
  programId: '675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8',
  authority: '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1',
  openOrders: '7AP5KPxkc9TYtYvqyXc4RK9GRVutGSne8Pj4ryKJoY4Z',
  targetOrders: 'DfEhXNWDjsDNz1bqz6GinQU8RepjFneosamAM2XZ3heT',
  baseVault: '3Dtb2kDA3pJkUrULXmQa8qn1RkmgnEM4eo2nf6Uuq3K3',
  quoteVault: 'Gh2YaVC1sjzZQMixnHNXDin6awBAV6p2D5zY8STMu4p4',
  withdrawQueue: '27BsfZSe59K2WXbhGGrvpySTRhd12moxxdLpYm6coFDT',
  lpVault: '2dbkq546TV6C7Dmx5HWdHx7sTf6tpetvryqDRrcsE7kQ',
  marketVersion: 3,
  marketProgramId: '9xQeWvG816bUx9EPjHmaT23yvVM2ZWbrrpZb9PusVFin',
  marketId: '7KQpsp914VYnh62yV6AGfoG9hprfA14SgzEyqr6u9NY1',
  marketAuthority: '5F4DUyyDR2uH7VTADLzi1CFmsVBVqPXk4TM4yHf9WDJi',
  marketBaseVault: '9QGayBN3ycectkhLKiTPcfM9iFVtFpefSGWRr3XUoLwk',
  marketQuoteVault: 'EiVf38NCvDFVJQqF5FgX1zeQ26Mzr88iELFugUSMJzu9',
  marketBids: 'L6vnHnDLf8EPKXyaNAyhpkCdocvtkpNX8euVFZtqjCQ',
  marketAsks: '68xmWKfE32qDoFL4iKBsjKpDyAfaiW4efdTDSAm33sKj',
  marketEventQueue: 'Cta4TEwKCKhSphkMNzXsURVr2V6mozm2SPaV8tCgDPwy',
})

// fetch poolkeys from https://sdk.raydium.io/liquidity/mainnet.json
const poolKeys = [
  {
    /**
     *  ============= UXP/USDC =============
     */
    id: '6tmFJbMk5yVHFcFy7X2K8RwHjKLr6KVFLYXpgpBNeAxB',
    baseMint: 'UXPhBoR3qG4UCiGNJfV7MqhHyFqKN68g45GoYvAeL2M',
    quoteMint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
    lpMint: 'AyuurXCCF2KdYTURbN3JsDKzZFZSiRqKc8UcZnrgBsGm',
    version: 4,
    programId: '675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8',
    authority: '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1',
    openOrders: '7AP5KPxkc9TYtYvqyXc4RK9GRVutGSne8Pj4ryKJoY4Z',
    targetOrders: 'DfEhXNWDjsDNz1bqz6GinQU8RepjFneosamAM2XZ3heT',
    baseVault: '3Dtb2kDA3pJkUrULXmQa8qn1RkmgnEM4eo2nf6Uuq3K3',
    quoteVault: 'Gh2YaVC1sjzZQMixnHNXDin6awBAV6p2D5zY8STMu4p4',
    withdrawQueue: '27BsfZSe59K2WXbhGGrvpySTRhd12moxxdLpYm6coFDT',
    lpVault: '2dbkq546TV6C7Dmx5HWdHx7sTf6tpetvryqDRrcsE7kQ',
    marketVersion: 3,
    marketProgramId: '9xQeWvG816bUx9EPjHmaT23yvVM2ZWbrrpZb9PusVFin',
    marketId: '7KQpsp914VYnh62yV6AGfoG9hprfA14SgzEyqr6u9NY1',
    marketAuthority: '5F4DUyyDR2uH7VTADLzi1CFmsVBVqPXk4TM4yHf9WDJi',
    marketBaseVault: '9QGayBN3ycectkhLKiTPcfM9iFVtFpefSGWRr3XUoLwk',
    marketQuoteVault: 'EiVf38NCvDFVJQqF5FgX1zeQ26Mzr88iELFugUSMJzu9',
    marketBids: 'L6vnHnDLf8EPKXyaNAyhpkCdocvtkpNX8euVFZtqjCQ',
    marketAsks: '68xmWKfE32qDoFL4iKBsjKpDyAfaiW4efdTDSAm33sKj',
    marketEventQueue: 'Cta4TEwKCKhSphkMNzXsURVr2V6mozm2SPaV8tCgDPwy',
  },
  // Add other Raydium liquidity pools here
]

export const liquidityPoolKeys: LiquidityPoolKeys[] = poolKeys.map((pk) =>
  jsonInfo2PoolKeys(pk)
)

export const liquidityPoolList = [
  {
    label: 'UXP - USDC',
    id: new PublicKey('6tmFJbMk5yVHFcFy7X2K8RwHjKLr6KVFLYXpgpBNeAxB'),
  },
]

export const liquidityPoolKeysList = {
  'UXP - USDC': {
    id: '6tmFJbMk5yVHFcFy7X2K8RwHjKLr6KVFLYXpgpBNeAxB',
    baseMint: 'UXPhBoR3qG4UCiGNJfV7MqhHyFqKN68g45GoYvAeL2M',
    quoteMint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
    lpMint: 'AyuurXCCF2KdYTURbN3JsDKzZFZSiRqKc8UcZnrgBsGm',
    version: 4,
    programId: '675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8',
    authority: '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1',
    openOrders: '7AP5KPxkc9TYtYvqyXc4RK9GRVutGSne8Pj4ryKJoY4Z',
    targetOrders: 'DfEhXNWDjsDNz1bqz6GinQU8RepjFneosamAM2XZ3heT',
    baseVault: '3Dtb2kDA3pJkUrULXmQa8qn1RkmgnEM4eo2nf6Uuq3K3',
    quoteVault: 'Gh2YaVC1sjzZQMixnHNXDin6awBAV6p2D5zY8STMu4p4',
    withdrawQueue: '27BsfZSe59K2WXbhGGrvpySTRhd12moxxdLpYm6coFDT',
    lpVault: '2dbkq546TV6C7Dmx5HWdHx7sTf6tpetvryqDRrcsE7kQ',
    marketVersion: 3,
    marketProgramId: '9xQeWvG816bUx9EPjHmaT23yvVM2ZWbrrpZb9PusVFin',
    marketId: '7KQpsp914VYnh62yV6AGfoG9hprfA14SgzEyqr6u9NY1',
    marketAuthority: '5F4DUyyDR2uH7VTADLzi1CFmsVBVqPXk4TM4yHf9WDJi',
    marketBaseVault: '9QGayBN3ycectkhLKiTPcfM9iFVtFpefSGWRr3XUoLwk',
    marketQuoteVault: 'EiVf38NCvDFVJQqF5FgX1zeQ26Mzr88iELFugUSMJzu9',
    marketBids: 'L6vnHnDLf8EPKXyaNAyhpkCdocvtkpNX8euVFZtqjCQ',
    marketAsks: '68xmWKfE32qDoFL4iKBsjKpDyAfaiW4efdTDSAm33sKj',
    marketEventQueue: 'Cta4TEwKCKhSphkMNzXsURVr2V6mozm2SPaV8tCgDPwy',
  },
}
