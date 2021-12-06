import React, { useEffect, useState } from 'react'
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
import { formValidation, isFormValid } from '@utils/formValidation'
import { CreateFormSchema } from './validators/create-realm-validator'
import { tryGetMint } from '@utils/tokens'
import { PublicKey } from '@solana/web3.js'
import { getMintDecimalAmount } from '@tools/sdk/units'
import useWalletStore from 'stores/useWalletStore'
import _ from 'lodash'

const RealmWizard: React.FC = () => {
  // const wallet = useWalletStore((s) => s.current)
  const connection = useWalletStore((s) => s.connection)
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
  const generateProgramArtifacts = async () => {
    setIsLoading(true)
    const artifacts: RealmArtifacts = {
      // name: 'Realm-EZUBS',
      programVersion: 1,
      governanceProgramId: 'GovER5Lthms3bLBqWub97yVrMmEogzX7xNjdXpPPCVZw',
      communityMintId: 'EZUBSaFK4jVPxk5ChMmbNGtiXkRsuf1E2soDi5GmcdCN',
      councilMintId: '9DPEfrW5y1AoB1B2NU77BQmEDJvrtkxJTQE2pr729DAm',
      minCommunityTokensToCreateGovernance: new BN(1000000),
    }

    if (artifacts?.councilMintId) {
      await handleCouncilMint(artifacts.councilMintId)
    }
    if (artifacts?.communityMintId) {
      await handleCommunityMint(artifacts.communityMintId)
    }

    setIsLoading(false)

    return artifacts
  }

  const handleCommunityMint = async (mintId: string) => {
    try {
      const mintPublicKey = new PublicKey(mintId)
      const mint = await tryGetMint(connection.current, mintPublicKey)
      if (mint) {
        const supply = mint.account.supply
        if (supply.gt(new BN(0))) {
          handleSetForm({
            minCommunityTokensToCreateGovernance: BN.max(
              new BN(1),
              // divide by 100 for a percentage
              new BN(
                getMintDecimalAmount(mint.account, supply)
                  .dividedBy(100)
                  .toString()
              )
            ),
            communityMint: mint,
          })
        } else {
          handleSetForm({
            communityMint: mint,
          })
        }
      }
    } catch (e) {
      console.log('failed to set community mint', e)
    }
  }

  const handleCouncilMint = async (mintId: string) => {
    try {
      const mintPublicKey = new PublicKey(mintId)
      const mint = await tryGetMint(connection.current, mintPublicKey)
      if (mint) {
        handleSetForm({
          councilMint: mint,
        })
      }
    } catch (e) {
      console.log('failed to set council mint', e)
    }
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

  const handleCreateRealm = async () => {
    const artifacts = await generateProgramArtifacts()
    const generatedForm = {
      ...form,
      ...artifacts,
    }
    setForm(form)

    const { isValid, validationErrors }: formValidation = await isFormValid(
      CreateFormSchema,
      generatedForm
    )
    if (isValid) {
      console.log({ generatedForm }, 'is valid')
    } else {
      console.log({ generatedForm, validationErrors })
      notify({
        type: 'error',
        message: 'The form is invalid.',
      })
    }
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
      {ctl && !ctl.isFirstStep() && (
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
