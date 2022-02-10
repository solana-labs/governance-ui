import { PublicKey } from '@solana/web3.js'

export const GOVERNANCE_PROGRAM_NAMES = {
  GqTPL6qRf5aUuqscLh8Rg2HTxPUXfhhAXDptTLhp1t2J: 'Mango Governance',
  AVoAYTs36yB5izAaBkxRG67wL1AMwG3vo41hKtUSb8is: 'Serum Governance',
  GovER5Lthms3bLBqWub97yVrMmEogzX7xNjdXpPPCVZw: 'Governance',
  '5sGZEdn32y8nHax7TxEyoHuPS3UXfPWtisgm8kqxat8H': 'Phantasia Governance',
  smfjietFKFJ4Sbw1cqESBTpPhF4CwbMwN8kBEC1e5ui:
    'Strangemood Foundation Governance',
  UXGA4U6nmCkdpVnhrhRzgFWYtmY4uHpNzLn3h9nVXNa: 'UXD Protocol Governance',
}

// Well known program names displayed on the instruction card
export const PROGRAM_NAMES = {
  TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA: 'Token Program',
  '11111111111111111111111111111111': 'System Program',
  mv3ekLzLbnVPNxjSKvqBpU3ZeZXPQdEC3bp5MDEBG68: 'Mango v3',
  '9xQeWvG816bUx9EPjHmaT23yvVM2ZWbrrpZb9PusVFin': 'Serum v3',
  DESVgJVGajEgKGXhb6XmqDHGz3VjdgP7rEVESBgxmroY: 'Serum v3 (devnet)',

  BPFLoaderUpgradeab1e11111111111111111111111: 'BPF Upgradeable Loader',

  '675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8': 'Raydium AMM Program',
  EhhTKczWMGQt46ynNeRX1WfeagwwJd7ufHvCDjRxjo5Q: 'Raydium Staking Program',

  UXD8m9cvwk4RcSxnX2HZ9VudQCEeDH6fRnB4CAP57Dr: 'UXD Protocol Program',
  UXDBdZFw33TgoKPQK2sXDCLfNrdio2gUzLs1yHePfMj: 'UXD IDO Program',
  MarBmsSgKXdrN1egZf5sqe1TMai9K1rChYNDJgjq7aD: 'Marinade Staking Program',

  SysvarRent111111111111111111111111111111111: 'Sysvar: Rent',
  SysvarC1ock11111111111111111111111111111111: 'Sysvar: Clock',
  '4Q6WW2ouZ6V3iaNm56MTd5n2tnTm4C5fiH8miFHnAFHo': 'Voter Stake Registry',
  ...GOVERNANCE_PROGRAM_NAMES,
}

export function getProgramName(programId: PublicKey) {
  return PROGRAM_NAMES[programId.toBase58()]
}

export function isGovernanceProgram(programId: PublicKey) {
  return GOVERNANCE_PROGRAM_NAMES[programId.toBase58()]
}
