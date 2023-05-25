import { Connection, PublicKey } from '@solana/web3.js'
import { useQuery } from '@tanstack/react-query'
import { getOwnedTokenAccounts, tryGetTokenAccount } from '@utils/tokens'
import queryClient from './queryClient'
import asFindable from '@utils/queries/asFindable'
import { useConnection } from '@solana/wallet-adapter-react'

export const tokenAccountQueryKeys = {
  all: (endpoint: string) => [endpoint, 'TokenAccount'],
  byPubkey: (endpoint: string, k: PublicKey) => [
    ...tokenAccountQueryKeys.all(endpoint),
    k.toString(),
  ],
  byOwner: (endpoint: string, o: PublicKey) => [
    ...tokenAccountQueryKeys.all(endpoint),
    'by Owner',
    o.toString(),
  ],
}

export const useTokenAccountsByOwnerQuery = (pubkey?: PublicKey) => {
  const { connection } = useConnection()

  const enabled = pubkey !== undefined
  const query = useQuery({
    queryKey: enabled
      ? tokenAccountQueryKeys.byOwner(connection.rpcEndpoint, pubkey)
      : undefined,
    queryFn: async () => {
      if (!enabled) throw new Error()
      const results = await getOwnedTokenAccounts(connection, pubkey)

      // since we got the data for these accounts, lets save it
      results.forEach((x) => {
        queryClient.setQueryData(
          tokenAccountQueryKeys.byPubkey(connection.rpcEndpoint, x.publicKey),
          { found: true, result: x }
        )
      })

      return results
    },
    enabled,
  })

  return query
}

export const fetchTokenAccountByPubkey = (
  connection: Connection,
  pubkey: PublicKey
) => {
  return queryClient.fetchQuery({
    queryKey: tokenAccountQueryKeys.byPubkey(connection.rpcEndpoint, pubkey),
    queryFn: () =>
      asFindable((...x: Parameters<typeof tryGetTokenAccount>) =>
        tryGetTokenAccount(...x).then((x) => x?.account)
      )(connection, pubkey),
  })
}
