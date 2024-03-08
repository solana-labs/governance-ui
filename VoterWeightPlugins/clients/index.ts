import { PluginName } from '@constants/plugins'
import {
  Client,
  GatewayClient,
  QuadraticClient,
} from '@solana/governance-program-library'

import { Provider } from '@coral-xyz/anchor'
import { PythVoterWeightPluginClient } from './PythVoterWeightPluginClient'
import { PublicKey } from '@solana/web3.js'
import { VsrClient } from '../../VoteStakeRegistry/sdk/client'
import { NftVoterClient } from '@utils/uiTypes/NftVoterClient'
import { HeliumVsrClient } from '../../HeliumVotePlugin/sdk/client'
import { DriftVoterClient } from 'DriftStakeVoterPlugin/DriftVoterClient'

/**
 * Given a plugin name and program ID, load the appropriate client
 * Note - the program ID is ignored by some clients, but if present, must match the IDL loaded by the client.
 * @param plugin
 * @param programId
 * @param provider
 */
export const loadClient = (
  plugin: PluginName,
  programId: PublicKey,
  provider: Provider
): Promise<Client<any>> => {
  switch (plugin) {
    case 'QV':
      return QuadraticClient.connect(provider)
    case 'gateway':
      return GatewayClient.connect(provider)
    case 'pyth':
      return PythVoterWeightPluginClient.connect(provider)
    case 'VSR':
      return VsrClient.connect(provider, programId)
    case 'HeliumVSR':
      return HeliumVsrClient.connect(provider, programId)
    case 'NFT':
      return NftVoterClient.connect(provider, programId)
    case 'drift':
      return DriftVoterClient.connect(provider, programId)
    default:
      throw new Error(`Unsupported plugin ${plugin}`)
  }
}
