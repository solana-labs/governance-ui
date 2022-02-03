import { Connection, PublicKey } from '@solana/web3.js'
import { AccountMetaData } from '@solana/spl-governance'
import { BN } from '@project-serum/anchor'
import { getMintDecimalAmountFromNatural } from '@tools/sdk/units'
import { tryGetMint } from '@utils/tokens'
import { WSOL_MINT } from '../tools'
import BufferLayout from 'buffer-layout'

const SYSTEM_PROGRAM_ID = new PublicKey('11111111111111111111111111111111')

const CREATE_ACCOUNT_WITH_SEED_INSTRUCTION_ID = 3

export const SYSTEM_PROGRAM_INSTRUCTIONS = {
  [SYSTEM_PROGRAM_ID.toBase58()]: {
    [CREATE_ACCOUNT_WITH_SEED_INSTRUCTION_ID]: {
      name: 'System Program - Create Account With Seed',
      accounts: [
        'Obligation',
        'Lending Market Account',
        'Obligation Owner',
        'Sysvar: Clock',
        'Rent Program',
        'Token Program',
      ],
      getDataUI: (
        _connection: Connection,
        _data: Uint8Array,
        _accounts: AccountMetaData[]
      ) => {
        return (
          <>
            <p>No data</p>
          </>
        )
      },
    },
  },
}

export const SYSTEM_INSTRUCTIONS = {
  '11111111111111111111111111111111': {
    2: {
      name: 'Sol Transfer',
      accounts: [
        { name: 'Source', important: true },
        { name: 'Destination', important: true },
        { name: 'Authority' },
      ],
      getDataUI: async (connection: Connection, data: Uint8Array) => {
        const tokenMint = await tryGetMint(connection, new PublicKey(WSOL_MINT))

        //@ts-ignore
        const { lamports } = BufferLayout.struct([
          BufferLayout.u32('instruction'),
          BufferLayout.ns64('lamports'),
        ]).decode(Buffer.from(data))

        const rawAmount = new BN(lamports)
        const tokenAmount = tokenMint
          ? getMintDecimalAmountFromNatural(tokenMint.account, rawAmount)
          : rawAmount

        return (
          <>
            {tokenMint ? (
              <div>
                <div>
                  <span>Amount:</span>
                  <span>{`${tokenAmount
                    .toNumber()
                    .toLocaleString()} ${'SOL'}`}</span>
                </div>
              </div>
            ) : (
              <div>{JSON.stringify(data)}</div>
            )}
          </>
        )
      },
    },
    [CREATE_ACCOUNT_WITH_SEED_INSTRUCTION_ID]: {
      name: 'System Program - Create Account With Seed',
      accounts: [
        'Obligation',
        'Lending Market Account',
        'Obligation Owner',
        'Sysvar: Clock',
        'Rent Program',
        'Token Program',
      ],
      getDataUI: (
        _connection: Connection,
        _data: Uint8Array,
        _accounts: AccountMetaData[]
      ) => {
        return (
          <>
            <p>No data</p>
          </>
        )
      },
    },
  },
}
