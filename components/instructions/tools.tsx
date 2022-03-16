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
  Guiwem4qBivtkSFrxZAEfuthBz6YuWyCwS4G3fjBYu5Z: 'Mango DAO MNGO Treasury Vault',
  '9RGoboEjmaAjSCXsKi6p6zJucnwF3Eg5NUN9jPS6ziL3':
    'Mango DAO MNGO Treasury Governance',
  '4PdEyhrV3gaUj4ffwjKGXBLo42jF2CQCCBoXenwCRWXf':
    'Mango DAO USDC Treasury Vault',
  '65u1A86RC2U6whcHeD2mRG1tXCSmH2GsiktmEFQmzZgq':
    'Mango DAO USDC Treasury Governance',
  '4WQSYg21RrJNYhF4251XFpoy1uYbMHcMfZNLMXA3x5Mp':
    'Mango DAO Voter Stake Registry Registrar',
  DPiH3H3c7t47BMxqTxLsuPQpEC6Kne8GA9VXbxpnZxFE: 'Mango DAO Governance Realm',
  '7Sn4TN4ZkMghVBAhZ88UkyzXoYkMScaE6qtk9eWV3rJz':
    'Mango DAO Governance Realm Authority',
  '59BEyxwrFpt3x4sZ7TcXC3bHx3seGfqGkATcDx6siLWy':
    'Mango v3 Insurance Fund Vault',
  '9qFV99WD5TKnpYw8w3xz3mgMBR5anoSZo2BynrGmNZqY': 'Mango v3 Revenue Vault',
  '6GX2brfV7byA8bCurwgcqiGxNEgzjUmdYgarYZZr2MKe': 'Mango v3 Revenue Governance',
  CF8sDcPztLDkvnEbYnCaXiDxhUpZ2uKLStpmFfRDNxSd:
    'Mango v3 BTC-PERP Incentive Vault',
  '7Gm5zF6FNJpyhqdwKcEdMQw3r5YzitYUGVDKYMPT1cMy': 'Mango v3 Program Governance',
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
    'ClubDAO Main NFT Treasury Vault ',
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

export const DEFAULT_NFT_TREASURY_MINT =
  'GNFTm5rz1Kzvq94G7DJkcrEUnCypeQYf7Ya8arPoHWvw'

export const DEFAULT_NATIVE_SOL_MINT =
  'GSoLvSToqaUmMyqP12GffzcirPAickrpZmVUFtek6x5u'

export function getAccountName(accountPk: PublicKey) {
  return ACCOUNT_NAMES[accountPk.toBase58()] ?? getProgramName(accountPk)
}

export const CHAT_PROGRAM_ID = new PublicKey(
  '7fjWgipzcHFP3c5TMMWumFHNAL5Eme1gFqqRGnNPbbfG'
)

export const WSOL_MINT = 'So11111111111111111111111111111111111111112'

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
}

export async function getInstructionDescriptor(
  connection: Connection,
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
      connection,
      instruction.data,
      instruction.accounts,
      instruction.programId
    ))) ?? <>{JSON.stringify(instruction.data)}</>
  return {
    name: descriptor?.name,
    accounts: descriptor?.accounts,
    dataUI,
  }
}
