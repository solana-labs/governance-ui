import { Connection, PublicKey } from '@solana/web3.js'
import { fetchRealmByPubkey } from '../realm'
import { getRegistrarPDA } from '@utils/plugin/accounts'
import { Program } from '@coral-xyz/anchor'
import { IDL, NftVoter } from 'idls/nft_voter'
import asFindable from '@utils/queries/asFindable'
import { fetchRealmConfigQuery } from '../realmConfig'
import { useBatchedVoteDelegators } from '@components/VotePanel/useDelegators'
import { useConnection } from '@solana/wallet-adapter-react'
import useSelectedRealmPubkey from '@hooks/selectedRealm/useSelectedRealmPubkey'
import { getNftGovpower } from '../governancePower'
import { useQueries } from '@tanstack/react-query'

export const useNftBatchedVotePower = async (
  role: 'community' | 'council' | undefined
) => {
  const { connection } = useConnection()
  const realmPk = useSelectedRealmPubkey()
  const batchedDelegators = useBatchedVoteDelegators(role)

  const results = useQueries({
    queries:
      realmPk === undefined || batchedDelegators === undefined
        ? []
        : batchedDelegators.map((delegator) => ({
            queryKey: [
              connection.rpcEndpoint,
              realmPk.toString(),
              'NFT vote power (dont cache)',
              delegator.pubkey.toString(),
            ],
            staleTime: 0,
            cacheTime: 0,
            queryFn: () =>
              getNftGovpower(connection, realmPk, delegator.pubkey),
          })),
  })
  const total = results.map((r) => r.data?.toNumber() ?? 0)
  return total
}

export const nftRegistrarQuery = (
  connection: Connection,
  realmPk: PublicKey
) => ({
  queryKey: [
    connection.rpcEndpoint,
    'Nft Plugin Registrar',
    realmPk.toString(),
  ],
  queryFn: async () => {
    const realm = (await fetchRealmByPubkey(connection, realmPk)).result
    if (!realm) throw new Error()

    const config = await fetchRealmConfigQuery(connection, realmPk)
    const programId =
      config.result?.account.communityTokenConfig.voterWeightAddin
    if (programId === undefined)
      return { found: false, result: undefined } as const

    const { registrar: registrarPk } = await getRegistrarPDA(
      realm.pubkey,
      realm.account.communityMint,
      programId
    )

    // use anchor to fetch registrar :-)
    const program = new Program<NftVoter>(IDL, programId, { connection })

    return asFindable(() => program.account.registrar.fetch(registrarPk))()
  },
})
