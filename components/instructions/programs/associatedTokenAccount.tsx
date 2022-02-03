import { Connection, PublicKey } from '@solana/web3.js'
import { AccountMetaData } from '@solana/spl-governance'
import { SPL_TOKENS } from '@utils/splTokens'

const ATA_PROGRAM_ID = new PublicKey(
  'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL'
)

export const ATA_PROGRAM_INSTRUCTIONS = {
  [ATA_PROGRAM_ID.toBase58()]: {
    name: 'Associated Token Account Program - Create Associated Token Account',
    accounts: [
      'Authority',
      'Associated Account',
      'Token Address',
      'Token Program',
    ],
    getDataUI: (
      _connection: Connection,
      _data: Uint8Array,
      accounts: AccountMetaData[]
    ) => {
      const ata = accounts[1].pubkey.toString()
      const tokenMint = accounts[3].pubkey.toString()

      const tokenName = Object.keys(SPL_TOKENS).reduce((tmp, x) => {
        const { mint, name } = SPL_TOKENS[x]

        if (mint.toString() === tokenMint) {
          return name
        }

        return tmp
      }, 'unknown')

      return (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>New Associated Token Amount Address:</span>
            <span>{ata}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Token Name</span>
            <span>{tokenName}</span>
          </div>
        </div>
      )
    },
  },
}
