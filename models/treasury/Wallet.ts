import type { BigNumber } from 'bignumber.js'
import type {
  VoteTipping,
  ProgramAccount,
  Governance,
} from '@solana/spl-governance'

import { Asset, Mango, Sol, Token } from './Asset'

interface CommonRules {
  maxVotingTime: number
  minInstructionHoldupTime: number
  votingCoolOffSeconds: number
}

interface Rules {
  decimals?: number
  minTokensToCreateProposal: BigNumber
  voteThresholdPercentage: number | 'disabled'
  vetoVoteThresholdPercentage: number | 'disabled'
  voteTipping: VoteTipping
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
  assets: (Token | Sol | Mango)[]
  name: string
  totalValue: BigNumber
}
