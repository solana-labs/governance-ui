import {NFT_PLUGINS_PKS} from '@constants/plugins'
import { useRealmVoterWeightPlugins } from '@hooks/useRealmVoterWeightPlugins'

import { useVoterWeightPluginReadinessReturnType } from './lib/types'
import {NftVoterClient} from "@utils/uiTypes/NftVoterClient";

export interface useNftClientReturnType
  extends useVoterWeightPluginReadinessReturnType {
  nftClient: NftVoterClient | undefined
}

export const useNftClient = (): useNftClientReturnType => {
  const { isReady, plugins } = useRealmVoterWeightPlugins()

  const nftPlugin = plugins?.find((plugin) =>
      NFT_PLUGINS_PKS.includes(plugin.programId.toString())
  )

  const isEnabled = nftPlugin !== undefined

  return {
    isReady,
    nftClient: nftPlugin?.client as NftVoterClient,
    isEnabled,
  }
}
