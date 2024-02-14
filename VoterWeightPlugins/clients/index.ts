import { PluginName } from '@constants/plugins'
import {
  Client,
  GatewayClient,
  QuadraticClient,
} from '@solana/governance-program-library'

import {Provider} from '@coral-xyz/anchor'
import {PythVoterWeightPluginClient} from "./PythVoterWeightPluginClient";

// | 'gateway'
// | 'QV'
// | 'vanilla'
// | 'VSR'
// | 'HeliumVSR'
// | 'NFT'
// | 'pyth'
// | 'unknown'

export const loadClient = (plugin: PluginName, provider: Provider): Promise<Client<any>> => {
  switch (plugin) {
    case 'QV':
      return QuadraticClient.connect(provider)
    case 'gateway':
      return GatewayClient.connect(provider)
    case 'pyth':
      return PythVoterWeightPluginClient.connect(provider)
    // TODO: return all clients
    default:
      throw new Error(`Unsupported plugin ${plugin}`)
  }
}
