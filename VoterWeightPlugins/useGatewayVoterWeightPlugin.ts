import { GATEWAY_PLUGINS_PKS } from '@constants/plugins'
import { useRealmVoterWeightPlugins } from '@hooks/useRealmVoterWeightPlugins'
import { useVoterWeightPluginReadinessReturnType } from './useVoterWeightPlugins'

export interface useGatewayVoterWeightPluginReturnType
  extends useVoterWeightPluginReadinessReturnType {
  gatekeeperNetwork: string
}

type GatewayPluginParams = {
  gatekeeperNetwork: string
}

export const useGatewayVoterWeightPlugin = (): useGatewayVoterWeightPluginReturnType => {
  const { isReady, plugins } = useRealmVoterWeightPlugins()

  const gatewayPlugin = plugins?.find((plugin) =>
    GATEWAY_PLUGINS_PKS.includes(plugin.programId.toString())
  )

  const isEnabled = gatewayPlugin !== undefined
  const gatekeeperNetwork = (
    (gatewayPlugin?.params as GatewayPluginParams) || undefined
  )?.gatekeeperNetwork

  return {
    isReady,
    gatekeeperNetwork,
    isEnabled,
  }
}
