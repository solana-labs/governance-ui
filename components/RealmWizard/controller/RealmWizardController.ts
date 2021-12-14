import { MintMaxVoteWeightSource } from '@models/accounts'
import { RpcContext } from '@models/core/api'
import { BN } from '@project-serum/anchor'
import { PublicKey } from '@solana/web3.js'
import { ConnectionContext } from 'stores/useWalletStore'
import {
  RealmArtifacts,
  RealmWizardMode,
  RealmWizardStep,
  StepDirection,
} from '../interfaces/Realm'

/**
 * This class provides methods to control the Realm Creator Wizard.
 *
 * @method getNextStep
 *
 * @author [Pollum](https://pollum.io)
 * @since v0.1.0
 */
class RealmWizardController {
  private mode: RealmWizardMode
  private steps: number[] = []
  private currentStep: RealmWizardStep

  constructor(mode: RealmWizardMode) {
    this.mountSteps(mode)
    this.currentStep = RealmWizardStep.SELECT_MODE
  }

  /**
   * Mounts the step based on the wizard mode
   * @param mode
   */
  private mountSteps(mode: RealmWizardMode) {
    this.mode = mode
    switch (this.mode) {
      case RealmWizardMode.BASIC:
        this.steps.push(
          RealmWizardStep.SELECT_MODE,
          RealmWizardStep.BASIC_CONFIG
        )
        break
      case RealmWizardMode.ADVANCED:
        this.steps.push(
          RealmWizardStep.SELECT_MODE,
          RealmWizardStep.BASIC_CONFIG,
          RealmWizardStep.TOKENS_CONFIG,
          RealmWizardStep.STEP_3,
          RealmWizardStep.STEP_4
        )
        break
      default:
        throw new Error('The selected mode is not available')
    }
    this.steps.push(RealmWizardStep.REALM_CREATED)
  }

  /**
   * Returns the Next desired step. It may be the next or previous step, depending on the chosen direction
   * @param currentStep
   * @param direction
   * @returns
   */
  getNextStep(
    currentStep: RealmWizardStep,
    direction: StepDirection
  ): RealmWizardStep {
    const nextStep = this.steps[currentStep + direction]
    if (nextStep !== undefined) {
      this.currentStep = nextStep
      return nextStep
    }
    throw new Error('The chosen step is not available.')
  }

  /**
   * Checks if the state is equal to the last step
   */
  isLastStep(): boolean {
    return this.currentStep === this.steps[this.steps.length - 2]
  }

  /**
   * Checks if the state is equal to the first step
   */
  isFirstStep(): boolean {
    return (
      this.currentStep === this.steps[0] ||
      this.currentStep === RealmWizardStep.REALM_CREATED
    )
  }
  /**
   * Return the current step
   */
  getCurrentStep(): RealmWizardStep {
    return this.currentStep
  }

  /**
   * Prepares the necessary data to request the realm creation
   */
  prepareData(
    wallet: any,
    conn: ConnectionContext,
    artifacts: RealmArtifacts
  ): {
    rpc: RpcContext
    name: string
    communityMintId: PublicKey
    councilMintId?: PublicKey
    voteWeight: MintMaxVoteWeightSource
    minCommunityTokens: BN
  } {
    console.log({ ...artifacts })
    if (artifacts.governanceProgramId) {
      const rpc = new RpcContext(
        new PublicKey(artifacts.governanceProgramId),
        artifacts.programVersion,
        wallet,
        conn.current,
        conn.endpoint
      )
      try {
        if (
          artifacts.name &&
          artifacts.communityMintId &&
          artifacts.minCommunityTokensToCreateGovernance
        ) {
          return {
            rpc,
            name: artifacts.name,
            communityMintId: new PublicKey(artifacts.communityMintId),
            councilMintId: artifacts.councilMintId
              ? new PublicKey(artifacts.councilMintId)
              : undefined,
            voteWeight: MintMaxVoteWeightSource.FULL_SUPPLY_FRACTION,
            minCommunityTokens: artifacts.minCommunityTokensToCreateGovernance,
          }
        } else {
          throw new Error('Invalid realm data.')
        }
      } catch (error) {
        return error.message
      }
    }
    throw new Error('Invalid Governance Program ID.')
  }
}
export default RealmWizardController
