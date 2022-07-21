import BN from 'bn.js'

/**
 * The minimum amount of community tokens to create governance and proposals, for tokens with 0 supply
 */
export const MIN_COMMUNITY_TOKENS_TO_CREATE_W_0_SUPPLY = 1000000

export const MAX_TOKENS_TO_DISABLE = new BN('18446744073709551615')
