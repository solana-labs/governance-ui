import type { BigNumber } from 'bignumber.js'
import type {
  VoteTipping,
  ProgramAccount,
  Governance,
} from '@solana/spl-governance'

import { Asset, Token } from './Asset'

export interface Rules {
  address?: string
  maxVotingTime: number
  minInstructionHoldupTime: number
  minTokensToCreateProposal: BigNumber
  voteThresholdPercentage: number
  voteTipping: VoteTipping
}

export interface Wallet {
  address: string
  assets: Asset[]
  governanceAccount?: ProgramAccount<Governance>
  governanceAddress?: string
  name?: string
  rules: {
    community?: Rules
    council?: Rules
  }
  stats: {
    proposalsCount?: number
    votingProposalCount?: number
  }
  totalValue: BigNumber
}

export interface AuxiliaryWallet {
  assets: Token[]
  name: string
  totalValue: BigNumber
}
