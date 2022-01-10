import Link from 'next/link'
import { ArrowLeftIcon, CheckCircleIcon } from '@heroicons/react/outline'

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
import Empty from './FullscreenViews/None'
import Mint from './components/instructions/Mint'
import CustomBase64 from './FullscreenViews/CustomBase64'
import { getTimestampFromDays } from '@tools/sdk/units'
import MakeChangeMaxAccounts from './FullscreenViews/MakeChangeMaxAccounts'
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
import { tooltipMessage } from './components/TooltipMessages'
import Modal from '@components/Modal'
import MintTokens from './FullscreenViews/MintTokens'
import ProgramUpgrade from './FullscreenViews/ProgramUpgrade'
import MangoMakeIcon from '@components/MangoMakeIcon'
import CodeIcon from '@components/CodeIcon'

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

export type OptionalForm = {
  description?: string
  title?: string
}

const New = () => {
  const { fmtUrlWithCluster } = useQueryContext()
  const { symbol, realmDisplayName } = useRealm()
  const router = useRouter()

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
  const [form, setForm] = useState<OptionalForm>({
    title: '',
    description: '',
  })
  const [formErrors, setFormErrors] = useState({})
  const [dataCreation, setDataCreation] = useState<any>(undefined)
  const [proposalAddress, setProposalAddress] = useState<any>(undefined)
  const [
    governance,
    setGovernance,
  ] = useState<ParsedAccount<Governance> | null>(null)
  const [openCustom, setOpenCustom] = useState(false)
  const [openErrorDetails, setOpenErrorDetails] = useState(false)
  const [selectedStep, setSelectedStep] = useState(0)
  const [selectedType, setSelectedType] = useState({
    value: '',
    idx: -1,
  })

  const [instructionsData, setInstructions] = useState<
    ComponentInstructionData[]
  >([{ type: availableInstructions[0] }])
  const handleSetInstructions = (val: any, index) => {
    const newInstructions = [...instructionsData]
    newInstructions[index] = { ...instructionsData[index], ...val }
    setInstructions(newInstructions)
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

  useEffect(() => {
    const firstInstruction = instructionsData[0]
    if (firstInstruction && firstInstruction.governedAccount) {
      setGovernance(firstInstruction.governedAccount)
    }
  }, [instructionsData[0]])

  useEffect(() => {
    fetchTokenAccountsForSelectedRealmGovernances()
  }, [])

  const StepOne = () => {
    return (
      <>
        <div className="w-full flex flex-col gap-y-5 justify-start items-start max-w-md rounded-xl">
          <Button
            onClick={() =>
              goToStepTwo({
                value: 'Transfer Tokens',
                idx: Instructions.Transfer,
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
                color={`${treasuryPaymentTooltip !== '' ? '#FFF' : '#000'}`}
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
                className="w-6"
                color={`${addNewMemberTooltip !== '' ? '#FFF' : '#000'}`}
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
                className="w-6"
                color={`${programUpgradeTooltip !== '' ? '#FFF' : '#000'}`}
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
                className="w-6"
                color={`${mintTokensTooltip !== '' ? '#FFF' : '#000'}`}
              />

              <span>Mint tokens</span>
            </div>
          </Button>

          <Button
            onClick={() =>
              goToStepTwo({
                value: 'Mango',
                idx: Instructions.MangoMakeChangeMaxAccounts,
              })
            }
            disabled={mintTokensTooltip !== ''}
            tooltipMessage={mintTokensTooltip}
            className="flex justify-center items-center h-10 w-full"
          >
            <div className="flex justify-center items-center gap-x-3">
              <MangoMakeIcon
                className="w-6"
                color={`${mintTokensTooltip !== '' ? '#FFF' : '#000'}`}
              />

              <span>Mango - Change max accounts</span>
            </div>
          </Button>

          <Button
            onClick={() =>
              goToStepTwo({
                value: 'Mint Tokens',
                idx: Instructions.Base64,
              })
            }
            disabled={mintTokensTooltip !== ''}
            tooltipMessage={mintTokensTooltip}
            className="flex justify-center items-center h-10 w-full"
          >
            <div className="flex justify-center items-center gap-x-3">
              <CodeIcon
                className="w-6"
                color={`${mintTokensTooltip !== '' ? '#FFF' : '#000'}`}
              />

              <span>Custom instruction</span>
            </div>
          </Button>

          <SecondaryButton
            onClick={() => setOpenCustom(true)}
            disabled={!connected}
            className="w-full h-10"
          >
            No instruction - Vote only
          </SecondaryButton>

          {openCustom && (
            <Modal
              sizeClassName="max-w-xl"
              background="bg-bkg-1"
              isOpen={openCustom}
              onClose={() => setOpenCustom(false)}
            >
              <Empty
                setGovernance={setGovernance}
                index={Instructions.None}
                governance={governance}
              />
            </Modal>
          )}
        </div>

        <div className="max-w-xs w-full">
          <TokenBalanceCard />

          <Links />
        </div>
      </>
    )
  }

  const goToStepThree = (data?: any) => {
    setDataCreation(data)
    setSelectedStep(2)
  }

  const getCurrentInstruction = ({ typeId, idx }) => {
    switch (typeId) {
      case Instructions.Transfer:
        return (
          <TreasuryPaymentFormFullScreen
            index={idx}
            governance={governance}
            setGovernance={setGovernance}
            nextStep={goToStepThree}
          />
        )
      case Instructions.ProgramUpgrade:
        return (
          <ProgramUpgrade
            setGovernance={setGovernance}
            index={idx}
            governance={governance}
          />
        )
      case Instructions.Mint:
        return (
          <MintTokens
            setGovernance={setGovernance}
            index={idx}
            governance={governance}
          />
        )
      case Instructions.Base64:
        return (
          <CustomBase64
            setGovernance={setGovernance}
            index={idx}
            governance={governance}
          />
        )
      case Instructions.None:
        return (
          <Empty
            setGovernance={setGovernance}
            index={idx}
            governance={governance}
          />
        )
      case Instructions.MangoMakeChangeMaxAccounts:
        return (
          <MakeChangeMaxAccounts
            setGovernance={setGovernance}
            index={idx}
            governance={governance}
          />
        )
      case Instructions.AddMemberForm:
        return (
          <AddMemberFormFullScreen
            title={form.title || ''}
            nextStep={goToStepThree}
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
        <div className="w-full">
          {getCurrentInstruction({
            typeId: selectedType.idx,
            idx: selectedType.idx,
          })}
        </div>
      </>
    )
  }

  const ErrorDetailsCard = () => {
    return (
      <div>
        <h2>Error log</h2>

        <p className="bg-bkg-2 p-2 my-6 rounded-lg">
          {`${dataCreation.error}`}
        </p>

        <div className="flex justify-start gap-x-4 mt-8 items-center">
          <SecondaryButton
            className="w-36"
            onClick={() => setOpenErrorDetails(!openErrorDetails)}
          >
            Close
          </SecondaryButton>

          <Button
            className="w-36 flex justify-center items-center"
            onClick={() => {
              navigator.clipboard.writeText(`${dataCreation.error}`)
            }}
          >
            Copy
          </Button>
        </div>
      </div>
    )
  }

  const StepThree = () => {
    const index = String(dataCreation.error).indexOf(':')

    return (
      <div className="w-full max-w-xl mt-16 rounded-xl">
        {dataCreation.error ? (
          <>
            <div className="flex justify-center gap-x-3 items-start">
              <XCircleIcon className="w-12 h-12 text-red" />

              <div className="flex gap-y-2 flex-col">
                <h2>Could not create proposal</h2>

                {`${
                  index > -1
                    ? dataCreation.error.toString().slice(index + 1)
                    : dataCreation.error
                }`}

                <div className="flex justify-center gap-x-4 mt-4 items-center">
                  <SecondaryButton
                    className="w-36"
                    onClick={() => setOpenErrorDetails(!openErrorDetails)}
                  >
                    See details
                  </SecondaryButton>

                  <Button
                    className="w-36 flex justify-center items-center"
                    onClick={() => setSelectedStep(0)}
                  >
                    Try again
                  </Button>
                </div>
              </div>
            </div>

            {openErrorDetails && (
              <Modal
                onClose={() => setOpenErrorDetails(false)}
                isOpen={openErrorDetails}
                background="bg-bkg-1"
              >
                <ErrorDetailsCard />
              </Modal>
            )}
          </>
        ) : (
          <>
            <div className="flex justify-center gap-x-3 items-start">
              <CheckCircleIcon className="w-12 h-12 text-green" />

              <div className="flex gap-y-2 flex-col">
                <h2>Proposal created successfully</h2>

                <p>Share the link to your proposal for members start voting</p>

                <div className="flex justify-center gap-x-4 mt-4 items-center">
                  <SecondaryButton
                    className="w-44"
                    onClick={() => {
                      navigator.clipboard.writeText(`${dataCreation.url}`)
                    }}
                  >
                    Copy link
                  </SecondaryButton>

                  <Button
                    className="w-44 flex justify-center items-center"
                    onClick={() => {
                      router.push(dataCreation.url)
                    }}
                  >
                    See proposal
                  </Button>
                </div>
              </div>
            </div>

            {openErrorDetails && (
              <Modal
                onClose={() => setOpenErrorDetails(false)}
                isOpen={openErrorDetails}
                background="bg-bkg-1"
              >
                <ErrorDetailsCard />
              </Modal>
            )}
          </>
        )}
      </div>
    )
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

        <div className={`mt-16 flex justify-between w-full`}>
          {selectedStep === 0 && <StepOne />}
          {selectedStep === 1 && <StepTwo />}
          {selectedStep === 2 && <StepThree />}
        </div>
      </div>
    </NewProposalContext.Provider>
  )
}

export default New
