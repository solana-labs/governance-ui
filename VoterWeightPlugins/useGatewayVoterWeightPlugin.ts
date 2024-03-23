import { GATEWAY_PLUGINS_PKS } from '@constants/plugins'
import { useRealmVoterWeightPlugins } from '@hooks/useRealmVoterWeightPlugins'

import { useVoterWeightPluginReadinessReturnType } from './lib/types'
import { PublicKey } from '@solana/web3.js'
import {GatewayClient} from "@solana/governance-program-library";

export interface useGatewayVoterWeightPluginReturnType
  extends useVoterWeightPluginReadinessReturnType {
  gatekeeperNetwork: PublicKey | undefined
  gatewayClient: GatewayClient
}

type GatewayPluginParams = {
  gatekeeperNetwork: PublicKey | undefined
}

export const useGatewayVoterWeightPlugin = (): useGatewayVoterWeightPluginReturnType => {
  const { isReady, plugins } = useRealmVoterWeightPlugins()

  const gatewayPlugin = plugins?.voterWeight.find((plugin) =>
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
    gatewayClient: gatewayPlugin?.client as GatewayClient,
  }
}
