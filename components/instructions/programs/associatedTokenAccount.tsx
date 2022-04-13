import { Connection } from '@solana/web3.js'
import { AccountMetaData } from '@solana/spl-governance'
import { SPL_TOKENS } from '@utils/splTokens'
import { SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID } from '@utils/associated'

export const ATA_PROGRAM_INSTRUCTIONS = {
  [SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID.toBase58()]: {
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
      const tokenName =
        SPL_TOKENS[
          Object.keys(SPL_TOKENS).find(
            (name) => SPL_TOKENS[name].mint?.toString() === tokenMint
          )!
        ].name ?? 'unknown'

      return (
        <div className="flex flex-col">
          <div className="flex justify-between">
            <span>New Associated Token Amount Address:</span>
            <span>{ata}</span>
          </div>
          <div className="flex justify-between">
            <span>Token Name</span>
            <span>{tokenName}</span>
          </div>
        </div>
      )
    },
  },
}
