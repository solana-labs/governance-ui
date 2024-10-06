import { Connection } from '@solana/web3.js'
import { AccountMetaData } from '@solana/spl-governance'

export const STAKE_SANCTUM_INSTRUCTIONS = {
  SP12tWFxD9oJsVWNavTTBZvMbA6gkAmxtVgxdqvyvhY: {
    9: {
      name: 'Stake Program - Deposit Stake',
      accounts: [
        { name: 'Stake Pool' },
        { name: 'Validator List' },
        { name: 'Deposit Authority' },
        { name: 'Withdraw Authority' },
        { name: 'Deposit Stake' },
        { name: 'Validator Stake' },
        { name: 'Reserve Stake' },
        { name: 'Destination PoolAccount' },
        { name: 'Manager Fee Account' },
        { name: 'Referral Pool Account' },
        { name: 'Pool Mint' },
      ],
      getDataUI: async (
        _connection: Connection,
        _data: Uint8Array,
        _accounts: AccountMetaData[]
      ) => {
        return (
          <>
            <div className="text-orange">
              Check change authority instruction. New authority must match
              deposit authority of pool {_accounts[2].pubkey.toBase58()}
            </div>
          </>
        )
      },
    },
  },
}
