import { NAME_PROGRAM_ID } from '@bonfida/spl-name-service'
import { AccountMetaData } from '@solana/spl-governance'
import { Connection, PublicKey } from '@solana/web3.js'

export const NAME_SERVICE_INSTRUCTIONS = {
  [NAME_PROGRAM_ID.toBase58()]: {
    2: {
      name: 'Domain Name Service: Transfer Domain Name',
      accounts: [{ name: 'Domain Name Address' }, { name: 'Treasury Account' }],
      getDataUI: async (
        _connection: Connection,
        data: Uint8Array,
        _accounts: AccountMetaData[]
      ) => {
        const decodedData = new PublicKey(data.slice(1))
        return (
          <>
            <span>New Owner: {decodedData.toBase58()}</span>
          </>
        )
      },
    },
  },
}
