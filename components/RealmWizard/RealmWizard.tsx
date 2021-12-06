import React, { useState } from 'react'
import RealmWizardController from './controller/RealmWizardController'
import BN from 'bn.js'
// import CreateRealmForm from './components/CreateRealmForm'
import Loading from '@components/Loading'
import WizardModeSelect from './components/Steps/WizardModeSelect'
import { notify } from '@utils/notifications'
import { StepOne, StepTwo, StepThree, StepFour } from './components/Steps'
import { useMemo } from 'react'
import Button from '@components/Button'
import {
  RealmArtifacts,
  RealmWizardMode,
  RealmWizardStep,
  StepDirection,
} from './interfaces/Realm'

const RealmWizard: React.FC = () => {
  /**
   * The wizard controller instance
   */
  const [ctl, setController] = useState<RealmWizardController>()

  const [form, setForm] = useState<RealmArtifacts>({})
  const [isLoading, setIsLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState<RealmWizardStep>(
    RealmWizardStep.SELECT_MODE
  )

  /**
   * Handles and set the form data
   * @param data the form data
   */
  const handleSetForm = (data: RealmArtifacts) => {
    setForm({
      ...form,
      ...data,
    })
  }

  /**
   * Generate program artifacts
   */
  const generateProgramArtifacts = () => {
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      const artifacts: RealmArtifacts = {
        name: 'Realm-EZUBS',
        programVersion: 1,
        governanceProgramId: 'GovER5Lthms3bLBqWub97yVrMmEogzX7xNjdXpPPCVZw',
        communityMintId: 'EZUBSaFK4jVPxk5ChMmbNGtiXkRsuf1E2soDi5GmcdCN',
        councilMintId: '9DPEfrW5y1AoB1B2NU77BQmEDJvrtkxJTQE2pr729DAm',
        minCommunityTokensToCreateGovernance: new BN(1000000),
      }
      setForm(artifacts)
    }, 1000)
  }

  /**
   * Handles and set the selected mode
   * @param option the selected mode
   */
  const handleModeSelection = (option: RealmWizardMode) => {
    try {
      const ctl = new RealmWizardController(option)
      const nextStep = ctl.getNextStep(currentStep, StepDirection.NEXT)
      setController(ctl)
      setCurrentStep(nextStep)
    } catch (error) {
      notify({
        type: 'error',
        message: error.message,
      })
    }
  }

  const handleStepSelection = (direction: StepDirection) => {
    if (ctl) {
      try {
        const nextStep = ctl.getNextStep(currentStep, direction)
        setCurrentStep(nextStep)
      } catch (error) {
        notify({
          type: 'error',
          message: error.message,
        })
      }
    }
  }

  const handleCreateRealm = () => {
    console.log('Creating realm')
  }

  /**
   * Binds the current step to the matching component
   */
  const BoundStepComponent = useMemo(() => {
    switch (currentStep) {
      case RealmWizardStep.SELECT_MODE:
        return <WizardModeSelect onSelect={handleModeSelection} />
      case RealmWizardStep.BASIC_CONFIG:
        return <StepOne form={form} setForm={handleSetForm} />
      case RealmWizardStep.TOKENS_CONFIG:
        return <StepTwo form={form} setForm={handleSetForm} />
      case RealmWizardStep.STEP_3:
        return <StepThree form={form} setForm={handleSetForm} />
      case RealmWizardStep.STEP_4:
        return <StepFour form={form} setForm={handleSetForm} />
      default:
        return <h4>Sorry, but this step ran away</h4>
    }
  }, [currentStep, form.teamWallets?.length])

  return (
    <div className="relative">
      {isLoading ? (
        <div className="text-center">
          <Loading />
          <span>Creating Realm artifacts for you...</span>
        </div>
      ) : (
        BoundStepComponent
      )}
      {currentStep !== RealmWizardStep.SELECT_MODE && ctl && (
        <>
          <Button
            onClick={() => handleStepSelection(StepDirection.PREV)}
            className="mr-3"
          >
            Previous
          </Button>
          <Button
            onClick={() => {
              if (ctl.isLastStep()) handleCreateRealm()
              else handleStepSelection(StepDirection.NEXT)
            }}
          >
            {ctl.isLastStep() ? 'Create' : 'Next'}
          </Button>
        </>
      )}
    </div>
  )
}

export default RealmWizard
