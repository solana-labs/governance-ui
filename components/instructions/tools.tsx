import {
  Connection,
  PublicKey,
  // TransactionInstruction,
  // Account,
  // Transaction,
} from '@solana/web3.js';
import { AccountMetaData, InstructionData } from '@solana/spl-governance';

import { BPF_UPGRADEABLE_LOADER_INSTRUCTIONS } from './programs/bpfUpgradeableLoader';
import { GOVERNANCE_INSTRUCTIONS } from './programs/governance';
import { MANGO_INSTRUCTIONS } from './programs/mango';
import { getProgramName, isGovernanceProgram } from './programs/names';
import { RAYDIUM_INSTRUCTIONS } from './programs/raydium';
import { QUARRY_MINE_PROGRAM_INSTRUCTIONS } from './programs/quarry';
import { SPL_TOKEN_INSTRUCTIONS } from './programs/splToken';
import { SABER_POOLS_PROGRAM_INSTRUCTIONS } from './programs/saberPools';
import { SOCEAN_PROGRAM_INSTRUCTIONS } from './programs/socean';
import { UXD_PROGRAM_INSTRUCTIONS } from './programs/uxdProtocol';
import { SYSTEM_INSTRUCTIONS } from './programs/system';
import { VOTE_STAKE_REGISTRY_INSTRUCTIONS } from './programs/voteStakeRegistry';
import { MARINADE_INSTRUCTIONS } from './programs/marinade';
import { SOLEND_PROGRAM_INSTRUCTIONS } from './programs/solend';
import { ATA_PROGRAM_INSTRUCTIONS } from './programs/associatedTokenAccount';
import { UXD_PROTOCOL_STAKING_INSTRUCTIONS } from './programs/uxdProtocolStaking';
import { LIFINITY_PROGRAM_INSTRUCTIONS } from './programs/lifinity';
import { TRIBECA_PROGRAM_INSTRUCTIONS } from './programs/tribeca';
import { MAPLE_FINANCE_PROGRAM_INSTRUCTIONS } from './programs/mapleFinance';
import { FRIKTION_PROGRAM_INSTRUCTIONS } from './programs/friktion';
import { DELTAFI_PROGRAM_INSTRUCTIONS } from './programs/deltafi';
import { ORCA_PROGRAM_INSTRUCTIONS } from './programs/orca';
import { COMPUTE_BUDGET_INSTRUCTIONS } from './programs/computeBudgetProgram';
import { MERCURIAL_PROGRAM_INSTRUCTIONS } from './programs/mercurial';
import { CREDIX_PROGRAM_INSTRUCTIONS } from './programs/credix';

/**
 * Default governance program id instance
 */
export const DEFAULT_GOVERNANCE_PROGRAM_ID =
  'GovER5Lthms3bLBqWub97yVrMmEogzX7xNjdXpPPCVZw';

/**
 * Default TEST governance program id instance
 */
export const DEFAULT_TEST_GOVERNANCE_PROGRAM_ID =
  'GTesTBiEWE32WHXXE2S4XbZvA5CrEc4xs6ZgRe895dP';

// Well known account names displayed on the instruction card
export const ACCOUNT_NAMES = {
  //UXD DAO
  '9SAveSCmGTVR9csAjK45keGitb1kdsC22Pb1AFdoUcSD': 'USDC Treasury Vault',
  '89WLRw7xc6XEC3hdo89fSb8boAxAJu9wYVFok8JEDSJa':
    'USDC Secondary Treasury Vault',
  GEkb8xU5DrPw4TW75BgoRbqUeuyKpsZ4Q2RHMX9M74W5: 'UXP Treasury Vault',
  '39qcqpaiLivyFLBLh4wvPmLrs336BBpXkKYb88i8dSiJ': 'UXD Council Token',
  '4dQ66QipF693wXjf832n1PXvAVz1A252P8EoSY2CFqjg': 'SBR Treasury Vault',
  '6VfHhLym1TjQhD64ZL8Qi5eMVcCzgkUsa8evEKGKRXto': 'SOL Treasury Vault',
  E2SZHFGNbNpaQv62RQb6AcDu6c1EBBC7tG3xsQMk2XKB: 'SUNNY Treasury Vault',
  // Tricks to display the hot wallet name, Please recode this
  '89j5yTsuqCpdeJUW566FrkVrpEwMHpqUvm47yanBsh7b':
    'SOL Treasury Vault / Hot Wallet',
};

// Blacklisted governances which should not be displayed in the UI
// TODO: Add this to on-chain metadata to Governance account
export const HIDDEN_GOVERNANCES = new Map<string, string>([
  ['HfWc8M6Df5wtLg8xg5vti4QKAo9KG4nL5gKQ8B2sjfYC', ''],
  ['A3Fb876sEiUmDWgrJ1fShASstw8b5wHB6XETzQa8VM7S', ''],
  ['2j2oe8YXdYJyS7G8CeEW5KARijdjjZkuPy5MnN8gBQqQ', ''],
  ['56yqzBEr9BqDGjYPJz9G8LVQrbXsQM2t2Yq3Gk8S56d1', ''],
  ['4styeLGsBRpV4xKsCNMRPb94U7JN8ZXoXJTLZA5hdjo9', ''],
]);

// Blacklisted proposals which should not be displayed in the UI
// TODO: Add this to on-chain metadata to Proposal account
export const HIDDEN_PROPOSALS = new Map<string, string>([
  ['E8XgiVpDJgDf4XgBKjZnMs3S1K7cmibtbDqjw5aNobCZ', ''],
]);

export const DEFAULT_NFT_TREASURY_MINT =
  'GNFTm5rz1Kzvq94G7DJkcrEUnCypeQYf7Ya8arPoHWvw';

export const DEFAULT_NATIVE_SOL_MINT =
  'GSoLvSToqaUmMyqP12GffzcirPAickrpZmVUFtek6x5u';

export function getAccountName(accountPk: PublicKey) {
  return ACCOUNT_NAMES[accountPk.toBase58()] ?? getProgramName(accountPk);
}

export const CHAT_PROGRAM_ID = new PublicKey(
  '7fjWgipzcHFP3c5TMMWumFHNAL5Eme1gFqqRGnNPbbfG',
);

export const WSOL_MINT = 'So11111111111111111111111111111111111111112';

export interface AccountDescriptor {
  name: string;
  important?: boolean;
}

export interface InstructionDescriptorFactory {
  name: string;
  accounts: AccountDescriptor[];
  getDataUI: (
    connection: Connection,
    data: Uint8Array,
    accounts: AccountMetaData[],
  ) => Promise<JSX.Element>;
}

export interface InstructionDescriptor {
  name: string;
  accounts: AccountDescriptor[];
  dataUI: JSX.Element;
}

// Well known program instructions displayed on the instruction card
export const INSTRUCTION_DESCRIPTORS = {
  ...SPL_TOKEN_INSTRUCTIONS,
  ...BPF_UPGRADEABLE_LOADER_INSTRUCTIONS,
  ...MANGO_INSTRUCTIONS,
  ...RAYDIUM_INSTRUCTIONS,
  ...UXD_PROGRAM_INSTRUCTIONS,
  ...QUARRY_MINE_PROGRAM_INSTRUCTIONS,
  ...SABER_POOLS_PROGRAM_INSTRUCTIONS,
  ...SOCEAN_PROGRAM_INSTRUCTIONS,
  ...MARINADE_INSTRUCTIONS,
  ...SOLEND_PROGRAM_INSTRUCTIONS,
  ...ATA_PROGRAM_INSTRUCTIONS,
  ...SYSTEM_INSTRUCTIONS,
  ...VOTE_STAKE_REGISTRY_INSTRUCTIONS,
  ...UXD_PROTOCOL_STAKING_INSTRUCTIONS,
  ...LIFINITY_PROGRAM_INSTRUCTIONS,
  ...TRIBECA_PROGRAM_INSTRUCTIONS,
  ...MAPLE_FINANCE_PROGRAM_INSTRUCTIONS,
  ...FRIKTION_PROGRAM_INSTRUCTIONS,
  ...DELTAFI_PROGRAM_INSTRUCTIONS,
  ...ORCA_PROGRAM_INSTRUCTIONS,
  ...COMPUTE_BUDGET_INSTRUCTIONS,
  ...MERCURIAL_PROGRAM_INSTRUCTIONS,
  ...CREDIX_PROGRAM_INSTRUCTIONS,
};

export async function getInstructionDescriptor(
  connection: Connection,
  instruction: InstructionData,
) {
  let descriptors: any;
  if (isGovernanceProgram(instruction.programId)) {
    descriptors =
      GOVERNANCE_INSTRUCTIONS['GovER5Lthms3bLBqWub97yVrMmEogzX7xNjdXpPPCVZw'];
  } else {
    descriptors = INSTRUCTION_DESCRIPTORS[instruction.programId.toBase58()];
  }

  // Make it work for program with one instruction like ATA program
  // and for the one with multiple instructions
  const descriptor = !instruction.data.length
    ? descriptors
    : descriptors && descriptors[instruction.data[0]];

  const dataUI = (descriptor?.getDataUI &&
    (await descriptor?.getDataUI(
      connection,
      instruction.data,
      instruction.accounts,
      instruction.programId,
    ))) ?? <>{JSON.stringify(instruction.data)}</>;
  return {
    name: descriptor?.name,
    accounts: descriptor?.accounts,
    dataUI,
  };
}
