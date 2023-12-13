import { Connection, Keypair } from '@solana/web3.js'
import { useQuery } from '@tanstack/react-query'
import { AnchorProvider } from '@coral-xyz/anchor'
import EmptyWallet from '@utils/Mango/listingTools'
import { MANGO_V4_ID, MangoClient } from '@blockworks-foundation/mango-v4'

export const useMangoClient = (connection: Connection) => {
  const isDevnet = connection.rpcEndpoint.includes('devnet')
  const cluster = isDevnet ? 'devnet' : 'mainnet-beta'

  const query = useQuery({
    queryKey: ['MangoClient', connection.rpcEndpoint],
    queryFn: async () => {
      const options = AnchorProvider.defaultOptions()
      const adminProvider = new AnchorProvider(
        connection,
        new EmptyWallet(Keypair.generate()),
        options
      )
      const client = await MangoClient.connect(
        adminProvider,
        cluster,
        MANGO_V4_ID[cluster]
      )

      return client
    },
  })

  return query
}
