import { QUARRY_ADDRESSES } from '@quarryprotocol/quarry-sdk'
import { PublicKey } from '@solana/web3.js'

export const SABER_UXD_USDC_LP = 'UXD-USDC LP'

export type SupportedMintName = 'UXD-USDC LP'

class QuarryMine {
  public readonly mintWrapperProgram = new PublicKey(
    'QMWoBmAyJLAsA1Lh9ugMTw2gciTihncciphzdNzdZYV'
  )

  public readonly quarryMineProgram = QUARRY_ADDRESSES.Mine

  public readonly mintSpecificAddresses: {
    [key in SupportedMintName]: {
      mint: PublicKey
      mintName: string
      rewardsTokenMintName: string
      rewarder: PublicKey
      mintWrapper: PublicKey
      claimFeeTokenAccount: PublicKey
      rewardsTokenMint: PublicKey
      rewardsTokenMintDecimals: number
      minter: PublicKey
    }
  } = {
    [SABER_UXD_USDC_LP]: {
      mintName: 'Saber UXD-USDC LP',
      rewardsTokenMintName: 'Saber IOU Token',
      mint: new PublicKey('UXDgmqLd1roNYkC4TmJzok61qcM9oKs5foDADiFoCiJ'),
      rewardsTokenMint: new PublicKey(
        'iouQcQBAiEXe6cKLS85zmZxUqaCqBdeHFpqKoSz615u'
      ),
      rewardsTokenMintDecimals: 6,
      rewarder: new PublicKey('rXhAofQCT7NN9TUqigyEAUzV1uLL4boeD8CRkNBSkYk'),
      mintWrapper: new PublicKey(
        'EVVDA3ZiAjTizemLGXNUN3gb6cffQFEYkFjFZokPmUPz'
      ),
      claimFeeTokenAccount: new PublicKey(
        '4Snkea6wv3K6qzDTdyJiF2VTiLPmCoyHJCzAdkdTStBK'
      ),
      minter: new PublicKey('GEoTC3gN12qHDniaDD7Zxvd5xtcZyEKkTPy42B44s82y'),
    },
  }

  public readonly supportedMintNames: {
    [key in SupportedMintName]: true
  } = {
    'UXD-USDC LP': true,
  }

  public readonly quarryMineProgramInstructions = {
    createMiner: 126,
    stakeTokens: 136,
    withdraw: 2,
    claimRewards: 4,
  }
}

export default new QuarryMine()
