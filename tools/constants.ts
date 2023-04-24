import BN from 'bn.js'

/**
 * The minimum amount of community tokens to create governance and proposals, for tokens with 0 supply
 * Note: This is deprectaed value and should not be used any longer
 */
export const MIN_COMMUNITY_TOKENS_TO_CREATE_W_0_SUPPLY = 1000000

/**
 * u64::MAX value used to denote disabled threshold
 */

export const DISABLED_VOTER_WEIGHT = new BN('18446744073709551615')
export const DISABLED_VALUE = new BN('18446744073709551615')

// The wallet can be any existing account for the simulation
// Note: when running a local validator ensure the account is copied from devnet: --clone ENmcpFCpxN1CqyUjuog9yyUVfdXBKF3LVCwLr7grJZpk -ud
export const SIMULATION_WALLET = 'ENmcpFCpxN1CqyUjuog9yyUVfdXBKF3LVCwLr7grJZpk'

export const DEFAULT_NFT_VOTER_PLUGIN =
  'CcequAbR1TT7N4VFzLo45bXVSPBStoBVHMGwy4gAvAEF'
