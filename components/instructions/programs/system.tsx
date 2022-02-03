import { Connection, PublicKey } from '@solana/web3.js'
import { AccountMetaData } from '@solana/spl-governance'

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
