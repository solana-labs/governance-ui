import { PublicKey } from '@solana/web3.js'

// Describe what information should be provided for Solend
abstract class ASolendConfiguration {
  abstract get programID(): PublicKey
  abstract get lendingMarket(): PublicKey
  abstract get lendingMarketAuthority()
  abstract get createObligationConfiguration(): {
    lamports: number
    space: number
    seed: string
  }

  abstract getSupportedCollateralMintsInformation(): SupportedCollateralMintsInformation
  abstract getSupportedMintInformation(
    mint: SupportedMintName
  ): SupportedMintInformation
  abstract getReserveOfGivenMints(mintNames: SupportedMintName[]): PublicKey[]
  abstract getSupportedMintNames(): SupportedMintName[]
  abstract getTokenNameByReservePublicKey(
    reserveToFind: PublicKey
  ): string | undefined
}

// Add here new token to support ...
export type SupportedMintName = 'USDC'
export type SupportedCollateralMintNames = 'cUSDC'

type SupportedCollateralMintInformation = {
  name: string
  mint: PublicKey
  decimals: number
}

type SupportedCollateralMintsInformation = {
  [key in SupportedCollateralMintNames]: SupportedCollateralMintInformation
}

type SupportedMintInformation = {
  mint: PublicKey
  relatedCollateralMint: SupportedCollateralMintInformation
  decimals: number
  reserve: PublicKey
  reserveLiquiditySupply: PublicKey
  pythOracle: PublicKey
  switchboardFeedAddress: PublicKey
  reserveCollateralSupplySplTokenAccount: PublicKey
}

type SupportedMintsInformation = {
  [key in SupportedMintName]: SupportedMintInformation
}

class SolendConfiguration implements ASolendConfiguration {
  protected supportedCollateralMintsInformation: SupportedCollateralMintsInformation =
    {
      cUSDC: {
        name: 'Solend Protocol: cUSDC',
        mint: new PublicKey('993dVFL2uXWYeoXuEBFXR4BijeXdTv4s6BzsCjJZuwqk'),
        decimals: 6,
      },
    }

  protected supportedMintsInformation: SupportedMintsInformation = {
    USDC: {
      relatedCollateralMint: this.supportedCollateralMintsInformation.cUSDC,
      mint: new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'),
      decimals: 6,
      reserve: new PublicKey('BgxfHJDzm44T7XG68MYKx7YisTjZu73tVovyZSjJMpmw'),
      reserveLiquiditySupply: new PublicKey(
        '8SheGtsopRUDzdiD6v6BR9a6bqZ9QwywYQY99Fp5meNf'
      ),
      pythOracle: new PublicKey('Gnt27xtC473ZT2Mw5u8wZ68Z3gULkSTb5DuxJy7eJotD'),
      switchboardFeedAddress: new PublicKey(
        'CZx29wKMUxaJDq6aLVQTdViPL754tTR64NAgQBUGxxHb'
      ),
      reserveCollateralSupplySplTokenAccount: new PublicKey(
        'UtRy8gcEu9fCkDuUrU8EmC7Uc6FZy5NCwttzG7i6nkw'
      ),
    },
  }

  public readonly programID = new PublicKey(
    'So1endDq2YkqhipRh3WViPa8hdiSpxWy6z3Z6tMCpAo'
  )

  public readonly lendingMarket = new PublicKey(
    '4UpD2fh7xH3VP9QQaXtsS1YY3bxzWhtfpks7FatyKvdY'
  )

  public readonly lendingMarketAuthority = new PublicKey(
    'DdZR6zRFiUt4S5mg7AV1uKB2z1f1WzcNYCaTEEWPAuby'
  )

  // All of theses numbers are magic numbers we got by looking at Solend documentation & transactions
  public readonly createObligationConfiguration = {
    lamports: 9938880,
    space: 1300,
    seed: this.lendingMarket.toString().slice(0, 32),
  }

  public getSupportedCollateralMintsInformation(): SupportedCollateralMintsInformation {
    return this.supportedCollateralMintsInformation
  }

  public getSupportedMintInformation(
    mintName: SupportedMintName
  ): SupportedMintInformation {
    return this.supportedMintsInformation[mintName]
  }

  public getReserveOfGivenMints(mintNames: SupportedMintName[]): PublicKey[] {
    return mintNames.map(
      (mintName) => this.supportedMintsInformation[mintName].reserve
    )
  }

  public getSupportedMintNames(): SupportedMintName[] {
    return Object.keys(this.supportedMintsInformation) as SupportedMintName[]
  }

  public getTokenNameByReservePublicKey(
    reserveToFind: PublicKey
  ): string | undefined {
    return Object.entries(this.supportedMintsInformation).reduce(
      (tmp, [mintName, { reserve }]) => {
        if (reserveToFind.toString() === reserve.toString()) {
          return mintName
        }

        return tmp
      },
      undefined
    )
  }
}

export default new SolendConfiguration()
