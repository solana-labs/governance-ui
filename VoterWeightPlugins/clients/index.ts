import { PluginName } from '@constants/plugins'
import {
  Client,
  GatewayClient,
  QuadraticClient,
} from '@solana/governance-program-library'

import { Provider, Wallet } from '@coral-xyz/anchor'
import { PythVoterWeightPluginClient } from './PythVoterWeightPluginClient'
import { ParclVoterWeightPluginClient } from 'ParclVotePlugin/ParclVoterWeightPluginClient'
import { PublicKey } from '@solana/web3.js'
import { VsrClient } from '../../VoteStakeRegistry/sdk/client'
import { NftVoterClient } from '@utils/uiTypes/NftVoterClient'
import { HeliumVsrClient } from '../../HeliumVotePlugin/sdk/client'
import { UnrecognisedVoterWeightPluginClient } from './UnrecognisedVoterWeightPluginClient'
import { DriftVoterClient } from 'DriftStakeVoterPlugin/DriftVoterClient'
import { TokenHaverClient } from 'TokenHaverPlugin/TokenHaverClient'

/**
 * Given a plugin name and program ID, load the appropriate client
 * Note - the program ID is ignored by some clients, but if present, must match the IDL loaded by the client.
 * @param plugin
 * @param programId
 * @param provider
 * @param signer
 */
export const loadClient = (
  plugin: PluginName,
  programId: PublicKey,
  provider: Provider,
  signer: Wallet
): Promise<Client<any>> => {
  switch (plugin) {
    case 'QV':
      return QuadraticClient.connect(provider)
    case 'gateway':
      return GatewayClient.connect(provider)
    case 'pyth':
      return PythVoterWeightPluginClient.connect(provider, undefined, signer)
    case 'VSR':
      return VsrClient.connect(provider, programId)
    case 'HeliumVSR':
      return HeliumVsrClient.connect(provider, programId)
    case 'NFT':
      return NftVoterClient.connect(provider, programId)
    case 'drift':
      return DriftVoterClient.connect(provider, programId)
    case 'token_haver':
      return TokenHaverClient.connect(provider, programId)
    case 'parcl':
      return ParclVoterWeightPluginClient.connect(provider, undefined, signer)
    default:
      return UnrecognisedVoterWeightPluginClient.connect(provider, programId)
  }
}
