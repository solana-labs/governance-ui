import { Connection } from '@solana/web3.js'
import { nu64, struct, u8 } from 'buffer-layout'
import { AccountMetaData } from '@solana/spl-governance'
import { fmtMintAmount } from '../../../tools/sdk/units'
import { tryGetTokenMint } from '../../../utils/tokens'
import {
  DataUIAmount,
  DataUILabel,
  DataUIRow,
  InstructionDataUI,
} from '@components/InstructionDataUI'
import { nativeToUi } from '@blockworks-foundation/mango-client'
import { getMintMetadata } from './splToken'

const RAYDIUM_AMM_INSTRUCTIONS = {
  '675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8': {
    9: {
      name: 'Raydium: Swap Fixed in',
      //
      // Assume we are opening Raydium v4 instruction
      //
      accounts: [
        { name: 'Token Program' },
        { name: 'AMM: ID' },
        { name: 'AMM: Authority' },
        { name: 'AMM: Open Orders' },
        { name: 'AMM: Target Orders' },
        { name: 'AMM: Base Vault' },
        { name: 'AMM: Quote Vault' },
        { name: 'Serum: Market Program ID' },
        { name: 'Serum: Market ID' },
        { name: 'Serum: Market Bids' },
        { name: 'Serum: Market Asks' },
        { name: 'Serum: Market Event Queue' },
        { name: 'Serum: Market Base Vault' },
        { name: 'Serum: Market Quote Vault' },
        { name: 'Serum: Market Authority' },
        { name: 'User: Token Account In' },
        { name: 'User: Token Account Out' },
        { name: 'User' },
      ],
      getDataUI: async (
        connection: Connection,
        data: Uint8Array,
        accounts: AccountMetaData[]
      ) => {
        const [mintIn, mintOut] = await Promise.all([
          tryGetTokenMint(
            connection,
            accounts[15].pubkey // tokenAccountIn
          ),
          tryGetTokenMint(
            connection,
            accounts[16].pubkey // tokenAccountOut
          ),
        ])

        if (!mintIn || !mintOut) {
          throw new Error('Cannot load mint information')
        }

        const [mintInMetadata, mintOutMetadata] = await Promise.all([
          getMintMetadata(mintIn.publicKey),
          getMintMetadata(mintOut.publicKey),
        ])

        const dataLayout = struct([
          u8('instruction'),
          nu64('amountIn'),
          nu64('minAmountOut'),
        ])

        const { amountIn, minAmountOut } = dataLayout.decode(
          Buffer.from(data)
        ) as any

        return (
          <InstructionDataUI>
            <DataUIRow>
              <DataUILabel label="Amount In" />
              <DataUIAmount
                amount={nativeToUi(amountIn, mintIn.account.decimals)}
                symbol={mintInMetadata.name ?? ''}
              />
            </DataUIRow>
            <DataUIRow>
              <DataUILabel label="Minimum Amount Out" />
              <DataUIAmount
                amount={nativeToUi(minAmountOut, mintOut.account.decimals)}
                symbol={mintOutMetadata.name ?? ''}
              />
            </DataUIRow>
          </InstructionDataUI>
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
