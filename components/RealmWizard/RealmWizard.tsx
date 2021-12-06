import React, { useState } from 'react'
import BN from 'bn.js'
// import CreateRealmForm from './components/CreateRealmForm'
import Loading from '@components/Loading'
import WizardModeSelect from './components/Steps/WizardModeSelect'
import { notify } from '@utils/notifications'
import { StepOne, StepTwo, StepThree, StepFour } from './components/Steps'
import { useMemo } from 'react'
import {
  RealmArtifacts,
  RealmWizardMode,
  RealmWizardStep,
} from './interfaces/Realm'

const RealmWizard: React.FC = () => {
  const [form, setForm] = useState<RealmArtifacts>({})
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState<RealmWizardStep>(RealmWizardStep.SELECT_MODE)
  const [mode, setMode] = useState<RealmWizardMode>(RealmWizardMode.BASIC)

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
    console.log(option === RealmWizardMode.BASIC, option)
    switch (option) {
      // The most basic scenario where the platform will take care of everything.
      case RealmWizardMode.BASIC:
        setStep(RealmWizardStep.BASIC_CONFIG)
        setMode(option)
        break
      // Scenario: the user already have the mints
      case RealmWizardMode.ADVANCED:
        setMode(option)
        break
      default:
        notify({
          type: 'error',
          message: 'Seems like you have made an invalid choice :/',
        })
    }
  }

  const handleStepSelection = (nextStep: RealmWizardStep) => {
    setStep(nextStep)
  }

  /**
   * Binds the current step to the matching component
   */
  const BoundStepComponent = useMemo(() => {
    switch (step) {
      case RealmWizardStep.SELECT_MODE:
        return <WizardModeSelect onSelect={handleModeSelection} />
      case RealmWizardStep.BASIC_CONFIG:
        return (
          <StepOne
            form={form}
            setForm={handleSetForm}
            onConfirm={handleStepSelection}
          />
        )
      case RealmWizardStep.TOKENS_CONFIG:
        return (
          <StepTwo
            form={form}
            setForm={handleSetForm}
            onConfirm={handleStepSelection}
          />
        )
      case RealmWizardStep.STEP_3:
        return (
          <StepThree
            form={form}
            setForm={handleSetForm}
            onConfirm={handleStepSelection}
          />
        )
      case RealmWizardStep.STEP_4:
        return (
          <StepFour
            form={form}
            setForm={handleSetForm}
            onConfirm={handleStepSelection}
          />
        )
      default:
        return <h4>Sorry, but this step ran away</h4>
    }
  }, [step, form.teamWallets?.length])

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
    </div>
  )
}

export default RealmWizard
