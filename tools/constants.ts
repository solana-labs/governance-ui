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

export const HOLAPLEX_GRAPQL_URL = 'https://graph.holaplex.com/v1'
