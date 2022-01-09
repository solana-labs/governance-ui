import Link from 'next/link'
import { ArrowLeftIcon } from '@heroicons/react/outline'

import TokenBalanceCard from '@components/TokenBalanceCard'
import useRealm from '@hooks/useRealm'

import useQueryContext from '@hooks/useQueryContext'
import Input from '@components/inputs/Input'
import Textarea from '@components/inputs/Textarea'
import Select from '@components/inputs/Select'
import React, { createContext, useEffect, useState } from 'react'
import Button, { LinkButton, SecondaryButton } from '@components/Button'
import SplTokenTransfer from './components/instructions/SplTokenTransfer'
import { RpcContext } from '@models/core/api'
import { createProposal } from 'actions/createProposal'
import useWalletStore from 'stores/useWalletStore'
import { getInstructionDataFromBase64 } from '@models/serialisation'
import { PublicKey } from '@solana/web3.js'
import { PlusCircleIcon, XCircleIcon } from '@heroicons/react/outline'
import { notify } from 'utils/notifications'
import * as yup from 'yup'
import { formValidation, isFormValid } from '@utils/formValidation'
import { useRouter } from 'next/router'
import {
  ComponentInstructionData,
  UiInstruction,
  Instructions,
  InstructionsContext,
} from '@utils/uiTypes/proposalCreationTypes'
import useGovernanceAssets from '@hooks/useGovernanceAssets'
import { ParsedAccount } from '@models/core/accounts'
import { Governance, GovernanceAccountType } from '@models/accounts'
import InstructionContentContainer from './components/InstructionContentContainer'
import ProgramUpgrade from './components/instructions/ProgramUpgrade'
import Empty from './components/instructions/Empty'
import Mint from './components/instructions/Mint'
import CustomBase64 from './components/instructions/CustomBase64'
import { getTimestampFromDays } from '@tools/sdk/units'
import MakeChangeMaxAccounts from './components/instructions/Mango/MakeChangeMaxAccounts'
import TreasuryPaymentIcon from '@components/TreasuryPaymentIcon'
import AddMemberIcon from '@components/AddMemberIcon'
import ProgramUpgradeIcon from '@components/ProgramUpgradeIcon'
import MintTokensIcon from '@components/MintTokensIcon'
import TreasuryPaymentForm from '@components/TreasuryAccount/TreasuryPaymentForm'
import Links from '@components/LinksCompactWrapper'
import AddMember from '@components/Members/AddMember'
import UpgradeProgramForm from '@components/AssetsList/UpgradeProgram'
import UpgradeProgramNewForm from '@components/AssetsList/UpgradeProgramForm'
import Spinner from '@components/Spinner'
import AddMemberFormFullScreen from './FullscreenViews/AddMemberForm'
import TreasuryPaymentFormFullScreen from './FullscreenViews/TreasuryPaymentForm'
import OptionalForm from './FullscreenViews/OptionalForm'
import { tooltipMessage } from './components/TooltipMessages'

const schema = yup.object().shape({
  title: yup.string().required('Title is required'),
})
const defaultGovernanceCtx: InstructionsContext = {
  instructionsData: [],
  handleSetInstructions: () => null,
  governance: null,
  setGovernance: () => null,
}
export const NewProposalContext = createContext<InstructionsContext>(
  defaultGovernanceCtx
)

const New = () => {
  const { fmtUrlWithCluster } = useQueryContext()
  const { symbol, realmDisplayName } = useRealm()

  const {
    treasuryPaymentTooltip,
    addNewMemberTooltip,
    programUpgradeTooltip,
    mintTokensTooltip,
  } = tooltipMessage()

  const connected = useWalletStore((s) => s.connected)

  const { getAvailableInstructions } = useGovernanceAssets()
  const availableInstructions = getAvailableInstructions()
  const { fetchTokenAccountsForSelectedRealmGovernances } = useWalletStore(
    (s) => s.actions
  )
  const [form, setForm] = useState({
    title: '',
    description: '',
  })
  const [, /*formErrors*/ setFormErrors] = useState({})
  const [
    governance,
    setGovernance,
  ] = useState<ParsedAccount<Governance> | null>(null)
  const [isLoadingSignedProposal, setIsLoadingSignedProposal] = useState(false)
  const [isLoadingDraft, setIsLoadingDraft] = useState(false)
  const [selectedStep, setSelectedStep] = useState(0)
  const [selectedType, setSelectedType] = useState({
    value: '',
    idx: -1,
  })
  // const isLoading = isLoadingSignedProposal || isLoadingDraft

  // const customInstructionFilterForSelectedGovernance = (
  //   instructionType: Instructions
  // ) => {
  //   if (!governance) {
  //     return true
  //   } else {
  //     const governanceType = governance.info.accountType
  //     const instructionsAvailiableAfterProgramGovernance = [Instructions.Base64]
  //     switch (governanceType) {
  //       case GovernanceAccountType.ProgramGovernance:
  //         return instructionsAvailiableAfterProgramGovernance.includes(
  //           instructionType
  //         )
  //       default:
  //         return true
  //     }
  //   }
  // }

  // const getAvailableInstructionsForIndex = (index) => {
  //   if (index === 0) {
  //     return availableInstructions
  //   } else {
  //     return availableInstructions.filter((x) =>
  //       customInstructionFilterForSelectedGovernance(x.id)
  //     )
  //   }
  // }

  const [instructionsData, setInstructions] = useState<
    ComponentInstructionData[]
  >([{ type: availableInstructions[0] }])
  const handleSetInstructions = (val: any, index) => {
    const newInstructions = [...instructionsData]
    newInstructions[index] = { ...instructionsData[index], ...val }
    setInstructions(newInstructions)
  }

  const handleSetForm = ({ propertyName, value }) => {
    setFormErrors({})
    setForm({ ...form, [propertyName]: value })
  }

  const goToStepTwo = ({ value, idx }) => {
    const newInstruction = {
      type: value,
    }

    setSelectedType({
      value,
      idx,
    })

    setSelectedStep(1)

    handleSetInstructions(newInstruction, idx)
  }

  // const addInstruction = () => {
  //   setInstructions([...instructionsData, { type: undefined }])
  // }

  // const removeInstruction = (idx) => {
  //   setInstructions([...instructionsData.filter((x, index) => index !== idx)])
  // }

  // const handleGetInstructions = async () => {
  //   const instructions: UiInstruction[] = []

  //   for (const inst of instructionsData) {
  //     if (inst.getInstruction) {
  //       const instruction: UiInstruction = await inst?.getInstruction()

  //       instructions.push(instruction)
  //     }
  //   }

  //   return instructions
  // }

  // const handleTurnOffLoaders = () => {
  //   setIsLoadingSignedProposal(false)
  //   setIsLoadingDraft(false)
  // }

  // const checkForDraft = (isDraft) => {
  //   if (isDraft) {
  //     setIsLoadingDraft(true)

  //     return
  //   }

  //   setIsLoadingSignedProposal(true)
  // }

  useEffect(() => {
    const firstInstruction = instructionsData[0]
    if (firstInstruction && firstInstruction.governedAccount) {
      setGovernance(firstInstruction.governedAccount)
    }
  }, [instructionsData[0]])

  useEffect(() => {
    fetchTokenAccountsForSelectedRealmGovernances()
  }, [])

  // const getAvailableInstructionsForIndex = (index) => {
  //   if (index === 0) {
  //     return availableInstructions
  //   }

  //   return []
  // }

  // const availableInstructionsForIdx = getAvailableInstructionsForIndex(0)

  const StepOne = () => {
    return (
      <>
        <div className="w-full flex flex-col gap-y-5 justify-start items-start max-w-md rounded-xl">
          <Button
            onClick={() =>
              goToStepTwo({
                value: 'Transfer Tokens',
                idx: Instructions.TreasuryPaymentForm,
              })
            }
            disabled={treasuryPaymentTooltip !== ''}
            tooltipMessage={treasuryPaymentTooltip}
            className="flex justify-center items-center h-10 w-full"
          >
            <div className="flex justify-center items-center gap-x-3">
              <TreasuryPaymentIcon
                className={`${
                  treasuryPaymentTooltip !== '' && 'opacity-50'
                } w-8`}
                color="#000"
              />

              <span>Treasury payment</span>
            </div>
          </Button>

          <Button
            onClick={() =>
              goToStepTwo({
                value: 'Add Member',
                idx: Instructions.AddMemberForm,
              })
            }
            disabled={addNewMemberTooltip !== ''}
            tooltipMessage={addNewMemberTooltip}
            className="flex justify-center items-center h-10 w-full"
          >
            <div className="flex justify-center items-center gap-x-3">
              <AddMemberIcon
                className={`${addNewMemberTooltip !== '' && 'opacity-50'} w-8`}
                color="#000"
              />

              <span>Add new member</span>
            </div>
          </Button>

          <Button
            onClick={() =>
              goToStepTwo({
                value: 'Program Upgrade',
                idx: Instructions.ProgramUpgrade,
              })
            }
            disabled={programUpgradeTooltip !== ''}
            tooltipMessage={programUpgradeTooltip}
            className="flex justify-center items-center h-10 w-full"
          >
            <div className="flex justify-center items-center gap-x-3">
              <ProgramUpgradeIcon
                className={`${
                  programUpgradeTooltip !== '' && 'opacity-50'
                } w-8`}
                color="#000"
              />

              <span>Upgrade a program</span>
            </div>
          </Button>

          <Button
            onClick={() =>
              goToStepTwo({
                value: 'Mint Tokens',
                idx: Instructions.Mint,
              })
            }
            disabled={mintTokensTooltip !== ''}
            tooltipMessage={mintTokensTooltip}
            className="flex justify-center items-center h-10 w-full"
          >
            <div className="flex justify-center items-center gap-x-3">
              <MintTokensIcon
                className={`${mintTokensTooltip !== '' && 'opacity-50'} w-6`}
                color="#000"
              />

              <span>Mint tokens</span>
            </div>
          </Button>

          <SecondaryButton disabled={!connected} className="w-full h-10">
            Customize your proposal
          </SecondaryButton>
        </div>

        <div className="max-w-xs w-full">
          <TokenBalanceCard />

          <Links />
        </div>
      </>
    )
  }

  const getCurrentInstruction = ({ typeId, idx }) => {
    switch (typeId) {
      case Instructions.Transfer:
        return <TreasuryPaymentForm close={null} />
      case Instructions.ProgramUpgrade:
        return (
          <UpgradeProgramNewForm
            close={null}
            index={idx}
            governance={governance}
          />
        )
      case Instructions.Mint:
        return <Mint index={idx} governance={governance} />
      case Instructions.Base64:
        return <CustomBase64 index={idx} governance={governance} />
      case Instructions.None:
        return <Empty index={idx} governance={governance} />
      case Instructions.MangoMakeChangeMaxAccounts:
        return <MakeChangeMaxAccounts index={idx} governance={governance} />
      case Instructions.AddMemberForm:
        return (
          <AddMemberFormFullScreen
            title={form.title || ''}
            description={form.description || ''}
          />
        )
      case Instructions.TreasuryPaymentForm:
        return (
          <TreasuryPaymentFormFullScreen
            index={idx}
            governance={governance}
            setGovernance={setGovernance}
            title={form.title || ''}
            description={form.description || ''}
          />
        )
      default:
        null
    }
  }

  const StepTwo = () => {
    return (
      <>
        <div className="w-full flex flex-col gap-y-5 justify-start items-start max-w-xl rounded-xl">
          {getCurrentInstruction({
            typeId: selectedType.idx,
            idx: selectedType.idx,
          })}
        </div>

        <div className="max-w-xs w-full mt-6">
          <OptionalForm form={form} handleSetForm={handleSetForm} />

          <TokenBalanceCard />
        </div>
      </>
    )
  }

  const StepThree = () => {
    return <div className="w-full max-w-xl mt-16 rounded-xl">asdasd 3432</div>
  }

  const steps = {
    0: {
      id: 0,
      title: 'Select type',
      label: 'Step 1',
      disabled: false,
      getComponent: () => <StepOne />,
    },
    1: {
      id: 1,
      title: 'Set proposal',
      label: 'Step 2',
      disabled: selectedType.idx === -1,
      getComponent: (selectedType: any) => {
        return (
          <>
            {getCurrentInstruction({
              typeId: selectedType.idx,
              idx: selectedType.idx,
            })}
          </>
        )
      },
    },
    2: {
      id: 2,
      title: 'Share your proposal',
      label: 'Step 3',
      disabled: false,
      getComponent: () => <StepThree />,
    },
  }

  return (
    <NewProposalContext.Provider
      value={{
        instructionsData,
        handleSetInstructions,
        governance,
        setGovernance,
      }}
    >
      <h1 className="my-3">
        Add a proposal
        {realmDisplayName ? ` to ${realmDisplayName}` : ``}{' '}
      </h1>

      <Link href={fmtUrlWithCluster(`/dao/${symbol}/`)}>
        <a className="flex items-center text-fgd-3 font-bold text-base gap-x-2 transition-all hover:text-fgd-1">
          <ArrowLeftIcon className="h-4 w-4 mr-1 text-primary-light" />
          Realm
        </a>
      </Link>

      <div className="w-full my-8">
        <ul className="flex max-w-2xl border-b border-gray-900">
          {Object.values(steps).map((step) => (
            <div
              onClick={() => setSelectedStep(step.id)}
              key={step.id}
              className={`${
                selectedStep === step.id
                  ? 'border-b-4 border-primary-dark'
                  : selectedStep === 1 && step.id === 0
                  ? 'cursor-pointer opacity-50'
                  : 'opacity-50 pointer-events-none'
              } w-full text-left py-4 leading-5 mx-3 font-bold text-white`}
            >
              <p className="text-primary-dark font-light tracking-widest text-xs">
                {step.label.toUpperCase()}
              </p>

              <p className="text-base">{step.title}</p>
            </div>
          ))}
        </ul>

        <div
          className={`${
            selectedStep === 0 ? 'mt-16' : 'mt-8'
          } flex justify-between w-full`}
        >
          {selectedStep === 0 && <StepOne />}
          {selectedStep === 1 && <StepTwo />}
          {selectedStep === 2 && <StepThree />}
        </div>
      </div>
    </NewProposalContext.Provider>
  )
}

export default New
