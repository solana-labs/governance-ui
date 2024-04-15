import { HELIUM_VSR_PLUGINS_PKS} from '@constants/plugins'
import { useRealmVoterWeightPlugins } from '@hooks/useRealmVoterWeightPlugins'

import { useVoterWeightPluginReadinessReturnType } from './lib/types'
import {HeliumVsrClient} from "../HeliumVotePlugin/sdk/client";

export interface useHeliumClientReturnType
  extends useVoterWeightPluginReadinessReturnType {
  heliumClient: HeliumVsrClient | undefined
}

export const useHeliumClient = (): useHeliumClientReturnType => {
  const { isReady, plugins } = useRealmVoterWeightPlugins()

  const heliumPlugin = plugins?.voterWeight.find((plugin) =>
      HELIUM_VSR_PLUGINS_PKS.includes(plugin.programId.toString())
  )

  const isEnabled = heliumPlugin !== undefined

  return {
    isReady,
    heliumClient: heliumPlugin?.client as HeliumVsrClient,
    isEnabled,
  }
}
