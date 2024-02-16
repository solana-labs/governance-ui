import { PluginName } from '@constants/plugins'
import {
  Client,
  GatewayClient,
  QuadraticClient,
} from '@solana/governance-program-library'

import {Provider} from '@coral-xyz/anchor'
import {PythVoterWeightPluginClient} from "./PythVoterWeightPluginClient";
import {VsrPluginClient} from "./VsrPluginClient";
import {PublicKey} from "@solana/web3.js";
import {HeliumVsrPluginClient} from "./HeliumVsrPluginClient";
import {NftVoterWeightPluginClient} from "./NftVoterWeightPluginClient";

// | 'gateway'
// | 'QV'
// | 'vanilla'
// | 'VSR'
// | 'HeliumVSR'
// | 'NFT'
// | 'pyth'
// | 'unknown'

/**
 * Given a plugin name and program ID, load the appropriate client
 * Note - the program ID is ignored by some clients, but if present, must match the IDL loaded by the client.
 * @param plugin
 * @param programId
 * @param provider
 */
export const loadClient = (plugin: PluginName, programId: PublicKey, provider: Provider): Promise<Client<any>> => {
  switch (plugin) {
    case 'QV':
      return QuadraticClient.connect(provider)
    case 'gateway':
      return GatewayClient.connect(provider)
    case 'pyth':
      return PythVoterWeightPluginClient.connect(provider)
    case 'VSR':
      return VsrPluginClient.connect(provider, programId)
    case 'HeliumVSR':
      return HeliumVsrPluginClient.connect(provider, programId)
    case 'NFT':
      return NftVoterWeightPluginClient.connect(provider, programId)
    default:
      throw new Error(`Unsupported plugin ${plugin}`)
  }
}
