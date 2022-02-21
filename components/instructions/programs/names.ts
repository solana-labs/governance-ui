import { PublicKey } from '@solana/web3.js'

export const GOVERNANCE_PROGRAM_NAMES = {
  GqTPL6qRf5aUuqscLh8Rg2HTxPUXfhhAXDptTLhp1t2J: 'Mango Governance Program',
  AVoAYTs36yB5izAaBkxRG67wL1AMwG3vo41hKtUSb8is: 'Serum Governance Program',
  GovER5Lthms3bLBqWub97yVrMmEogzX7xNjdXpPPCVZw: 'Governance Program',
  '5sGZEdn32y8nHax7TxEyoHuPS3UXfPWtisgm8kqxat8H':
    'Phantasia Governance Program',
  smfjietFKFJ4Sbw1cqESBTpPhF4CwbMwN8kBEC1e5ui:
    'Strangemood Foundation Governance Program',
}

// Well known program names displayed on the instruction card
export const PROGRAM_NAMES = {
  TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA: 'Token Program',
  '11111111111111111111111111111111': 'System Program',
  mv3ekLzLbnVPNxjSKvqBpU3ZeZXPQdEC3bp5MDEBG68: 'Mango v3 Program',
  '9xQeWvG816bUx9EPjHmaT23yvVM2ZWbrrpZb9PusVFin': 'Serum v3 Program',
  DESVgJVGajEgKGXhb6XmqDHGz3VjdgP7rEVESBgxmroY: 'Serum v3 Program (devnet)',

  BPFLoaderUpgradeab1e11111111111111111111111: 'BPF Upgradeable Loader',

  '675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8': 'Raydium AMM Program',
  EhhTKczWMGQt46ynNeRX1WfeagwwJd7ufHvCDjRxjo5Q: 'Raydium Staking Program',

  MarBmsSgKXdrN1egZf5sqe1TMai9K1rChYNDJgjq7aD: 'Marinade Staking Program',

  SysvarRent111111111111111111111111111111111: 'Sysvar: Rent',
  SysvarC1ock11111111111111111111111111111111: 'Sysvar: Clock',
  '4Q6WW2ouZ6V3iaNm56MTd5n2tnTm4C5fiH8miFHnAFHo':
    'Mango Voter Stake Registry Program',
  ...GOVERNANCE_PROGRAM_NAMES,
}

export function getProgramName(programId: PublicKey) {
  return PROGRAM_NAMES[programId.toBase58()]
}

export function isGovernanceProgram(programId: PublicKey) {
  return GOVERNANCE_PROGRAM_NAMES[programId.toBase58()]
}
