/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {
  RealmWizardMode,
  RealmWizardStep,
  StepDirection,
} from '../interfaces/Realm'

/**
 * This class provides methods to control the Realm Creator Wizard.
 *
 * @method mountSteps
 * @method isLastStep
 * @method isFirstStep
 * @method getNextStep
 * @method getCurrentStep
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
}
export default RealmWizardController
