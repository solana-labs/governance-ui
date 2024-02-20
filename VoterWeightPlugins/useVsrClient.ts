import { VSR_PLUGIN_PKS} from '@constants/plugins'
import { useRealmVoterWeightPlugins } from '@hooks/useRealmVoterWeightPlugins'

import { useVoterWeightPluginReadinessReturnType } from './lib/types'
import {VsrClient} from "../VoteStakeRegistry/sdk/client";

export interface useVsrClientReturnType
  extends useVoterWeightPluginReadinessReturnType {
  vsrClient: VsrClient | undefined
}

export const useVsrClient = (): useVsrClientReturnType => {
  const { isReady, plugins } = useRealmVoterWeightPlugins()

  const vsrPlugin = plugins?.find((plugin) =>
      VSR_PLUGIN_PKS.includes(plugin.programId.toString())
  )

  const isEnabled = vsrPlugin !== undefined

  return {
    isReady,
    vsrClient: vsrPlugin?.client as VsrClient,
    isEnabled,
  }
}
