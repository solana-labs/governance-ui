import { ProgramVersion } from '@models/registry/api'
import { BN, ProgramAccount } from '@project-serum/anchor'
import { MintInfo } from '@solana/spl-token'

/**
 * Default realm artifact interface
 */
export interface RealmArtifacts {
  governanceProgramId?: string
  name?: string
  communityMintId?: string
  communityMint?: ProgramAccount<MintInfo>
  councilMintId?: string
  councilMint?: ProgramAccount<MintInfo>
  programVersion?: ProgramVersion
  communityMintMaxVoteWeightSource?: number
  minCommunityTokensToCreateGovernance?: BN
  teamWallets?: string[]
}

/**
 * The modes in which the wizard will work
 */
export enum RealmWizardMode {
  /**
   * The simplest, shows only the first step and the app
   * take cares of the rest
   */
  BASIC,
  /**
   * To the advanced users who wants to set all details
   * of the Realm.
   */
  ADVANCED,
}

/**
 * The steps in which the wizard will go through.
 * It will be bound with CreateRealmModes in order
 * to select the correct flow.
 */
export enum RealmWizardStep {
  /**
   * The mode selection tool
   */
  SELECT_MODE,
  /**
   * Base state: set the name of the Realm and add the team wallets
   */
  BASIC_CONFIG,
  /**
   * Advanced config: set the token mints and governance program id
   */
  TOKENS_CONFIG,
  /**
   * Not defined yet
   */
  STEP_3,
  /**
   * Not defined yet
   */
  STEP_4,
}

export interface RealmWizardStepComponentProps {
  form: RealmArtifacts
  setForm: (data: RealmArtifacts) => void
  onConfirm: (nextStep: RealmWizardStep) => void
}
