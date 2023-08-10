import BN from 'bn.js'

/**
 * u64::MAX value used to denote disabled threshold
 */

export const DISABLED_VOTER_WEIGHT = new BN('18446744073709551615')
export const DISABLED_VALUE = new BN('18446744073709551615')

// The wallet can be any existing account for the simulation
// Note: when running a local validator ensure the account is copied from devnet: --clone ENmcpFCpxN1CqyUjuog9yyUVfdXBKF3LVCwLr7grJZpk -ud
export const SIMULATION_WALLET = 'ENmcpFCpxN1CqyUjuog9yyUVfdXBKF3LVCwLr7grJZpk'

export const DEFAULT_NFT_VOTER_PLUGIN =
  'GnftV5kLjd67tvHpNGyodwWveEKivz3ZWvvE3Z4xi2iw'

export const DEFAULT_NFT_VOTER_PLUGIN_V2 =
  'GnftVc21v2BRchsRa9dGdrVmJPLZiRHe9j2offnFTZFg'
