import { ProgramAccount } from '@project-serum/anchor'
import { MintInfo } from '@solana/spl-token'
import { PublicKey } from '@solana/web3.js'
import React from 'react'

/**
 * Default realm artifact interface
 */
export interface RealmArtifacts {
  governanceProgramId?: string
  name?: string
  communityMintId?: string
  communityMint?: ProgramAccount<MintInfo>
  transferAuthority?: boolean
  councilMintId?: string
  councilMint?: ProgramAccount<MintInfo>
  communityMintMaxVoteWeightSource?: string
  minCommunityTokensToCreateGovernance?: string
  teamWallets?: string[]
  yesThreshold?: number
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
  MULTISIG_CONFIG,
  /**
   * Set up bespoke basic options
   */
  BESPOKE_CONFIG,
  /**
   * Set up the Bespoke council options
   */
  BESPOKE_COUNCIL,
  /**
   * Setup the governance token
   */
  GOVERNANCE,
  /**
   * Information Inserted to create realm
   */
  BESPOKE_INFO,
  /**
   * Represents the Realm Created state
   */
  REALM_CREATED,
}

export enum StepDirection {
  PREV = -1,
  NEXT = 1,
}

export interface RealmWizardStepComponentProps {
  form: RealmArtifacts
  setForm: (data: RealmArtifacts) => void
  beforeClickNext?: React.Dispatch<(...args) => boolean>
  [key: string]: any
}

export interface RealmProps {
  address?: string
  tx: number
  realmName: string
  communityMintAddress: PublicKey
  councilMintAddress: PublicKey
  tokenGovernance: {
    tokenAccountAddress: string
    beneficiaryTokenAccountAddress: string
  }
}
