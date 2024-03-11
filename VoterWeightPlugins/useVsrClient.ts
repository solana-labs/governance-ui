import { VSR_PLUGIN_PKS} from '@constants/plugins'
import { useRealmVoterWeightPlugins } from '@hooks/useRealmVoterWeightPlugins'

import {useVoterWeightPluginReadinessReturnType, VoterWeightPluginInfo} from './lib/types'
import {VsrClient} from "../VoteStakeRegistry/sdk/client";

export interface useVsrClientReturnType
  extends useVoterWeightPluginReadinessReturnType {
  vsrClient: VsrClient | undefined
  plugin: VoterWeightPluginInfo | undefined
}

export const useVsrClient = (): useVsrClientReturnType => {
  const { isReady, plugins } = useRealmVoterWeightPlugins()

  const plugin = plugins?.voterWeight.find((plugin) =>
      VSR_PLUGIN_PKS.includes(plugin.programId.toString())
  )

  const isEnabled = plugin !== undefined

  return {
    isReady,
    vsrClient: plugin?.client as VsrClient,
    plugin,
    isEnabled,
  }
}
