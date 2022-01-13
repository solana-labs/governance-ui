import { Connection } from '@solana/web3.js'
import { nu64, struct, u8 } from 'buffer-layout'
import { AccountMetaData } from '@solana/spl-governance'
import { fmtMintAmount } from '../../../tools/sdk/units'
import { tryGetTokenMint } from '../../../utils/tokens'

const RAYDIUM_AMM_INSTRUCTIONS = {
  '675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8': {
    3: {
      name: 'Raydium: Add Liquidity',
      accounts: [
        { name: 'Token Program' },
        { name: 'ammId' },
        { name: 'ammAuthority' },
        { name: 'ammOpenOrders' },
        { name: 'ammTargetOrders' },
        { name: 'lpMintAddress' },
        { name: 'poolCoinTokenAccount' },
        { name: 'poolPcTokenAccount' },
        { name: 'serumMarket' },
        { name: 'userCoinTokenAccount' },
        { name: 'userPcTokenAccount' },
        { name: 'userLpTokenAccount' },
        { name: 'userOwner' },
      ],
      getDataUI: async (
        connection: Connection,
        data: Uint8Array,
        accounts: AccountMetaData[]
      ) => {
        const poolCoinMint = await tryGetTokenMint(
          connection,
          accounts[6].pubkey // poolCoinTokenAccount
        )

        const poolPcMint = await tryGetTokenMint(
          connection,
          accounts[7].pubkey // poolPcTokenAccount
        )

        const dataLayout = struct([
          u8('instruction'),
          nu64('maxCoinAmount'),
          nu64('maxPcAmount'),
          nu64('fixedFromCoin'),
        ])

        const args = dataLayout.decode(Buffer.from(data)) as any

        return (
          <>
            <p>
              maxCoinAmount:{' '}
              {fmtMintAmount(poolCoinMint?.account, args.maxCoinAmount)}
            </p>
            <p>
              maxPcAmount:{' '}
              {fmtMintAmount(poolPcMint?.account, args.maxPcAmount)}
            </p>
            <p>fixedFromCoin: {args.fixedFromCoin}</p>
          </>
        )
      },
    },
  },
}
const RAYDIUM_STAKING_INSTRUCTIONS = {
  EhhTKczWMGQt46ynNeRX1WfeagwwJd7ufHvCDjRxjo5Q: {
    1: {
      name: 'Raydium: Deposit',
      accounts: [
        { name: 'poolId' },
        { name: 'poolAuthority' },
        { name: 'userInfoAccount' },
        { name: 'userOwner' },
        { name: 'userLpTokenAccount' },
        { name: 'poolLpTokenAccount' },
        { name: 'userRewardTokenAccount' },
        { name: 'poolRewardTokenAccount' },
        { name: 'Sysvar: Clock' },
        { name: 'Token Program' },
        { name: 'userRewardTokenAccountB' },
        { name: 'poolRewardTokenAccountB' },
      ],
      getDataUI: async (
        connection: Connection,
        data: Uint8Array,
        accounts: AccountMetaData[]
      ) => {
        const lpTokenMint = await tryGetTokenMint(
          connection,
          accounts[4].pubkey // userLpTokenAccount
        )
        const dataLayout = struct([u8('instruction'), nu64('amount')])

        const args = dataLayout.decode(Buffer.from(data)) as any

        return (
          <>
            <p>amount: {fmtMintAmount(lpTokenMint?.account, args.amount)}</p>
          </>
        )
      },
    },
  },
}

export const RAYDIUM_INSTRUCTIONS = {
  ...RAYDIUM_STAKING_INSTRUCTIONS,
  ...RAYDIUM_AMM_INSTRUCTIONS,
}
