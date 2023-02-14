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
import { STREAMFLOW_INSTRUCTIONS } from './programs/streamflow'
import { governance as foresightGov } from '@foresight-tmp/foresight-sdk'
import { ConnectionContext } from '@utils/connection'
import { NFT_VOTER_INSTRUCTIONS } from './programs/nftVotingClient'
import { PROGRAM_IDS } from '@castlefinance/vault-sdk'
import { FORESIGHT_INSTRUCTIONS } from './programs/foresight'
import { SAGA_PHONE } from './programs/SagaPhone'
import { LIDO_INSTRUCTIONS } from './programs/lido'
import { NAME_SERVICE_INSTRUCTIONS } from './programs/nameService'
import { TOKEN_AUCTION_INSTRUCTIONS } from './programs/tokenAuction'
import { VALIDATORDAO_INSTRUCTIONS } from './programs/validatordao'

export const V3_DEFAULT_GOVERNANCE_PROGRAM_ID =
  '7e75Nwsz8i5i4NiDa43CNzKJ4AeQGyRimha46VKTM1Ls'

export const V2_DEFAULT_GOVERNANCE_PROGRAM_ID =
  'GovER5Lthms3bLBqWub97yVrMmEogzX7xNjdXpPPCVZw'

/**
 * Default governance program id instance
 */
export const DEFAULT_GOVERNANCE_PROGRAM_ID = V2_DEFAULT_GOVERNANCE_PROGRAM_ID
export const DEFAULT_GOVERNANCE_PROGRAM_VERSION = 2

export const MANGO_DAO_TREASURY = '9RGoboEjmaAjSCXsKi6p6zJucnwF3Eg5NUN9jPS6ziL3'

// Well known account names displayed on the instruction card
export const ACCOUNT_NAMES = {
  // Orca DAO Names
  '6d76JcdNuTLoRarNCuinbjLSWr3dxJuY9uKVViz4HUf9': 'Signaling Governance',
  '64FH4dmmEUFo427wNuHa2mC4TUa55U7iDqePd3PskMWE': 'Council Token Governance',
  '7VZTFBDyJK5pdoQWzi8gEHDuqdmHW8xwghbyQKUxjqVt': 'DAO Contract Governance',
}

// Blacklisted governances which should not be displayed in the UI
// TODO: Add this to on-chain metadata to Governance account
export const HIDDEN_GOVERNANCES = new Map<string, string>([
  ['HfWc8M6Df5wtLg8xg5vti4QKAo9KG4nL5gKQ8B2sjfYC', ''],
  ['A3Fb876sEiUmDWgrJ1fShASstw8b5wHB6XETzQa8VM7S', ''],
  ['2j2oe8YXdYJyS7G8CeEW5KARijdjjZkuPy5MnN8gBQqQ', ''],
  ['56yqzBEr9BqDGjYPJz9G8LVQrbXsQM2t2Yq3Gk8S56d1', ''],
  ['4styeLGsBRpV4xKsCNMRPb94U7JN8ZXoXJTLZA5hdjo9', ''],
  ['CKWNNwtn5nbsGMkvtRwHDv4QTyoHMByKVd7Ypo2deNpc', ''],
  ['G8JgCHfca7PehBwRp1Q91smJ9CXAd8K9e9CpfVjyD2MP', ''],
])

// Blacklisted proposals which should not be displayed in the UI
// TODO: Add this to on-chain metadata to Proposal account
export const HIDDEN_PROPOSALS = new Map<string, string>([
  ['E8XgiVpDJgDf4XgBKjZnMs3S1K7cmibtbDqjw5aNobCZ', ''],
  ['DrhhwYXaY4fvTBoQdNtgwEoTjuQswvDQLfVcgUXgP1Mx', ''],
  ['CfbCUF7cn6UdWRsGPUUtj4CKMBL7qNCdF1WunED4gYA4', ''],
  ['Hzv3N2KtVikNoXz6nH9AWvt7Y9Smn8bRQ2gnAeJDkhm1', ''],
  ['FeFaHN8c3yokUxyJw3F475uegMUoYsYtr4J2DMaS6JZh', ''],
  ['GqoMraqhfK7ezFiKexRVkbYwvCegs9dgFpXn2f7aeePT', ''],
  ['CZnFphcs2UmbqppTEP5PkAAF4DqeyFr7fPQ2bunCey2J', ''],
  ['8ptWWXgb2nLVuMgJ1ZgXJfRaBesBDkyzYarJvWNLECbG', ''],
  ['7P3dtUTSvcQcjtJpZHZKEzrGvvHQdQGJrtKFLNAYHvpv', ''],
  ['EVzN1pfZwniGuyp45ZASHo6rU4Z8xx5kWevzDauR8sWp', ''],
  ['7P3dtUTSvcQcjtJpZHZKEzrGvvHQdQGJrtKFLNAYHvpv', ''],
  ['H5TnbSBNFKJJwKea8tUj7ETcmhRHXQ1N9XCXBSD6Q9P1', ''],
  ['GeMQWvFTasBoui11RqRzMtDPQ9b2BkMK8NzepWzvuXw3', ''],
])

export const DEFAULT_NATIVE_SOL_MINT =
  'GSoLvSToqaUmMyqP12GffzcirPAickrpZmVUFtek6x5u'

export const DEFAULT_NFT_TREASURY_MINT =
  'GNFTm5rz1Kzvq94G7DJkcrEUnCypeQYf7Ya8arPoHWvw'

export function getAccountName(accountPk: PublicKey | string) {
  const key = typeof accountPk === 'string' ? accountPk : accountPk.toBase58()
  return ACCOUNT_NAMES[key] ?? getProgramName(accountPk)
}

export const CHAT_PROGRAM_ID = new PublicKey(
  '7fjWgipzcHFP3c5TMMWumFHNAL5Eme1gFqqRGnNPbbfG'
)

export const WSOL_MINT = 'So11111111111111111111111111111111111111112'
export const WSOL_MINT_PK = new PublicKey(WSOL_MINT)

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
  'PuXf9LNrmtVDhBTxteNTWS8D2SpzbhYvidkSatjRArt',
]

//owner and desired accounts we want to show
export const MNGO_AUXILIARY_TOKEN_ACCOUNTS = [
  {
    owner: '9BVcYqEQxyccuwznvxXqDkSJFavvTyheiTYk231T1A8S',
    accounts: ['59BEyxwrFpt3x4sZ7TcXC3bHx3seGfqGkATcDx6siLWy'],
  },
  {
    owner: 'GHsErpcUbwiw1eci65HCDQzySKwQCxYRi5MrGeGpq5dn',
    accounts: ['8tKwcKM4obpoPmTZNZKDt5cCkAatrwHBNteXNrZRvjWj'],
  },
]

export const AUXILIARY_TOKEN_ACCOUNTS = {
  Mango: MNGO_AUXILIARY_TOKEN_ACCOUNTS,
}

export const HIDDEN_TREASURES = [...HIDDEN_MNGO_TREASURES]

export const ALL_CASTLE_PROGRAMS = [
  PROGRAM_IDS['devnet-parity'],
  PROGRAM_IDS['devnet-staging'],
  PROGRAM_IDS['mainnet'],
]

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
  ...LIDO_INSTRUCTIONS,
  ...SOLEND_PROGRAM_INSTRUCTIONS,
  ...FORESIGHT_INSTRUCTIONS,
  ...ATA_PROGRAM_INSTRUCTIONS,
  ...SYSTEM_INSTRUCTIONS,
  ...VOTE_STAKE_REGISTRY_INSTRUCTIONS,
  ...NFT_VOTER_INSTRUCTIONS,
  ...STREAMFLOW_INSTRUCTIONS,
  ...NAME_SERVICE_INSTRUCTIONS,
  ...SAGA_PHONE,
  ...TOKEN_AUCTION_INSTRUCTIONS,
  ...VALIDATORDAO_INSTRUCTIONS,
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
