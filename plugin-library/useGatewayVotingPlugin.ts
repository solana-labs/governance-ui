import { PluginData } from './getPlugins'
import { usePlugins, usePluginsArgs } from './usePlugins'

export interface useGatewayVotingPluginReturnType
  extends useVotingPluginReturnType {
  gatekeeperNetwork: string
}

// TODO: move to getVotingPlugins when ready
export interface useVotingPluginReturnType {
  isReady: boolean //defines if the plugin is loading
  isEnabled: boolean //defines if the plugin is enabled in the realm
  data: PluginData //defines the plugin data
}

export const useGatewayVotingPlugin = ({
  realmPublicKey,
  governanceMintPublicKey,
  walletPublicKey,
}: usePluginsArgs): useGatewayVotingPluginReturnType => {
  const {
    // isReady,
    // getPluginData,
    // isPluginEnabled,
    plugins,
  } = usePlugins({
    realmPublicKey,
    governanceMintPublicKey,
    walletPublicKey,
  })

  // const gatekeeperNetwork = getPluginData('gateway').gatekeeperNetwork

  return {
    isReady: true,
    gatekeeperNetwork: '',
    isEnabled: true, // isPluginEnabled(PluginName.GATEWAY),
    data: {} as PluginData, // getPluginData('quadraticVoting'),
  }
}
