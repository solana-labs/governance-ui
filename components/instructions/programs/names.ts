import { PublicKey } from '@solana/web3.js'
import { consts as foresightConsts } from '@foresight-tmp/foresight-sdk/'
import {
  LIDO_PROGRAM_ID,
  LIDO_PROGRAM_ID_DEVNET,
} from '@constants/pubkeys/lido'
import { PROGRAM_ID as HELIUM_VSR_PROGRAM_ID } from '@helium/voter-stake-registry-sdk'
import { NAME_PROGRAM_ID } from '@bonfida/spl-name-service'

const GOVERNANCE_PROGRAM_NAMES = {
  GqTPL6qRf5aUuqscLh8Rg2HTxPUXfhhAXDptTLhp1t2J: 'Mango Governance Program',
  FP4PxqHTVzeG2c6eZd7974F9WvKUSdBeduUK3rjYyvBw: 'Mango v4 Program Governance ',
  AVoAYTs36yB5izAaBkxRG67wL1AMwG3vo41hKtUSb8is:
    'Serum Governance Program (Old)',
  G41fmJzd29v7Qmdi8ZyTBBYa98ghh3cwHBTexqCG1PQJ:
    'Serum Governance Program (New)',
  FBcTbv5rLy7MQkkAU2uDzAEjjZDeu2BVLVRJGxyz6hnV:
    'Serum Governance Token Program',
  GTesTBiEWE32WHXXE2S4XbZvA5CrEc4xs6ZgRe895dP: 'Test Governance Program',
  GovER5Lthms3bLBqWub97yVrMmEogzX7xNjdXpPPCVZw: 'Governance Program',
  '5sGZEdn32y8nHax7TxEyoHuPS3UXfPWtisgm8kqxat8H':
    'Phantasia Governance Program',
  smfjietFKFJ4Sbw1cqESBTpPhF4CwbMwN8kBEC1e5ui:
    'Strangemood Foundation Governance Program',
  GovHgfDPyQ1GwazJTDY2avSVY8GGcpmCapmmCsymRaGe: 'PSY DO Governance Program',
  '7e75Nwsz8i5i4NiDa43CNzKJ4AeQGyRimha46VKTM1Ls': 'spl-governance v3 test',
  MGovW65tDhMMcpEmsegpsdgvzb6zUwGsNjhXFxRAnjd: 'MEAN DAO Governance Program',
  GovMaiHfpVPw8BAM1mbdzgmSZYDw2tdP32J2fapoQoYs: 'Marinade Governance Program',
  hgovkRU6Ghe1Qoyb54HdSLdqN7VtxaifBzRmh9jtd3S: 'Helium Governance Program',
}

// Well known program names displayed on the instruction card
const PROGRAM_NAMES = {
  TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA: 'Token Program',
  ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL: 'ATA Program',
  '11111111111111111111111111111111': 'System Program',
  '4MangoMjqJ2firMokCjjGgoK8d4MXcrgL7XJaL3w6fVg': 'Mango v4 Program',
  mv3ekLzLbnVPNxjSKvqBpU3ZeZXPQdEC3bp5MDEBG68: 'Mango v3 Program',
  '9xQeWvG816bUx9EPjHmaT23yvVM2ZWbrrpZb9PusVFin': 'Serum v3 Program',
  DESVgJVGajEgKGXhb6XmqDHGz3VjdgP7rEVESBgxmroY: 'Serum v3 Program (devnet)',

  BPFLoaderUpgradeab1e11111111111111111111111: 'BPF Upgradeable Loader',

  '675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8': 'Raydium AMM Program',
  EhhTKczWMGQt46ynNeRX1WfeagwwJd7ufHvCDjRxjo5Q: 'Raydium Staking Program',

  MarBmsSgKXdrN1egZf5sqe1TMai9K1rChYNDJgjq7aD: 'Marinade Staking Program',

  [LIDO_PROGRAM_ID]: 'Lido Staking Program',
  [LIDO_PROGRAM_ID_DEVNET]: 'Lido Staking Program',

  SysvarRent111111111111111111111111111111111: 'Sysvar: Rent',
  SysvarC1ock11111111111111111111111111111111: 'Sysvar: Clock',
  '4Q6WW2ouZ6V3iaNm56MTd5n2tnTm4C5fiH8miFHnAFHo':
    'Mango Voter Stake Registry Program',
  vsr2nfGVNHmSY8uxoBGqq8AQbwz3JwaEaHqGbsTPXqQ: 'Voter Stake Registry Program',
  VotEn9AWwTFtJPJSMV5F9jsMY6QwWM5qn3XP9PATGW7:
    'PsyDO Voter Stake Registry Program',
  [HELIUM_VSR_PROGRAM_ID.toBase58()]: 'Helium Voter Stake Registry Program',
  VoteWPk9yyGmkX4U77nEWRJWpcc8kUfrPoghxENpstL:
    'Raydium Voter Stake Registry Program',
  VoteMBhDCqGLRgYpp9o7DGyq81KNmwjXQRAHStjtJsS:
    'Marinade Voter Stake Registry Program',
  [foresightConsts.PROGRAM_ID]: 'Foresight Dex',
  [NAME_PROGRAM_ID.toBase58()]: 'Solana Name Service Program',
  AwyKDr1Z5BfdvK3jX1UWopyjsJSV5cq4cuJpoYLofyEn: 'Validator Dao',
  Stake11111111111111111111111111111111111111: 'Stake Program',
  StakeConfig11111111111111111111111111111111: 'Stake Config',
  SysvarStakeHistory1111111111111111111111111: 'Sysvar: Stake History',
  ...GOVERNANCE_PROGRAM_NAMES,
}

const NATIVE_SOLANA_PROGRAMS = {
  //Token
  TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA: '',
  '11111111111111111111111111111111': '',
  BPFLoaderUpgradeab1e11111111111111111111111: '',
  SysvarRent111111111111111111111111111111111: '',
  SysvarC1ock11111111111111111111111111111111: '',
  Stake11111111111111111111111111111111111111: '',
  StakeConfig11111111111111111111111111111111: '',
  SysvarStakeHistory1111111111111111111111111: '',
  Config1111111111111111111111111111111111111: '',
  Vote111111111111111111111111111111111111111: '',
  Ed25519SigVerify111111111111111111111111111: '',
  KeccakSecp256k11111111111111111111111111111: '',
  //ATA
  ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL: '',
  //Token 2022
  TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb: '',
  SwapsVeCiPHMUAtzQWZw7RjsKjgCjhwU55QGu4U1Szw: '',
  LendZqTs7gn5CTSJU1jWKhKuVpjJGom45nnwPb2AMTi: '',
}

export function isNativeSolanaProgram(programId: PublicKey) {
  return typeof NATIVE_SOLANA_PROGRAMS[programId.toBase58()] !== 'undefined'
}

export function getProgramName(programId: PublicKey | string) {
  const key = typeof programId === 'string' ? programId : programId.toBase58()
  return PROGRAM_NAMES[key]
}

export function isGovernanceProgram(programId: PublicKey) {
  return GOVERNANCE_PROGRAM_NAMES[programId.toBase58()]
}
