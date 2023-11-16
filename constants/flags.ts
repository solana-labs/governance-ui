import { findPluginName } from './plugins'

export const SUPPORT_CNFTS = true
export const ON_NFT_VOTER_V2 = false
export const SHOW_DELEGATORS_LIST = false

export const DELEGATOR_BATCH_VOTE_SUPPORT_BY_PLUGIN: Record<
  ReturnType<typeof findPluginName>,
  boolean
> = {
  vanilla: true,
  VSR: false,
  HeliumVSR: false,
  gateway: false,
  NFT: false,
  pyth: false,
  unknown: false,
}
