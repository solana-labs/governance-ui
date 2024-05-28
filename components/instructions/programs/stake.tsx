import { Connection, LAMPORTS_PER_SOL } from '@solana/web3.js'
import { AccountMetaData } from '@solana/spl-governance'
import * as BufferLayout from '@solana/buffer-layout'
import dayjs from 'dayjs'

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
    2: {
      name: 'Stake Program - Delegate',
      accounts: [{ name: 'Stake Account' }, { name: 'Vote Account' }],
      getDataUI: async (
        _connection: Connection,
        _data: Uint8Array,
        _accounts: AccountMetaData[]
      ) => {
        return <></>
      },
    },
    6: {
      name: 'Stake Program - Unlock',
      accounts: [{ name: 'Stake Account' }, { name: 'Vote Account' }],
      getDataUI: async (
        _connection: Connection,
        _data: Uint8Array,
        _accounts: AccountMetaData[]
      ) => {
        try {
          const layout = BufferLayout.struct<any['Unlock']>([
            BufferLayout.u32('instruction'),
            BufferLayout.u8('hasUnixTimestamp'),
            BufferLayout.ns64('unixTimestamp'),
            BufferLayout.u8('hasEpoch'),
            //add epoch field if needed
            BufferLayout.u8('hasCustodian'),
            //add custodian field if needed
          ])
          // decode
          const data = layout.decode(Buffer.from(_data))
          const accData = await _connection.getParsedAccountInfo(
            _accounts[0].pubkey
          )
          const stakeMeta = accData.value?.data['parsed'].info.meta
          return (
            <>
              <div className="mb-3">
                <div>Staker: {stakeMeta.authorized.staker}</div>
                <div>Withdraw authority: {stakeMeta.authorized.staker}</div>
                <div>Lockup authority: {stakeMeta.lockup.custodian}</div>
              </div>
              <div>
                Unlock date:{' '}
                {dayjs.unix(data.unixTimestamp).format('DD-MM-YYYY HH:mm')}
              </div>
              {(data.hasEpoch !== 0 || data.hasCustodian !== 0) && (
                <div className="text-red mt-3">
                  Warning! detected epoch or custodian change
                </div>
              )}
            </>
          )
        } catch (e) {
          return <></>
        }
      },
    },
  },
}
