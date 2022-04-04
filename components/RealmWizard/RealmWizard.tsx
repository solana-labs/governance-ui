import React, { useState } from 'react'
import RealmWizardController from './controller/RealmWizardController'
// import CreateRealmForm from './components/CreateRealmForm'
import Loading from '@components/Loading'
import WizardModeSelect from './components/Steps/WizardModeSelect'
import { notify } from '@utils/notifications'
import {
  MultisigOptions,
  BespokeConfig,
  BespokeCouncil,
  BespokeInfo,
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
import { PublicKey } from '@solana/web3.js'
import useWalletStore from 'stores/useWalletStore'
import {
  DEFAULT_GOVERNANCE_PROGRAM_ID,
  DEFAULT_TEST_GOVERNANCE_PROGRAM_ID,
} from '@components/instructions/tools'

import Tooltip from '@components/Tooltip'
import { StyledLabel } from '@components/inputs/styles'
import { createMultisigRealm } from 'actions/createMultisigRealm'
import { ArrowLeftIcon } from '@heroicons/react/solid'
import useQueryContext from '@hooks/useQueryContext'
import router from 'next/router'
import { useEffect } from 'react'
import { CreateFormSchema } from './validators/createRealmValidator'
import { formValidation, isFormValid } from '@utils/formValidation'
import { registerRealm } from 'actions/registerRealm'
import {
  getGovernanceProgramVersion,
  MintMaxVoteWeightSource,
} from '@solana/spl-governance'
import Switch from '@components/Switch'
import { BN } from '@project-serum/anchor'
import BigNumber from 'bignumber.js'

enum LoaderMessage {
  CREATING_ARTIFACTS = 'Creating the DAO artifacts..',
  MINTING_COUNCIL_TOKENS = 'Minting the council tokens..',
  MINTING_COMMUNITY_TOKENS = 'Minting the community tokens..',
  DEPLOYING_REALM = 'Building your DAO...',
  COMPLETING_REALM = 'Finishing the DAO buildings..',
  FINISHED = "DAO successfully created. Redirecting to the DAO's page",
  ERROR = 'We found an error while creating your DAO :/',
}

// TODO: split this component

const RealmWizard: React.FC = () => {
  const { fmtUrlWithCluster } = useQueryContext()
  // const wallet = useWalletStore((s) => s.current)
  const { connection, current: wallet } = useWalletStore((s) => s)
  /**
   * @var {RealmWizardController} ctl
   * The wizard controller instance
   */
  const [ctl, setController] = useState<RealmWizardController>()
  const [testRealmCheck, setTestRealmCheck] = useState(false)
  const [form, setForm] = useState<RealmArtifacts>({
    communityMintMaxVoteWeightSource: '1',
  })
  const [formErrors, setFormErrors] = useState({})
  const [councilSwitchState, setUseCouncil] = useState(true)
  const [isTestProgramId, setIsTestProgramId] = useState(false)

  const [isLoading, setIsLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState<RealmWizardStep>(
    RealmWizardStep.SELECT_MODE
  )
  const [realmAddress] = useState('')
  const [loaderMessage] = useState<LoaderMessage>(LoaderMessage.DEPLOYING_REALM)

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
   * Generate realm artifacts
   */
  const handleCreateMultisigRealm = async () => {
    if (!ctl) return
    if (!wallet?.publicKey || !connection.current) return
    if (!form.name)
      return notify({
        type: 'error',
        message: 'You must set a name for the realm!',
      })

    if (!form.teamWallets?.length)
      return notify({
        type: 'error',
        message: 'Team member wallets are required.',
      })

    if (!form.yesThreshold) {
      return notify({
        type: 'error',
        message: 'Approval quorum required.',
      })
    }

    const programId = testRealmCheck
      ? DEFAULT_TEST_GOVERNANCE_PROGRAM_ID
      : DEFAULT_GOVERNANCE_PROGRAM_ID

    const governanceProgramId = new PublicKey(programId)
    const programVersion = await getGovernanceProgramVersion(
      connection.current,
      governanceProgramId
    )

    console.log('CREATE REALM Program', {
      governanceProgramId: governanceProgramId.toBase58(),
      programVersion,
    })

    const results = await createMultisigRealm(
      connection.current,
      governanceProgramId,
      programVersion,
      form.name,
      form.yesThreshold,
      form.teamWallets.map((w) => new PublicKey(w)),
      wallet
    )

    if (results) {
      router.push(fmtUrlWithCluster(`/dao/${results.realmPk.toBase58()}`))
      return
    }

    notify({
      type: 'error',
      message: 'Something bad happened during this request.',
    })
  }

  /**
   * Get the mint max vote weight parsed to `MintMaxVoteWeightSource`
   */
  const getMintMaxVoteWeight = () => {
    let value = MintMaxVoteWeightSource.FULL_SUPPLY_FRACTION.value
    if (form.communityMintMaxVoteWeightSource) {
      const fraction = new BigNumber(form.communityMintMaxVoteWeightSource)
        .shiftedBy(MintMaxVoteWeightSource.SUPPLY_FRACTION_DECIMALS)
        .toString()
      value = new BN(fraction)
    }

    return new MintMaxVoteWeightSource({
      value,
    })
  }

  /**
   * Get the array of wallets parsed into public keys or undefined if not eligible
   */
  const getTeamWallets = (): PublicKey[] | undefined =>
    form.teamWallets ? form.teamWallets.map((w) => new PublicKey(w)) : undefined

  const handleCreateBespokeRealm = async () => {
    setFormErrors({})

    const { isValid, validationErrors }: formValidation = await isFormValid(
      CreateFormSchema,
      form
    )

    if (isValid) {
      try {
        const governanceProgramId = new PublicKey(form.governanceProgramId!)
        const programVersion = await getGovernanceProgramVersion(
          connection.current,
          governanceProgramId
        )

        console.log('CREATE REALM Program', {
          governanceProgramId: governanceProgramId.toBase58(),
          programVersion,
        })

        const realmAddress = await registerRealm(
          {
            connection,
            wallet: wallet!,
            walletPubkey: wallet!.publicKey!,
          },
          governanceProgramId,
          programVersion,
          form.name!,
          form.communityMintId
            ? new PublicKey(form.communityMintId)
            : undefined,
          form.councilMintId ? new PublicKey(form.councilMintId) : undefined,
          getMintMaxVoteWeight(),
          form.minCommunityTokensToCreateGovernance!,
          form.yesThreshold,
          form.communityMintId ? form.transferAuthority : true,
          form.communityMint ? form.communityMint.account.decimals : undefined,
          form.councilMint ? form.councilMint.account.decimals : undefined,
          getTeamWallets()
        )
        router.push(fmtUrlWithCluster(`/dao/${realmAddress.toBase58()}`))
      } catch (error) {
        notify({
          type: 'error',
          message: error.message,
        })
      }
    } else {
      console.debug(validationErrors)
      setFormErrors(validationErrors)
    }
    setIsLoading(false)
  }

  /**
   * Handles and set the selected mode
   * @param option the selected mode
   */
  const handleModeSelection = (option: RealmWizardMode) => {
    try {
      const ctl = new RealmWizardController(option)
      const nextStep = ctl.getNextStep(currentStep, StepDirection.NEXT)
      handleSetForm({
        governanceProgramId:
          process.env.DEFAULT_GOVERNANCE_PROGRAM_ID ??
          DEFAULT_GOVERNANCE_PROGRAM_ID,
        yesThreshold: 60,
      })
      setController(ctl)
      setCurrentStep(nextStep)
    } catch (error: any) {
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
    if (!wallet?.publicKey || !connection.current)
      return notify({
        type: 'error',
        message: 'Wallet not connected',
      })
    // Handles the current misuse of the CreateRealmForm
    if (ctl) {
      try {
        setIsLoading(true)

        switch (ctl.getMode()) {
          case RealmWizardMode.BASIC:
            await handleCreateMultisigRealm()
            break
          case RealmWizardMode.ADVANCED:
            await handleCreateBespokeRealm()
            break
          default:
            throw new Error('Mode not available.')
        }
      } catch (error) {
        const err = error as Error
        setIsLoading(false)
        notify({
          type: 'error',
          message: err.message,
        })
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleBackButtonClick = () => {
    if (ctl && !ctl.isModeSelect()) {
      setCurrentStep(ctl.getNextStep(currentStep, StepDirection.PREV))
    } else {
      router.push(fmtUrlWithCluster('/realms'))
    }
  }

  const isCreateButtonDisabled = () =>
    ctl && ctl.getMode() === RealmWizardMode.ADVANCED
      ? false
      : !form.teamWallets?.length || !form.name

  const canGoNext = (step: RealmWizardStep): boolean => {
    if (step === RealmWizardStep.BESPOKE_CONFIG) {
      const errors: any = {}
      !form.name ? (errors.name = 'Name is required') : null
      !form.governanceProgramId
        ? (errors.governanceProgramId = 'Governance Program ID is required')
        : null

      setFormErrors(errors)

      return !Object.values(errors).length
    }

    return true
  }

  const onClickNext = (): boolean => {
    if (ctl)
      switch (ctl.getMode()) {
        case RealmWizardMode.ADVANCED:
          return canGoNext(ctl.getCurrentStep())
        default:
          return false
      }
    return false
  }

  /**
   * Binds the current step to the matching component
   */
  const BoundStepComponent = useMemo(() => {
    switch (currentStep) {
      case RealmWizardStep.SELECT_MODE:
        return <WizardModeSelect onSelect={handleModeSelection} />
      case RealmWizardStep.MULTISIG_CONFIG:
        return <MultisigOptions form={form} setForm={handleSetForm} />
      case RealmWizardStep.BESPOKE_CONFIG:
        return (
          <BespokeConfig
            form={form}
            setForm={handleSetForm}
            formErrors={formErrors}
            isTestProgramId={isTestProgramId}
            onSwitch={(x: boolean) => {
              setIsTestProgramId(x)
              handleSetForm({
                governanceProgramId: x
                  ? DEFAULT_TEST_GOVERNANCE_PROGRAM_ID
                  : DEFAULT_GOVERNANCE_PROGRAM_ID,
              })
            }}
          />
        )
      case RealmWizardStep.BESPOKE_COUNCIL:
        return (
          <BespokeCouncil
            form={form}
            setForm={handleSetForm}
            formErrors={formErrors}
            setFormErrors={setFormErrors}
            onSwitch={(x: boolean) => {
              setUseCouncil(x)
            }}
            switchState={councilSwitchState}
          />
        )
      case RealmWizardStep.BESPOKE_INFO:
        return (
          <BespokeInfo
            form={form}
            setForm={handleSetForm}
            formErrors={formErrors}
          />
        )
      case RealmWizardStep.REALM_CREATED:
        return <RealmCreated realmAddress={realmAddress} />
      default:
        return <h4>Sorry, but this step ran away</h4>
    }
  }, [currentStep, form, formErrors, councilSwitchState])

  useEffect(() => {
    // Return shouldFireCreate to the base state
    if (Object.values(formErrors).length) setFormErrors({})
  }, [form])

  return (
    <div
      className="relative w-auto"
      style={
        ctl &&
        ctl.getCurrentStep() !== RealmWizardStep.SELECT_MODE &&
        !isLoading
          ? { maxWidth: 512 }
          : undefined
      }
    >
      <div className="pointer">
        <a
          className="flex items-center text-fgd-3 text-sm transition-all hover:text-fgd-1"
          onClick={handleBackButtonClick}
        >
          <ArrowLeftIcon className="h-4 w-4 mr-1 text-primary-light" />
          Back
        </a>
      </div>
      {isLoading ? (
        <div className="text-center">
          <Loading />
          <span>{loaderMessage}</span>
        </div>
      ) : (
        <div className="min-h-[60vh]">{BoundStepComponent}</div>
      )}
      {ctl && !(ctl.isModeSelect() || isLoading) && (
        <>
          <div
            className={`flex justify-${
              ctl.getMode() === RealmWizardMode.BASIC ? 'between' : 'end'
            } pr-10 mr-3 mt-10`}
          >
            {ctl.getMode() === RealmWizardMode.BASIC && ctl.isLastStep() && (
              <div className="flex justify-left items-center">
                <Switch
                  className="mt-2 mb-2"
                  checked={testRealmCheck}
                  onChange={(check) => {
                    setTestRealmCheck(check)
                  }}
                />
                <Tooltip content="If checked, the realm will NOT be created under the main Governance Instance">
                  <StyledLabel className="mt-1.5 ml-3">
                    Create a test DAO
                  </StyledLabel>
                </Tooltip>
              </div>
            )}
            {!ctl.isFirstStep() ? (
              <Button
                onClick={() => {
                  handleStepSelection(StepDirection.PREV)
                }}
                className="px-10 mr-5"
                style={{ minWidth: '142px' }}
              >
                Previous
              </Button>
            ) : (
              <p>&nbsp;</p>
            )}

            <Button
              onClick={() => {
                if (ctl.isLastStep()) handleCreateRealm()
                else if (onClickNext()) handleStepSelection(StepDirection.NEXT)
              }}
              disabled={isCreateButtonDisabled()}
              className={ctl.isLastStep() ? 'px-5' : 'px-10'}
              style={{ minWidth: '142px' }}
            >
              {ctl.isLastStep() ? 'Create DAO' : 'Next'}
            </Button>
          </div>
        </>
      )}
    </div>
  )
}

export default RealmWizard
