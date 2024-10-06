import { PROGRAM_ID as HELIUM_VSR_PROGRAM_ID } from '@helium/voter-stake-registry-sdk'
import { PublicKey } from '@solana/web3.js'
import { DEFAULT_NFT_VOTER_PLUGIN } from '@tools/constants'
import { DRIFT_STAKE_VOTER_PLUGIN } from 'DriftStakeVoterPlugin/constants'
import { TOKEN_HAVER_PLUGIN } from 'TokenHaverPlugin/constants'

export const VSR_PLUGIN_PKS: string[] = [
  '4Q6WW2ouZ6V3iaNm56MTd5n2tnTm4C5fiH8miFHnAFHo',
  'vsr2nfGVNHmSY8uxoBGqq8AQbwz3JwaEaHqGbsTPXqQ',
  'VotEn9AWwTFtJPJSMV5F9jsMY6QwWM5qn3XP9PATGW7',
  'VoteWPk9yyGmkX4U77nEWRJWpcc8kUfrPoghxENpstL',
  'VoteMBhDCqGLRgYpp9o7DGyq81KNmwjXQRAHStjtJsS',
  '5sWzuuYkeWLBdAv3ULrBfqA51zF7Y4rnVzereboNDCPn',
  'HBZ5oXbFBFbr8Krt2oMU7ApHFeukdRS8Rye1f3T66vg5',
]

export const HELIUM_VSR_PLUGINS_PKS: string[] = [
  HELIUM_VSR_PROGRAM_ID.toBase58(),
]

export const NFT_PLUGINS_PKS: string[] = [
  DEFAULT_NFT_VOTER_PLUGIN,
  'GnftV5kLjd67tvHpNGyodwWveEKivz3ZWvvE3Z4xi2iw',
  'GnftVc21v2BRchsRa9dGdrVmJPLZiRHe9j2offnFTZFg', // v2, supporting compressed nft
]

export const GATEWAY_PLUGINS_PKS: string[] = [
  'GgathUhdrCWRHowoRKACjgWhYHfxCEdBi5ViqYN6HVxk',
]

export const QV_PLUGINS_PKS: string[] = [
  'quadCSapU8nTdLg73KHDnmdxKnJQsh7GUbu5tZfnRRr',
]

export const PYTH_PLUGIN_PK: string[] = [
  'pytS9TjG1qyAZypk7n8rw8gfW9sUaqqYyMhJQ4E7JCQ',
]

export const PARCL_PLUGIN_PK: string[] = [
  '2gWf5xLAzZaKX9tQj9vuXsaxTWtzTZDFRn21J3zjNVgu',
]

export const DRIFT_PLUGIN_PK = [DRIFT_STAKE_VOTER_PLUGIN]

export type PluginName =
  | 'gateway'
  | 'QV'
  | 'vanilla'
  | 'VSR'
  | 'HeliumVSR'
  | 'NFT'
  | 'pyth'
  | 'drift'
  | 'token_haver'
  | 'parcl'
  | 'unknown'

export const findPluginName = (programId: PublicKey | undefined): PluginName =>
  programId === undefined
    ? ('vanilla' as const)
    : VSR_PLUGIN_PKS.includes(programId.toString())
    ? ('VSR' as const)
    : HELIUM_VSR_PLUGINS_PKS.includes(programId.toString())
    ? 'HeliumVSR'
    : NFT_PLUGINS_PKS.includes(programId.toString())
    ? 'NFT'
    : GATEWAY_PLUGINS_PKS.includes(programId.toString())
    ? 'gateway'
    : QV_PLUGINS_PKS.includes(programId.toString())
    ? 'QV'
    : PYTH_PLUGIN_PK.includes(programId.toString())
    ? 'pyth'
    : DRIFT_PLUGIN_PK.includes(programId.toString())
    ? 'drift'
    : TOKEN_HAVER_PLUGIN.toString() === programId.toString()
    ? 'token_haver'
    : PARCL_PLUGIN_PK.includes(programId.toString())
    ? 'parcl'
    : 'unknown'

// Used when creating a new realm to choose which voterWeightAddin to use
export const pluginNameToCanonicalProgramId = (
  pluginName: PluginName
): PublicKey | undefined => {
  const lastPk = (arr: string[]) => new PublicKey(arr[arr.length - 1])

  switch (pluginName) {
    case 'VSR':
      return lastPk(VSR_PLUGIN_PKS)
    case 'HeliumVSR':
      return lastPk(HELIUM_VSR_PLUGINS_PKS)
    case 'NFT':
      return lastPk(NFT_PLUGINS_PKS)
    case 'gateway':
      return lastPk(GATEWAY_PLUGINS_PKS)
    case 'QV':
      return lastPk(QV_PLUGINS_PKS)
    case 'pyth':
      return lastPk(PYTH_PLUGIN_PK)
    default:
      return undefined
  }
}
