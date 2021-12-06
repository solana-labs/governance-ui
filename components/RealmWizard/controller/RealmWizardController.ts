import {
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

  isLastStep(): boolean {
    return this.currentStep === this.steps[this.steps.length - 1]
  }
  /**
   * Return the current step
   */
  getCurrentStep(): RealmWizardStep {
    return this.currentStep
  }
}
export default RealmWizardController
