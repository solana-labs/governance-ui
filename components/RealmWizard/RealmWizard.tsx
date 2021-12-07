import React, { useEffect, useState } from 'react'
import RealmWizardController from './controller/RealmWizardController'
import BN from 'bn.js'
// import CreateRealmForm from './components/CreateRealmForm'
import Loading from '@components/Loading'
import WizardModeSelect from './components/Steps/WizardModeSelect'
import { notify } from '@utils/notifications'
import {
  StepOne,
  StepTwo,
  StepThree,
  StepFour,
  RealmCreated,
} from './components/Steps'
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
import { registerRealm } from 'actions/registerRealm'

const LOADER_MESSAGES = {
  CREATING_ARTIFACTS: 'Creating the Realm Artifacts..',
  MINTING_COUNCIL_TOKENS: 'Minting the council tokens..',
  MINTING_COMMUNITY_TOKENS: 'Minting the community tokens..',
  DEPLOYING_REALM: 'Deploying the Realm..',
  COMPLETING_REALM: 'Finishing the Realm buildings..',
  FINISHED: 'Realm successfully created.',
  ERROR: 'We found an error while creating your Realm :/',
}

const RealmWizard: React.FC = () => {
  // const wallet = useWalletStore((s) => s.current)
  const { connection, current: wallet } = useWalletStore((s) => s)
  /**
   * The wizard controller instance
   */
  const [ctl, setController] = useState<RealmWizardController>()

  const [form, setForm] = useState<RealmArtifacts>({})
  const [isLoading, setIsLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState<RealmWizardStep>(
    RealmWizardStep.SELECT_MODE
  )
  const [realmAddress, setRealmAddress] = useState('')
  const [loaderMessage, setLoaderMessage] = useState('')

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
    if (!ctl) return
    if (!wallet || !connection) {
      notify({ type: 'error', message: 'Wallet not connected!' })
      return
    }

    setIsLoading(true)
    setLoaderMessage(LOADER_MESSAGES.CREATING_ARTIFACTS)
    let artifacts: RealmArtifacts = {
      // name: 'Realm-EZUBS',
      programVersion: 1,
      governanceProgramId: 'GovER5Lthms3bLBqWub97yVrMmEogzX7xNjdXpPPCVZw',
      communityMintId: '8sJ4PFZWaoLtSrQEz5CCSFdnQn1ysRXptSqo4Mm5th3Z',
      councilMintId: 'ANp8emegzk4uhYQynsyDeC2KjYXbn4Jc3h3bV71PHnRE',
      minCommunityTokensToCreateGovernance: new BN(1000000),
    }

    if (artifacts?.councilMintId) {
      setLoaderMessage(LOADER_MESSAGES.MINTING_COUNCIL_TOKENS)
      const councilMintInfo = await handleCouncilMint(artifacts.councilMintId)
      artifacts = {
        ...artifacts,
        ...councilMintInfo,
      }
    }
    if (artifacts?.communityMintId) {
      setLoaderMessage(LOADER_MESSAGES.MINTING_COMMUNITY_TOKENS)
      const communityMintInfo = await handleCommunityMint(
        artifacts.communityMintId
      )
      artifacts = {
        ...artifacts,
        ...communityMintInfo,
      }
    }
    return artifacts
  }

  const handleCommunityMint = async (mintId: string) => {
    try {
      const mintPublicKey = new PublicKey(mintId)
      const mint = await tryGetMint(connection.current, mintPublicKey)
      if (mint) {
        let mintInfo
        const supply = mint.account.supply
        if (supply.gt(new BN(0))) {
          mintInfo = {
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
          }
          handleSetForm({ ...mintInfo })
        } else {
          mintInfo = {
            communityMint: mint,
          }
          handleSetForm({ ...mintInfo })
        }
        return mintInfo
      }
    } catch (e) {
      console.log('failed to set community mint', e)
    }
    return undefined
  }

  const handleCouncilMint = async (mintId: string) => {
    try {
      const mintPublicKey = new PublicKey(mintId)
      const mint = await tryGetMint(connection.current, mintPublicKey)
      if (mint) {
        handleSetForm({
          councilMint: mint,
        })
        return { councilMint: mint }
      }
    } catch (e) {
      console.log('failed to set council mint', e)
    }
    return undefined
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

    if (isValid && ctl && wallet) {
      setLoaderMessage(LOADER_MESSAGES.DEPLOYING_REALM)
      try {
        const calldata = ctl.prepareData(wallet, connection, generatedForm)
        const realmAddress = await registerRealm(
          calldata.rpc,
          calldata.name,
          calldata.communityMintId,
          calldata.councilMintId,
          calldata.voteWeight,
          calldata.minCommunityTokens
        )
        setLoaderMessage(LOADER_MESSAGES.COMPLETING_REALM)
        setRealmAddress(realmAddress.toBase58())
        console.log(realmAddress)
        setLoaderMessage(LOADER_MESSAGES.FINISHED)
        handleStepSelection(StepDirection.NEXT)
      } catch (error) {
        notify({
          type: 'error',
          message: error.message,
        })
        setLoaderMessage(LOADER_MESSAGES.ERROR)
      } finally {
        setIsLoading(false)
      }
    } else {
      notify({
        type: 'error',
        message: 'Something happened during the validation of your Realm.',
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
      case RealmWizardStep.REALM_CREATED:
        return <RealmCreated realmAddress={realmAddress} />
      default:
        return <h4>Sorry, but this step ran away</h4>
    }
  }, [currentStep, form])

  return (
    <div className="relative">
      {isLoading ? (
        <div className="text-center">
          <Loading />
          <span>{loaderMessage}</span>
        </div>
      ) : (
        BoundStepComponent
      )}
      {ctl && !(ctl.isFirstStep() || isLoading) && (
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
            disabled={!form.teamWallets?.length}
          >
            {ctl.isLastStep() ? 'Create' : 'Next'}
          </Button>
        </>
      )}
    </div>
  )
}

export default RealmWizard
