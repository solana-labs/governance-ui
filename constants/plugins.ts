import { SWITCHBOARD_ADDIN_ID } from 'SwitchboardVotePlugin/SwitchboardQueueVoterClient'
import { STAKING_ADDRESS as PYTH_STAKING_ADDRESS } from 'pyth-staking-api'
import * as heliumVsrSdk from '@helium/voter-stake-registry-sdk'
import { DEFAULT_NFT_VOTER_PLUGIN } from '@tools/constants'

export const VSR_PLUGIN_PKS: string[] = [
  '4Q6WW2ouZ6V3iaNm56MTd5n2tnTm4C5fiH8miFHnAFHo',
  'vsr2nfGVNHmSY8uxoBGqq8AQbwz3JwaEaHqGbsTPXqQ',
  'VotEn9AWwTFtJPJSMV5F9jsMY6QwWM5qn3XP9PATGW7',
  'VoteWPk9yyGmkX4U77nEWRJWpcc8kUfrPoghxENpstL',
  'VoteMBhDCqGLRgYpp9o7DGyq81KNmwjXQRAHStjtJsS',
]

export const HELIUM_VSR_PLUGINS_PKS: string[] = [
  heliumVsrSdk.PROGRAM_ID.toBase58(),
]

export const NFT_PLUGINS_PKS: string[] = [
  DEFAULT_NFT_VOTER_PLUGIN,
  'GnftV5kLjd67tvHpNGyodwWveEKivz3ZWvvE3Z4xi2iw',
]

export const GATEWAY_PLUGINS_PKS: string[] = [
  'Ggatr3wgDLySEwA2qEjt1oiw4BUzp5yMLJyz21919dq6',
  'GgathUhdrCWRHowoRKACjgWhYHfxCEdBi5ViqYN6HVxk', // v2, supporting composition
]

export const SWITCHBOARD_PLUGINS_PKS: string[] = [
  SWITCHBOARD_ADDIN_ID.toBase58(),
]

export const PYTH_PLUGINS_PKS: string[] = [PYTH_STAKING_ADDRESS.toBase58()]
