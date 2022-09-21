import type { BigNumber } from 'bignumber.js'
import type {
  VoteTipping,
  ProgramAccount,
  Governance,
} from '@solana/spl-governance'

import { Asset, Token } from './Asset'

export interface CommonRules {
  maxVotingTime: number
  minInstructionHoldupTime: number
  voteTipping: VoteTipping
}

export interface Rules {
  decimals?: number
  minTokensToCreateProposal: BigNumber
  voteThresholdPercentage: number | 'disabled'
  vetoVoteThresholdPercentage: number | 'disabled'
}

export interface Wallet {
  address: string
  assets: Asset[]
  governanceAccount?: ProgramAccount<Governance>
  governanceAddress?: string
  name?: string
  rules: {
    common?: CommonRules
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
