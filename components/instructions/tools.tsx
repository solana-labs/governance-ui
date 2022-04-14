import {
  Connection,
  PublicKey,
  // TransactionInstruction,
  // Account,
  // Transaction,
} from '@solana/web3.js'
import { AccountMetaData, InstructionData } from '@solana/spl-governance'

import { BPF_UPGRADEABLE_LOADER_INSTRUCTIONS } from './programs/bpfUpgradeableLoader'
import { GOVERNANCE_INSTRUCTIONS } from './programs/governance'
import { MANGO_INSTRUCTIONS } from './programs/mango'
import { getProgramName, isGovernanceProgram } from './programs/names'
import { RAYDIUM_INSTRUCTIONS } from './programs/raydium'
import { SPL_TOKEN_INSTRUCTIONS } from './programs/splToken'
import { SYSTEM_INSTRUCTIONS } from './programs/system'
import { VOTE_STAKE_REGISTRY_INSTRUCTIONS } from './programs/voteStakeRegistry'
import { MARINADE_INSTRUCTIONS } from './programs/marinade'
import { SOLEND_PROGRAM_INSTRUCTIONS } from './programs/solend'
import { ATA_PROGRAM_INSTRUCTIONS } from './programs/associatedTokenAccount'
import { ConnectionContext } from '@utils/connection'
import { NFT_VOTER_INSTRUCTIONS } from './programs/nftVotingClient'
/**
 * Default governance program id instance
 */
export const DEFAULT_GOVERNANCE_PROGRAM_ID =
  'GovER5Lthms3bLBqWub97yVrMmEogzX7xNjdXpPPCVZw'

/**
 * Default TEST governance program id instance
 */
export const DEFAULT_TEST_GOVERNANCE_PROGRAM_ID =
  'GTesTBiEWE32WHXXE2S4XbZvA5CrEc4xs6ZgRe895dP'

// Well known account names displayed on the instruction card
export const ACCOUNT_NAMES = {
  AQeo6r6jdwnmf48AMejgoKdUGtV8qzbVJH42Gb5sWdi: 'Deprecated: Mango IDO program',
  '9pDEi3yT9ooT1uw1PApQDYK65advJs4Nt65EJG1m59Yq':
    'Mango Developer Council Mint',

  Guiwem4qBivtkSFrxZAEfuthBz6YuWyCwS4G3fjBYu5Z: 'Mango DAO MNGO Treasury Vault',
  '9RGoboEjmaAjSCXsKi6p6zJucnwF3Eg5NUN9jPS6ziL3': 'Mango DAO MNGO Treasury',
  '4PdEyhrV3gaUj4ffwjKGXBLo42jF2CQCCBoXenwCRWXf':
    'Mango DAO USDC Treasury Vault',
  '65u1A86RC2U6whcHeD2mRG1tXCSmH2GsiktmEFQmzZgq': 'Mango DAO USDC Treasury',
  '4WQSYg21RrJNYhF4251XFpoy1uYbMHcMfZNLMXA3x5Mp':
    'Mango DAO Voter Stake Registry Registrar',
  DPiH3H3c7t47BMxqTxLsuPQpEC6Kne8GA9VXbxpnZxFE: 'Mango DAO Governance Realm',
  '7Sn4TN4ZkMghVBAhZ88UkyzXoYkMScaE6qtk9eWV3rJz':
    'Mango DAO Governance Program',
  '59BEyxwrFpt3x4sZ7TcXC3bHx3seGfqGkATcDx6siLWy':
    'Mango v3 Insurance Fund Vault',
  '9qFV99WD5TKnpYw8w3xz3mgMBR5anoSZo2BynrGmNZqY': 'Mango v3 Revenue Vault',
  '6GX2brfV7byA8bCurwgcqiGxNEgzjUmdYgarYZZr2MKe': 'Mango v3 Revenue Vault',
  CF8sDcPztLDkvnEbYnCaXiDxhUpZ2uKLStpmFfRDNxSd:
    'Mango v3 BTC-PERP Incentive Vault',
  '7Gm5zF6FNJpyhqdwKcEdMQw3r5YzitYUGVDKYMPT1cMy': 'Mango V3 Admin Key',
  MangoCzJ36AjZyKwVj3VnYU4GTonjfVEnJmvvWaxLac: 'MNGO Token Mint',
  EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v: 'USDC Token Mint',

  MyHd6a7HWKTMeJMHBkrbMq4hZwZxwn9x7dxXcopQ4Wd: 'OMH Token',
  '2A7UgheVhmoQqXBAQyG1wCoMpooPuiUf2DK6XFiQTtbG': 'OMH Mint Governance',

  // Metaplex Foundation
  Cmtpx4jmkc9ShvWub4hcAvCqrqvWRpWW9eLUdruyZAN8:
    'Metaplex Foundation Council Mint',
  '2yf8YggL4cUhCygoppFMWWeBuJtmLQE9oHkiiUnXP1uM':
    'Metaplex Foundation Council Mint Governance',
  mtpXxYKnxwJJReD3PiZ1NLCfbMkHgNcJeGsdXFTfoBk:
    'Metaplex Foundation Community Mint',
  '2ZxVbyU35dqtMHgLbZZPoGURf2XuPVmSgmVHY8bTfiMC':
    'Metaplex Foundation Community Mint Governance',

  // Metaplex Genesis
  CMPxgYJPXRA8BRfC41uvv6YvpQwtFvLeV9PXjSLpNhYq: 'Metaplex Genesis Council Mint',
  '68NxN1Vo2TLhA3H33yBjwQE5D5UxqB2iL1HL4dgHyF66':
    'Metaplex Genesis Council Mint Governance',
  mpXGnkKdGs1eRZPKkBQ3GW5G4LsVgcX4RzGa5WPo67v:
    'Metaplex Genesis Community Mint',
  '4A9WiAZyXpBBEYaBv3UNQCKTqmDth7fukGnBoprLLH2i':
    'Metaplex Genesis Community Mint Governance',

  Cfafd52FfHRA5FRkTXmMNyHZfhNkbaHpZ12ggmeTVEMw:
    'Friends and Family Council Mint',
  FAFDfoUkaxoMqiNur9F1iigdBNrXFf4uNmS5XrhMewvf:
    'Friends and Family Community Mint',

  // GM DAO
  '7WbRWL33mM3pbFLvuqNjBztihQtHWWFPGr4HLHyqViG9': 'Team funds',
  DWhnQm42vCBLkA9RsrBB2spyR3uAJq1BGeroyNMKgnEh: 'Marketing funds',

  // GSAIL
  '39J1sWHCJgWab8pn6zpTqFCYRXTYVqbEkpLimrq8kTYJ':
    'GSAIL VAULT 2022-2026 VESTING SCHEDULE',
  GAMpPYx4DcJdPhnr7sM84gxym4NiNpzo4G6WufpRLemP: 'GSAIL TREASURY VAULT',

  // Marinade DAO
  B7ux5n2LYxJhS2TsMAcE98eMbkY3dBHUWyrZPBnDmMT5: 'MNDE Treasury',
  GewCM8ipoPnEraZZqEp6VgVPLZfxr8xwJREmidXVU1EH: 'mSOL Treasury',

  // MonkOG DAO
  CVuCjHrqj97fSTsnSKzEBVPeYzXEEv6uiRjzBLRvnouj: 'MonkOG DAO Treasury Vault',

  // MMCC ClubDAO
  '92tozWPkbybEjPeiGpNFL8onAnT739cxLRQofGVnrmm6': 'ClubDAO DCF Revenue Vault',
  A6HXL3WMWT4gB1QvYJfZgDp2ufTfLkWBaX6Theakdf5h:
    'ClubDAO Main SOL Treasury Vault',
  '9UbiR69cKVVtQEejb5pzwSNJFrtr7pjRoygGaBBjUtpR': 'ClubDAO RB Revenue Vault',
  Dn1G2mh9VdZg9VoX62i545domg25Jbvx7VwuiXNyV6Qe:
    'ClubDAO Main NFT Treasury Vault',

  //MonkeDAO
  Cb4uLreZRcb7kbu6gbsGJp2xjnU5K25MDZbvFknBFyqU: 'ClubDAO NMBC Royalties Vault',
  '9Z6x8sVq78saCddcveTSmQWFHCS9vaMS7eoeQMrGMUXw': 'Luna Holdings',
  DKdBj8KF9sieWq2XWkZVnRPyDrw9PwAHinkCMvjAkRdZ: "MonkeDAO NFT's",
  EdNP7sERADU525E9bov6YdfL3oK3idnRTMdKUh2J7FCM:
    'SMB SOL Royalty Treasury Holdings',
  '5bAHkmagXYJzjzxYPDht7AVZRxjiJ6r12NQU3L67bkTr': 'SMB USDC Royalty Holdings',
  CYLSMKuMiDFNg4eDrZdaaWYCJedsLMAEQgUCtnoUq4n1:
    'Primary USDC Treasury Holdings',
  '2qhApGpizKoCyw45oho8Z4F7c14Es4tKvHmBuTnCqubn':
    'Primary SOL Treasury Holdings',
  J45sC6ow6u2cXZU8tvewC548CcFiU6VGnFpnxW71WNgm: 'GG SHDW Tokens',
  wpSyytRSgo1b5RE6PYT9GMWubdq6EdbGC8PEbcz4Kff: 'DAOPool Fee Collection',
  xuEfu6gmCn1RSXSAVpWLTYttx685m9rAbzqwwYUjYXJ: 'DAOJones Fractionalized Tokens',
  GQDFqZ7URyWAiPMQs4ywZ9pKBqrUg4srdkqnZpRUstQz: 'Merch Escrow Holdings',
  '7JPpGyJTEXwR9uQSqhi6RAK5GiSTr41oq72PJ4fU5CXf': 'Marketing Wallet SOL',
  '2FCKVvw3JmRD6Q2DFb3ZzW697GKjYka8JwGMSF7juWZd': 'Marketing Wallet USDC',
  '8Ha82qmXrTYPKvy65scFA3SWHEGENBYP8CVg8iC4Hx5b': 'Merch Escrow Holdings',
}

// Blacklisted governances which should not be displayed in the UI
// TODO: Add this to on-chain metadata to Governance account
export const HIDDEN_GOVERNANCES = new Map<string, string>([
  ['HfWc8M6Df5wtLg8xg5vti4QKAo9KG4nL5gKQ8B2sjfYC', ''],
  ['A3Fb876sEiUmDWgrJ1fShASstw8b5wHB6XETzQa8VM7S', ''],
  ['2j2oe8YXdYJyS7G8CeEW5KARijdjjZkuPy5MnN8gBQqQ', ''],
  ['56yqzBEr9BqDGjYPJz9G8LVQrbXsQM2t2Yq3Gk8S56d1', ''],
  ['4styeLGsBRpV4xKsCNMRPb94U7JN8ZXoXJTLZA5hdjo9', ''],
])

// Blacklisted proposals which should not be displayed in the UI
// TODO: Add this to on-chain metadata to Proposal account
export const HIDDEN_PROPOSALS = new Map<string, string>([
  ['E8XgiVpDJgDf4XgBKjZnMs3S1K7cmibtbDqjw5aNobCZ', ''],
])

export const DEFAULT_NATIVE_SOL_MINT =
  'GSoLvSToqaUmMyqP12GffzcirPAickrpZmVUFtek6x5u'

export const DEFAULT_NFT_TREASURY_MINT =
  'GNFTm5rz1Kzvq94G7DJkcrEUnCypeQYf7Ya8arPoHWvw'

export function getAccountName(accountPk: PublicKey) {
  return ACCOUNT_NAMES[accountPk.toBase58()] ?? getProgramName(accountPk)
}

export const CHAT_PROGRAM_ID = new PublicKey(
  '7fjWgipzcHFP3c5TMMWumFHNAL5Eme1gFqqRGnNPbbfG'
)

export const WSOL_MINT = 'So11111111111111111111111111111111111111112'

const HIDDEN_MNGO_TREASURES = [
  'GZQSF4Fh9xK7rf9WBEhawXYFw8qPXeatZLUqVQeuW3X8',
  'J6jYLFDWeeGwg4u2TXhKDCcH4fSzJFQyDE2VSv2drRkg',
  '9VEbrfajRanMXoR1ubQiuR1ni9cNWx4QcGv3WgUUikgu',
  'HXxjhCQwm496HAXsHBWfuVkiXBLinHJqUbVKomCjKsfo',
  'EwPgko6gXD5PAgQaFo1KD7R9tPUEgRcTAfsGvgdhkP4Z',
  '6VYcrmbK4QNC7WpfVRXBAXP59ZH2FkUMBoMYhtgENGMn',
  '4Z8nAK9grjokaUqJNtw2AEkYAR1vcw8pkCWZcbVEEdh5',
  'FTiWWq3cgETfPkYqP36xFUhT7KMoFYyCiPKeYQU1e4U8',
  'FrkLPsCadx4tE4qDobbu2GTD5ffjWBpormHbLLy35PUS',
  'CaoFkVyPJugKMdzDT1NGnsQJ8dWe4kZFaETCbtWz1QBr',
]

export const HIDDEN_TREASURES = [...HIDDEN_MNGO_TREASURES]

export interface AccountDescriptor {
  name: string
  important?: boolean
}

export interface InstructionDescriptorFactory {
  name: string
  accounts: AccountDescriptor[]
  getDataUI: (
    connection: Connection,
    data: Uint8Array,
    accounts: AccountMetaData[]
  ) => Promise<JSX.Element>
}

export interface InstructionDescriptor {
  name: string
  accounts: AccountDescriptor[]
  dataUI: JSX.Element
}

// Well known program instructions displayed on the instruction card
export const INSTRUCTION_DESCRIPTORS = {
  ...SPL_TOKEN_INSTRUCTIONS,
  ...BPF_UPGRADEABLE_LOADER_INSTRUCTIONS,
  ...MANGO_INSTRUCTIONS,
  ...RAYDIUM_INSTRUCTIONS,
  ...MARINADE_INSTRUCTIONS,
  ...SOLEND_PROGRAM_INSTRUCTIONS,
  ...ATA_PROGRAM_INSTRUCTIONS,
  ...SYSTEM_INSTRUCTIONS,
  ...VOTE_STAKE_REGISTRY_INSTRUCTIONS,
  ...NFT_VOTER_INSTRUCTIONS,
}

export async function getInstructionDescriptor(
  connection: ConnectionContext,
  instruction: InstructionData
) {
  let descriptors: any
  if (isGovernanceProgram(instruction.programId)) {
    descriptors =
      GOVERNANCE_INSTRUCTIONS['GovER5Lthms3bLBqWub97yVrMmEogzX7xNjdXpPPCVZw']
  } else {
    descriptors = INSTRUCTION_DESCRIPTORS[instruction.programId.toBase58()]
  }

  // Make it work for program with one instruction like ATA program
  // and for the one with multiple instructions
  const descriptor = !instruction.data.length
    ? descriptors
    : descriptors && descriptors[instruction.data[0]]
  const dataUI = (descriptor?.getDataUI &&
    (await descriptor?.getDataUI(
      connection.current,
      instruction.data,
      instruction.accounts,
      instruction.programId,
      connection.cluster
    ))) ?? <>{JSON.stringify(instruction.data)}</>
  return {
    name: descriptor?.name,
    accounts: descriptor?.accounts,
    dataUI,
  }
}
