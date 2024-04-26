import { Connection, PublicKey } from '@solana/web3.js'
import { useQuery } from '@tanstack/react-query'
import queryClient from './queryClient'
import asFindable from '@utils/queries/asFindable'
import { useConnection } from '@solana/wallet-adapter-react'
import useWalletOnePointOh from '@hooks/useWalletOnePointOh'
import { AccountInfo, TOKEN_PROGRAM_ID } from '@solana/spl-token'
import { parseTokenAccountData } from '@utils/parseTokenAccountData'

type TokenAccount = AccountInfo

type TokenProgramAccount<T> = {
  publicKey: PublicKey
  account: T
}

async function getOwnedTokenAccounts(
  connection: Connection,
  publicKey: PublicKey
): Promise<TokenProgramAccount<TokenAccount>[]> {
  const result = await connection.getTokenAccountsByOwner(publicKey, {
    programId: TOKEN_PROGRAM_ID,
  })

  return result.value.map((r) => {
    const publicKey = r.pubkey
    const data = Buffer.from(r.account.data)
    const account = parseTokenAccountData(publicKey, data)
    return { publicKey, account }
  })
}

async function tryGetTokenAccount(
  connection: Connection,
  publicKey: PublicKey
): Promise<TokenProgramAccount<TokenAccount> | undefined> {
  try {
    const result = await connection.getAccountInfo(publicKey)

    if (!result?.owner.equals(TOKEN_PROGRAM_ID)) {
      return undefined
    }

    const data = Buffer.from(result!.data)
    const account = parseTokenAccountData(publicKey, data)
    return {
      publicKey,
      account,
    }
  } catch (ex) {
    // This is Try method and is expected to fail and hence logging is uneccesery
    // console.error(`Can't fetch token account ${publicKey?.toBase58()}`, ex)
  }
}

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

export const useTokenAccountsByOwnerQuery = (pubkey: PublicKey | undefined) => {
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
          { found: true, result: x.account }
        )
      })

      return results
    },
    enabled,
  })

  return query
}

export const useTokenAccountByPubkeyQuery = (pubkey: PublicKey | undefined) => {
  const { connection } = useConnection()

  const enabled = pubkey !== undefined
  const query = useQuery({
    queryKey: enabled
      ? tokenAccountQueryKeys.byPubkey(connection.rpcEndpoint, pubkey)
      : undefined,
    queryFn: async () => {
      if (!enabled) throw new Error()
      return asFindable((...x: Parameters<typeof tryGetTokenAccount>) =>
        tryGetTokenAccount(...x).then((x) => x?.account)
      )(connection, pubkey)
    },
    enabled,
  })

  return query
}

export const useUserTokenAccountsQuery = () => {
  const wallet = useWalletOnePointOh()
  const pubkey = wallet?.publicKey ?? undefined
  return useTokenAccountsByOwnerQuery(pubkey)
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
