import { PluginName } from '@constants/plugins'
import {
  GatewayClient,
  QuadraticClient,
} from '@solana/governance-program-library'

import { Provider } from '@coral-xyz/anchor'

// | 'gateway'
// | 'QV'
// | 'vanilla'
// | 'VSR'
// | 'HeliumVSR'
// | 'NFT'
// | 'pyth'
// | 'unknown'

export const loadClient = (plugin: PluginName, provider: Provider) => {
  switch (plugin) {
    case 'QV':
      return QuadraticClient.connect(provider)
    case 'gateway':
      return GatewayClient.connect(provider)
    // TODO: return all clients
    default:
      throw new Error(`Unsupported plugin ${plugin}`)
  }
}
