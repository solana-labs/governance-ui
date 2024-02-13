import {GATEWAY_PLUGINS_PKS} from "@constants/plugins";
import {useRealmVoterWeightPlugins} from "@hooks/useRealmVoterWeightPlugins";

export interface useGatewayVoterWeightPluginReturnType
  extends useVoterWeightPluginReadinessReturnType {
  gatekeeperNetwork: string
}

// TODO: move to getVotingPlugins when ready
export interface useVoterWeightPluginReadinessReturnType {
  isReady: boolean //defines if the plugin is loading
  isEnabled: boolean //defines if the plugin is enabled in the realm
}

type GatewayPluginParams = {
  gatekeeperNetwork: string
}

export const useGatewayVoterWeightPlugin = (): useGatewayVoterWeightPluginReturnType => {
  const {
    voterWeight,
    plugins,
  } = useRealmVoterWeightPlugins()

  const gatewayPlugin = plugins.find((plugin) => GATEWAY_PLUGINS_PKS.includes(plugin.programId.toString()));

  const isEnabled = gatewayPlugin !== undefined;
  const isReady = voterWeight !== undefined;
  const gatekeeperNetwork = (gatewayPlugin?.params as GatewayPluginParams || undefined)?.gatekeeperNetwork;

  return {
    isReady,
    gatekeeperNetwork,
    isEnabled
  }
}
