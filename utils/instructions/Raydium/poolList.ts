import { LiquidityPoolKeys } from '@raydium-io/raydium-sdk'
import { PublicKey } from '@solana/web3.js'

// Add new pool name here, example: 'UXP-USDC' | 'Foo';
export type PoolName = 'UXP-USDC'

export type Pools = {
  [key in PoolName]: LiquidityPoolKeys
}

export const pools: Pools = {
  'UXP-USDC': {
    id: new PublicKey('6tmFJbMk5yVHFcFy7X2K8RwHjKLr6KVFLYXpgpBNeAxB'),
    baseMint: new PublicKey('UXPhBoR3qG4UCiGNJfV7MqhHyFqKN68g45GoYvAeL2M'),
    baseDecimals: 9,
    quoteMint: new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'),
    quoteDecimals: 6,
    lpMint: new PublicKey('AyuurXCCF2KdYTURbN3JsDKzZFZSiRqKc8UcZnrgBsGm'),
    lpDecimals: 9,
    version: 4,
    programId: new PublicKey('675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8'),
    authority: new PublicKey('5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1'),
    openOrders: new PublicKey('7AP5KPxkc9TYtYvqyXc4RK9GRVutGSne8Pj4ryKJoY4Z'),
    targetOrders: new PublicKey('DfEhXNWDjsDNz1bqz6GinQU8RepjFneosamAM2XZ3heT'),
    baseVault: new PublicKey('3Dtb2kDA3pJkUrULXmQa8qn1RkmgnEM4eo2nf6Uuq3K3'),
    quoteVault: new PublicKey('Gh2YaVC1sjzZQMixnHNXDin6awBAV6p2D5zY8STMu4p4'),
    withdrawQueue: new PublicKey(
      '27BsfZSe59K2WXbhGGrvpySTRhd12moxxdLpYm6coFDT'
    ),
    lpVault: new PublicKey('2dbkq546TV6C7Dmx5HWdHx7sTf6tpetvryqDRrcsE7kQ'),
    marketVersion: 3,
    marketProgramId: new PublicKey(
      '9xQeWvG816bUx9EPjHmaT23yvVM2ZWbrrpZb9PusVFin'
    ),
    marketId: new PublicKey('7KQpsp914VYnh62yV6AGfoG9hprfA14SgzEyqr6u9NY1'),
    marketAuthority: new PublicKey(
      '5F4DUyyDR2uH7VTADLzi1CFmsVBVqPXk4TM4yHf9WDJi'
    ),
    marketBaseVault: new PublicKey(
      '9QGayBN3ycectkhLKiTPcfM9iFVtFpefSGWRr3XUoLwk'
    ),
    marketQuoteVault: new PublicKey(
      'EiVf38NCvDFVJQqF5FgX1zeQ26Mzr88iELFugUSMJzu9'
    ),
    marketBids: new PublicKey('L6vnHnDLf8EPKXyaNAyhpkCdocvtkpNX8euVFZtqjCQ'),
    marketAsks: new PublicKey('68xmWKfE32qDoFL4iKBsjKpDyAfaiW4efdTDSAm33sKj'),
    marketEventQueue: new PublicKey(
      'Cta4TEwKCKhSphkMNzXsURVr2V6mozm2SPaV8tCgDPwy'
    ),
  },
}
