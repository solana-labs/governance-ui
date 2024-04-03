import { Governance } from '@solana/spl-governance'
import { ProgramAccount } from '@solana/spl-governance'
import { MintInfo } from '@solana/spl-token'
import { PublicKey, Keypair, TransactionInstruction } from '@solana/web3.js'
import { getNameOf } from '@tools/core/script'
import { DepositWithMintAccount, Voter } from 'VoteStakeRegistry/sdk/accounts'
import { LockupKind } from 'VoteStakeRegistry/tools/types'
import { AssetAccount, StakeAccount } from '@utils/uiTypes/assets'
import { RealmInfo } from '@models/registry/api'

// Alphabetical order
export enum PackageEnum {
  Common,
  Distribution,
  GatewayPlugin,
  Identity,
  MangoMarketV4,
  NftPlugin,
  PsyFinance,
  Pyth,
  Serum,
  Squads,
  VsrPlugin,
}

export interface UiInstruction {
  serializedInstruction: string
  additionalSerializedInstructions?: string[]
  isValid: boolean
  governance: ProgramAccount<Governance> | undefined
  customHoldUpTime?: number
  prerequisiteInstructions?: TransactionInstruction[]
  prerequisiteInstructionsSigners?: (Keypair | null)[]
  chunkBy?: number
  signers?: Keypair[]
}

export interface SplTokenTransferForm {
  destinationAccount: string
  amount: number | undefined
  governedTokenAccount: AssetAccount | undefined
  programId: string | undefined
  mintInfo: MintInfo | undefined
}

export interface DomainNameTransferForm {
  destinationAccount: string
  governedAccount: AssetAccount | undefined
  domainAddress: string | undefined
}

export interface GrantForm {
  destinationAccount: string
  amount: number | undefined
  governedTokenAccount: AssetAccount | undefined
  mintInfo: MintInfo | undefined
  lockupKind: LockupKind
  startDateUnixSeconds: number
  periods: number
  allowClawback: boolean
}

export interface ClawbackForm {
  governedTokenAccount: AssetAccount | undefined
  voter: Voter | null
  deposit: DepositWithMintAccount | null
  holdupTime: number
}

export interface SendTokenCompactViewForm extends SplTokenTransferForm {
  description: string
  title: string
}

export interface StakingViewForm {
  destinationAccount: AssetAccount | undefined
  amount: number | undefined
  governedTokenAccount: AssetAccount | undefined
  description: string
  title: string
}

export interface MintForm {
  destinationAccount: string
  amount: number | undefined
  mintAccount: AssetAccount | undefined
  programId: string | undefined
}

export interface ProgramUpgradeForm {
  governedAccount: AssetAccount | undefined
  programId: string | undefined
  bufferAddress: string
  bufferSpillAddress?: string | undefined
}

export const programUpgradeFormNameOf = getNameOf<ProgramUpgradeForm>()

export interface MangoMakeAddOracleForm {
  governedAccount: AssetAccount | undefined
  programId: string | undefined
  mangoGroup: string | undefined
  oracleAccount: string | undefined
}

export type NameValue = {
  name: string
  value: string
}

/* PsyOptions American options */
export interface PsyFinanceMintAmericanOptionsForm {
  contractSize: number
  expirationUnixTimestamp: number
  optionTokenDestinationAccount: string
  quoteMint: string
  size: number | undefined
  strike: number
  underlyingAccount: AssetAccount | undefined
  underlyingMint: PublicKey | undefined
  writerTokenDestinationAccount: string
}

export interface PsyFinanceBurnWriterForQuote {
  size: number
  writerTokenAccount: AssetAccount | undefined
  quoteDestination: string
}

export interface PsyFinanceClaimUnderlyingPostExpiration {
  size: number
  writerTokenAccount: AssetAccount | undefined
  underlyingDestination: string
}

export interface PsyFinanceExerciseOption {
  size: number
  optionTokenAccount: AssetAccount | undefined
  quoteAssetAccount: AssetAccount | undefined
}

/* End PsyOptions American options */

export interface Base64InstructionForm {
  governedAccount: AssetAccount | undefined
  base64: string
  holdUpTime: number
}

export interface EmptyInstructionForm {
  governedAccount: AssetAccount | undefined
}

export interface CreateAssociatedTokenAccountForm {
  governedAccount?: AssetAccount
  splTokenMint?: string
}

export interface CreateTokenMetadataForm {
  name: string
  symbol: string
  uri: string
  mintAccount: AssetAccount | undefined
  programId: string | undefined
}

export interface UpdateTokenMetadataForm {
  name: string
  symbol: string
  uri: string
  mintAccount: AssetAccount | undefined
  programId: string | undefined
}

export interface SerumInitUserForm {
  governedAccount?: AssetAccount
  owner: string
  programId: string
}

export interface SerumGrantLockedForm {
  governedAccount?: AssetAccount
  owner: string
  mintInfo: MintInfo | undefined
  amount: number | undefined
  programId: string
}

export interface SerumUpdateConfigParam {
  governedAccount?: AssetAccount // Config Authority
  claimDelay?: number
  redeemDelay?: number
  cliffPeriod?: number
  linearVestingPeriod?: number
}

export interface SerumUpdateConfigAuthority {
  governedAccount?: AssetAccount // Config Authority
  newAuthority?: string
}

export interface JoinDAOForm {
  governedAccount?: AssetAccount
  mintInfo: MintInfo | undefined
  realm: RealmInfo | null
  amount?: number
}

export enum Instructions {
  Base64,
  ChangeMakeDonation,
  Clawback,
  CloseTokenAccount,
  CloseMultipleTokenAccounts,
  ConfigureGatewayPlugin,
  ConfigureNftPluginCollection,
  CreateAssociatedTokenAccount,
  CreateGatewayPluginRegistrar,
  CreateNftPluginMaxVoterWeight,
  CreateNftPluginRegistrar,
  CreateTokenMetadata,
  CreateVsrRegistrar,
  DeactivateValidatorStake,
  DifferValidatorStake,
  DaoVote,
  DelegateStake,
  Grant,
  JoinDAO,
  MangoV4PerpCreate,
  MangoV4PerpEdit,
  MangoV4OpenBookRegisterMarket,
  MangoV4OpenBookEditMarket,
  MangoV4TokenEdit,
  MangoV4TokenRegister,
  MangoV4TokenRegisterTrustless,
  MangoV4GroupEdit,
  IdlSetBuffer,
  MangoV4IxGateSet,
  MangoV4AltSet,
  MangoV4AltExtend,
  MangoV4StubOracleCreate,
  MangoV4StubOracleSet,
  MangoV4TokenAddBank,
  MangoV4AdminWithdrawTokenFees,
  MangoV4WithdrawPerpFees,
  Mint,
  None,
  ProgramUpgrade,
  PsyFinanceBurnWriterForQuote,
  PsyFinanceClaimUnderlyingPostExpiration,
  PsyFinanceExerciseOption,
  PsyFinanceMintAmericanOptions,
  RealmConfig,
  SerumGrantLockedMSRM,
  SerumGrantLockedSRM,
  SerumGrantVestMSRM,
  SerumGrantVestSRM,
  SerumInitUser,
  SerumUpdateGovConfigAuthority,
  SerumUpdateGovConfigParams,
  PythRecoverAccount,
  StakeValidator,
  Transfer,
  TransferDomainName,
  UpdateTokenMetadata,
  VotingMintConfig,
  WithdrawValidatorStake,
  SplitStake,
  AddKeyToDID,
  RemoveKeyFromDID,
  AddServiceToDID,
  RemoveServiceFromDID,
  RevokeGoverningTokens,
  SetMintAuthority,
}

export interface ComponentInstructionData {
  governedAccount?: ProgramAccount<Governance> | undefined
  getInstruction?: () => Promise<UiInstruction>
  type: any
}
export interface InstructionsContext {
  instructionsData: ComponentInstructionData[]
  voteByCouncil?: boolean | null
  handleSetInstructions: (val, index) => void
  governance: ProgramAccount<Governance> | null | undefined
  setGovernance: (val) => void
}

export interface ChangeNonprofit {
  name: string
  description: string
  ein: string
  classification: string
  category: string
  address_line: string
  city: string
  state: string
  zip_code: string
  icon_url: string
  email?: string
  website: string
  socials: {
    facebook?: string
    instagram?: string
    tiktok?: string
    twitter?: string
    youtube?: string
  }
  crypto: {
    solana_address: string
    ethereum_address: string
  }
}

export interface ValidatorStakingForm {
  governedTokenAccount: AssetAccount | undefined
  validatorVoteKey: string
  amount: number
  seed: number
}

export interface ValidatorDeactivateStakeForm {
  governedTokenAccount: AssetAccount | undefined
  stakingAccount: StakeAccount | undefined
}

export interface ValidatorWithdrawStakeForm {
  governedTokenAccount: AssetAccount | undefined
  stakingAccount: StakeAccount | undefined
  amount: number
}

export interface DelegateStakeForm {
  governedTokenAccount: AssetAccount | undefined
  stakingAccount: StakeAccount | undefined
  votePubkey: string
}
