import type { BigNumber } from 'bignumber.js'
import type {
  VoteTipping,
  ProgramAccount,
  Governance,
} from '@solana/spl-governance'

import { Asset, Token } from './Asset'
import { MangoAccount } from '@blockworks-foundation/mango-v4'

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
  mangoAccountsValue: BigNumber
  mangoAccounts: MangoAccount[]
}

export interface AuxiliaryWallet {
  assets: Token[]
  name: string
  totalValue: BigNumber
  mangoAccountsValue: BigNumber
  mangoAccounts: MangoAccount[]
}
