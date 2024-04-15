import {NFT_PLUGINS_PKS} from '@constants/plugins'
import { useRealmVoterWeightPlugins } from '@hooks/useRealmVoterWeightPlugins'

import {useVoterWeightPluginReadinessReturnType, VoterWeightPluginInfo} from './lib/types'
import {NftVoterClient} from "@utils/uiTypes/NftVoterClient";

export interface useNftClientReturnType
  extends useVoterWeightPluginReadinessReturnType {
  nftClient: NftVoterClient | undefined
  plugin: VoterWeightPluginInfo | undefined
}

export const useNftClient = (): useNftClientReturnType => {
  const { isReady, plugins } = useRealmVoterWeightPlugins()

  const plugin = plugins?.voterWeight.find((plugin) =>
      NFT_PLUGINS_PKS.includes(plugin.programId.toString())
  )

  const isEnabled = plugin !== undefined

  return {
    isReady,
    nftClient: plugin?.client as NftVoterClient,
    plugin,
    isEnabled,
  }
}
