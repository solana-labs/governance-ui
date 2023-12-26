import useVotePluginsClientStore from 'stores/useVotePluginsClientStore'
import { useRealmConfigQuery } from './queries/realmConfig'
import { useMemo } from 'react'
import { NFT_PLUGINS_PKS } from '@constants/plugins'

export const useNftRegistrarCollection = () => {
  const config = useRealmConfigQuery().data?.result
  const currentPluginPk = config?.account.communityTokenConfig.voterWeightAddin
  const [nftMintRegistrar] = useVotePluginsClientStore((s) => [
    s.state.nftMintRegistrar,
  ])

  return useMemo(
    () =>
      (currentPluginPk && NFT_PLUGINS_PKS.includes(currentPluginPk?.toBase58())
        ? (nftMintRegistrar?.collectionConfigs as any[] | undefined)?.map(
            (x) => x.collection.toBase58() as string
          )
        : undefined) ?? [],
    [currentPluginPk, nftMintRegistrar?.collectionConfigs]
  )
}
