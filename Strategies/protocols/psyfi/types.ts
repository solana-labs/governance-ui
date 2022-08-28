import { BN } from '@project-serum/anchor'
import {
  ProgramAccount,
  Realm,
  RpcContext,
  TokenOwnerRecord,
} from '@solana/spl-governance'
import { PublicKey } from '@solana/web3.js'
import { ConnectionContext } from '@utils/connection'
import { AssetAccount } from '@utils/uiTypes/assets'
import { VotingClient } from '@utils/uiTypes/VotePlugin'
import { PsyFiStrategy } from 'Strategies/types/types'

export type CreatePsyFiStrategy = (
  rpcContext: RpcContext,
  form: {
    title: string
    description: string
    action: Action
    bnAmount: BN
    strategy: PsyFiStrategy
  },
  psyFiStrategyInfo: PsyFiStrategyInfo,
  realm: ProgramAccount<Realm>,
  treasuaryAccount: AssetAccount,
  tokenOwnerRecord: ProgramAccount<TokenOwnerRecord>,
  governingTokenMint: PublicKey,
  proposalIndex: number,
  isDraft: boolean,
  connection: ConnectionContext,
  client?: VotingClient
) => Promise<PublicKey>

export type PsyFiStrategyInfo = {
  ownedStrategyTokenAccount: AssetAccount | undefined
}

export enum Strategy {
  Call = 0,
  Put = 1,
}

export type StrategyInfo = {
  currentDeposits: number
}

export enum Action {
  Deposit = 0,
  Withdraw = 1,
}

export enum VaultVisibility {
  Development,
  Staging,
  Production,
}

export type PoolReward = {
  metadata?: {
    rewardPoolApr?: number[]
    rewardInUsdPerYearPerRewardUnit?: number
    usdValuePerRewardToken?: number
  }
  tokenSymbol: string
  rewardPoolKey: string
  rewardTokensPerWeek: number
  rewardMintAddress: string
  multiplier: number
  poolId: number
}

export type VaultInfo = {
  id: string
  name: string
  version: number
  strategyType: Strategy
  visibility: VaultVisibility
  accounts: {
    vaultAddress: string
    collateralAssetMint: string
    vaultOwnershipTokenMint: string
    optionsUnderlyingMint: string
    pythPriceOracle: string
    feeTokenAccount: string
  }
  deposits: {
    current: number
    max: number
  }
  fees: {
    performance: number
    withdrawal: number
  }
  status: {
    currentEpoch: number
    optionsActive: boolean
    nextEpochStartTime: number
    nextOptionMintTime: number
    isDeprecated: boolean
  }
  stakingProviderUrl?: string
  selectedStrike?: number
  apy: {
    currentEpochApy: number
    stakingApy: number
    movingAverageApy: {
      apyBeforeFees: number
      apyAfterFees: number
      epochsCounted: number
      averageEpochYield: number // Value before fees.
    }
    weightedApy: {
      targetDelta: number
      averageHistoricalLoss: number
      epochsCounted: number
      averageSaleYield: number
      apyBeforeFees: number
      apyAfterFees: number
    }
  }
  vaultHistory: VaultHistory[]
  valuePerVaultToken: number
  staking?: {
    metadata?: {
      usdValuePerVaultToken?: number
    }
    stakePoolKey: string
    stakingApr: number[]
    poolRewards: PoolReward[]
  }
}

export type VaultHistory = {
  saleAmount: number
  saleYield: number
  priceAtExpiry: number
  endingValuePerVaultToken: number
  strikePrice: number
  overallYield: number
  percentageLossOnCollateral: number
  epoch: number
  optionMinted: string
  startDate: number
  epochHistoryKey: string
}

export type TokenGroupedVaults = Record<string, VaultInfo[]>
