import { Connection, LAMPORTS_PER_SOL } from '@solana/web3.js'
import { AccountMetaData } from '@solana/spl-governance'
import * as BufferLayout from '@solana/buffer-layout'

export const STAKE_INSTRUCTIONS = {
  Stake11111111111111111111111111111111111111: {
    3: {
      name: 'Stake Program - Split',
      accounts: [],
      getDataUI: async (
        _connection: Connection,
        _data: Uint8Array,
        _accounts: AccountMetaData[]
      ) => {
        const { lamports } = BufferLayout.struct<any['Split']>([
          BufferLayout.u32('instruction'),
          BufferLayout.ns64('lamports'),
        ]).decode(Buffer.from(_data))
        const rent = await _connection.getMinimumBalanceForRentExemption(200)
        return (
          <>
            <p>
              Amount: {(lamports - rent) / LAMPORTS_PER_SOL} + rent:{' '}
              {rent / LAMPORTS_PER_SOL} = Total sol amount:{' '}
              {lamports / LAMPORTS_PER_SOL}
            </p>
            <p></p>
          </>
        )
      },
    },
    4: {
      name: 'Stake Program - Withdraw',
      accounts: [],
      getDataUI: async (
        _connection: Connection,
        _data: Uint8Array,
        _accounts: AccountMetaData[]
      ) => {
        const { lamports } = BufferLayout.struct<any['Withdraw']>([
          BufferLayout.u32('instruction'),
          BufferLayout.ns64('lamports'),
        ]).decode(Buffer.from(_data))
        return (
          <>
            <p>Withdraw amount: {lamports / LAMPORTS_PER_SOL}</p>
            <p></p>
          </>
        )
      },
    },
  },
}
