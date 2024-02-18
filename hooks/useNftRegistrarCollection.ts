import { useRealmConfigQuery } from './queries/realmConfig'
import { useMemo } from 'react'
import { NFT_PLUGINS_PKS } from '@constants/plugins'
import {useNftRegistrar} from "@hooks/useNftRegistrar";

export const useNftRegistrarCollection = () => {
  const config = useRealmConfigQuery().data?.result
  const nftMintRegistrar = useNftRegistrar();
  const currentPluginPk = config?.account.communityTokenConfig.voterWeightAddin

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
