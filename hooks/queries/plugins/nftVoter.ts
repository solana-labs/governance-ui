import {Connection, PublicKey} from '@solana/web3.js'
import {fetchRealmByPubkey} from '../realm'
import { getRegistrarPDA } from '@utils/plugin/accounts'
import { Program} from '@coral-xyz/anchor'
import { IDL, NftVoter } from 'idls/nft_voter'
import asFindable from '@utils/queries/asFindable'
import { fetchRealmConfigQuery } from '../realmConfig'
import { useBatchedVoteDelegators } from '@components/VotePanel/useDelegators'
import { useConnection } from '@solana/wallet-adapter-react'
import useSelectedRealmPubkey from '@hooks/selectedRealm/useSelectedRealmPubkey'
import { getNftGovpower } from '../governancePower'
import { useQueries } from '@tanstack/react-query'
import {
  fetchDigitalAssetsByOwner,
  useDigitalAssetsByOwner,
} from '../digitalAssets'
import { useMemo } from 'react'
import { ON_NFT_VOTER_V2 } from '@constants/flags'
import { NFT_PLUGINS_PKS } from '@constants/plugins'
import { getNetworkFromEndpoint } from '@utils/connection'
import {useNftRegistrar} from "@hooks/useNftRegistrar";
import {getPluginRegistrarClientCached} from "@hooks/queries/pluginRegistrar";

export const useVotingNfts = (ownerPk: PublicKey | undefined) => {
  const registrar = useNftRegistrar();
  const { data: nfts } = useDigitalAssetsByOwner(ownerPk)
  console.log('nfts', nfts)

  const usedCollectionsPks = useMemo(
    () => registrar?.collectionConfigs.map((x) => x.collection.toBase58()),
    [registrar?.collectionConfigs]
  )

  const votingNfts = nfts?.filter((nft) => {
    const collection = nft.grouping.find((x) => x.group_key === 'collection')
    return (
      (ON_NFT_VOTER_V2 || !nft.compression.compressed) &&
      collection &&
      usedCollectionsPks?.includes(collection.group_value) &&
      nft.creators?.filter((x) => x.verified).length > 0
    )
  })

  return votingNfts
}

export const getVotingNfts = async (
  connection: Connection,
  realmPk: PublicKey,
  ownerPk: PublicKey
) => {
  const realm = fetchRealmByPubkey(connection, realmPk)
  if (realm === undefined) throw new Error()
  const config = await fetchRealmConfigQuery(connection, realmPk)
  if (config.result === undefined) throw new Error()
  const registrar = await getPluginRegistrarClientCached<NftVoter>(realmPk, connection, ownerPk, 'NFT');
  if (registrar === undefined) throw new Error()
  const usedCollectionsPks = registrar.collectionConfigs.map((x) =>
    x.collection.toBase58()
  )
  const network = getNetworkFromEndpoint(connection.rpcEndpoint) as any
  const nfts = await fetchDigitalAssetsByOwner(network, ownerPk)

  const votingNfts = nfts?.filter((nft) => {
    const collection = nft.grouping.find((x) => x.group_key === 'collection')
    return (
      (ON_NFT_VOTER_V2 || !nft.compression.compressed) &&
      collection &&
      usedCollectionsPks?.includes(collection.group_value) &&
      nft.creators?.filter((x) => x.verified).length > 0
    )
  })
  return votingNfts
}

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

// @deprecated - Use useNftClient().plugin.registrar instead to support chaining.
// Outside of react, use getPluginRegistrarClientCached instead.
export const nftRegistrarQuery = (
  connection: Connection,
  realmPk: PublicKey | undefined
) => ({
  queryKey: realmPk && [
    connection.rpcEndpoint,
    'Nft Plugin Registrar',
    realmPk.toString(),
  ],
  enabled: realmPk !== undefined,
  queryFn: async () => {
    if (realmPk === undefined) throw new Error()
    const realm = (await fetchRealmByPubkey(connection, realmPk)).result
    if (!realm) throw new Error()

    const config = await fetchRealmConfigQuery(connection, realmPk)
    const programId =
      config.result?.account.communityTokenConfig.voterWeightAddin
    if (
      programId === undefined ||
      !NFT_PLUGINS_PKS.includes(programId.toString())
    )
      return { found: false, result: undefined } as const

    const { registrar: registrarPk } = getRegistrarPDA(
        realm.pubkey,
        realm.account.communityMint,
        programId
    )

    // use anchor to fetch registrar :-)
    const program = new Program<NftVoter>(IDL, programId, { connection })

    return asFindable(() => program.account.registrar.fetch(registrarPk))()
  },
})
