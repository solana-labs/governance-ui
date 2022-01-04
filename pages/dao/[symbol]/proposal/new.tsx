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
import VoteBySwitch from './components/VoteBySwitch'
import { Tab } from '@headlessui/react'
import CloudIcon from '@components/CloudIcon'
import DocIcon from '@components/DocIcon'
import LinkIcon from '@components/LinkIcon'
import TreasuryPaymentIcon from '@components/TreasuryPaymentIcon'
import AddMemberIcon from '@components/AddMemberIcon'
import ProgramUpgradeIcon from '@components/ProgramUpgradeIcon'
import MintTokensIcon from '@components/MintTokensIcon'

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
  const router = useRouter()
  const { fmtUrlWithCluster } = useQueryContext()
  const {
    symbol,
    realm,
    realmInfo,
    realmDisplayName,
    ownVoterWeight,
    mint,
    councilMint,
    canChooseWhoVote,
  } = useRealm()

  const { getAvailableInstructions } = useGovernanceAssets()
  const availableInstructions = getAvailableInstructions()
  const wallet = useWalletStore((s) => s.current)
  const connection = useWalletStore((s) => s.connection)
  const {
    fetchRealmGovernance,
    fetchTokenAccountsForSelectedRealmGovernances,
  } = useWalletStore((s) => s.actions)
  const [voteByCouncil, setVoteByCouncil] = useState(false)
  const [form, setForm] = useState({
    title: '',
    description: '',
  })
  const [formErrors, setFormErrors] = useState({})
  const [
    governance,
    setGovernance,
  ] = useState<ParsedAccount<Governance> | null>(null)
  const [isLoadingSignedProposal, setIsLoadingSignedProposal] = useState(false)
  const [isLoadingDraft, setIsLoadingDraft] = useState(false)
  const isLoading = isLoadingSignedProposal || isLoadingDraft
  const customInstructionFilterForSelectedGovernance = (
    instructionType: Instructions
  ) => {
    if (!governance) {
      return true
    } else {
      const governanceType = governance.info.accountType
      const instructionsAvailiableAfterProgramGovernance = [Instructions.Base64]
      switch (governanceType) {
        case GovernanceAccountType.ProgramGovernance:
          return instructionsAvailiableAfterProgramGovernance.includes(
            instructionType
          )
        default:
          return true
      }
    }
  }

  const getAvailableInstructionsForIndex = (index) => {
    if (index === 0) {
      return availableInstructions
    } else {
      return availableInstructions.filter((x) =>
        customInstructionFilterForSelectedGovernance(x.id)
      )
    }
  }
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
  const setInstructionType = ({ value, idx }) => {
    const newInstruction = {
      type: value,
    }
    handleSetInstructions(newInstruction, idx)
  }
  const addInstruction = () => {
    setInstructions([...instructionsData, { type: undefined }])
  }
  const removeInstruction = (idx) => {
    setInstructions([...instructionsData.filter((x, index) => index !== idx)])
  }
  const handleGetInstructions = async () => {
    const instructions: UiInstruction[] = []
    for (const inst of instructionsData) {
      if (inst.getInstruction) {
        const instruction: UiInstruction = await inst?.getInstruction()
        instructions.push(instruction)
      }
    }
    return instructions
  }
  const handleTurnOffLoaders = () => {
    setIsLoadingSignedProposal(false)
    setIsLoadingDraft(false)
  }
  const handleCreate = async (isDraft) => {
    setFormErrors({})
    if (isDraft) {
      setIsLoadingDraft(true)
    } else {
      setIsLoadingSignedProposal(true)
    }

    const { isValid, validationErrors }: formValidation = await isFormValid(
      schema,
      form
    )

    const instructions: UiInstruction[] = await handleGetInstructions()
    let proposalAddress: PublicKey | null = null
    if (!realm) {
      handleTurnOffLoaders()
      throw 'No realm selected'
    }

    if (isValid && instructions.every((x: UiInstruction) => x.isValid)) {
      let selectedGovernance = governance
      if (!governance) {
        handleTurnOffLoaders()
        throw Error('No governance selected')
      }

      const rpcContext = new RpcContext(
        new PublicKey(realm.account.owner.toString()),
        realmInfo?.programVersion,
        wallet,
        connection.current,
        connection.endpoint
      )
      const instructionsData = instructions.map((x) => {
        return {
          data: x.serializedInstruction
            ? getInstructionDataFromBase64(x.serializedInstruction)
            : null,
          holdUpTime: x.customHoldUpTime
            ? getTimestampFromDays(x.customHoldUpTime)
            : selectedGovernance?.info?.config.minInstructionHoldUpTime,
          prerequisiteInstructions: x.prerequisiteInstructions || [],
        }
      })

      try {
        // Fetch governance to get up to date proposalCount
        selectedGovernance = (await fetchRealmGovernance(
          governance.pubkey
        )) as ParsedAccount<Governance>

        const ownTokenRecord = ownVoterWeight.getTokenRecordToCreateProposal(
          governance.info.config
        )
        const defaultProposalMint = !mint?.supply.isZero()
          ? realm.info.communityMint
          : !councilMint?.supply.isZero()
          ? realm.info.config.councilMint
          : undefined

        const proposalMint =
          canChooseWhoVote && voteByCouncil
            ? realm.info.config.councilMint
            : defaultProposalMint

        if (!proposalMint) {
          throw new Error(
            'There is no suitable governing token for the proposal'
          )
        }

        proposalAddress = await createProposal(
          rpcContext,
          realm.pubkey,
          selectedGovernance.pubkey,
          ownTokenRecord.pubkey,
          form.title,
          form.description,
          proposalMint,
          selectedGovernance?.info?.proposalCount,
          instructionsData,
          isDraft
        )

        const url = fmtUrlWithCluster(
          `/dao/${symbol}/proposal/${proposalAddress}`
        )

        router.push(url)
      } catch (ex) {
        notify({ type: 'error', message: `${ex}` })
      }
    } else {
      setFormErrors(validationErrors)
    }
    handleTurnOffLoaders()
  }
  useEffect(() => {
    setInstructions([instructionsData[0]])
  }, [instructionsData[0].governedAccount?.pubkey])

  useEffect(() => {
    const firstInstruction = instructionsData[0]
    if (firstInstruction && firstInstruction.governedAccount) {
      setGovernance(firstInstruction.governedAccount)
    }
  }, [instructionsData[0]])
  useEffect(() => {
    //fetch to be up to date with amounts
    fetchTokenAccountsForSelectedRealmGovernances()
  }, [])

  const getCurrentInstruction = ({ typeId, idx }) => {
    switch (typeId) {
      case Instructions.Transfer:
        return (
          <SplTokenTransfer
            index={idx}
            governance={governance}
          ></SplTokenTransfer>
        )
      case Instructions.ProgramUpgrade:
        return (
          <ProgramUpgrade index={idx} governance={governance}></ProgramUpgrade>
        )
      case Instructions.Mint:
        return <Mint index={idx} governance={governance}></Mint>
      case Instructions.Base64:
        return <CustomBase64 index={idx} governance={governance}></CustomBase64>
      case Instructions.None:
        return <Empty index={idx} governance={governance}></Empty>
      case Instructions.MangoMakeChangeMaxAccounts:
        return (
          <MakeChangeMaxAccounts
            index={idx}
            governance={governance}
          ></MakeChangeMaxAccounts>
        )
      default:
        null
    }
  }

  const classNames = (...classes) => {
    return classes.filter(Boolean).join(' ')
  }

  const StepOne = () => {
    return (
      <div className="w-full flex flex-col gap-y-5 justify-start items-start">
        <Button className="w-full h-10 flex justify-center items-center gap-x-3">
          <TreasuryPaymentIcon className="w-8" color="#000" />

          <span>Treasury payment</span>
        </Button>

        <Button className="w-full h-10 flex justify-center items-center gap-x-3">
          <AddMemberIcon className="w-8" color="#000" />

          <span>Add new member</span>
        </Button>

        <Button className="w-full h-10 flex justify-center items-center gap-x-3">
          <ProgramUpgradeIcon className="w-8" color="#000" />

          <span>Upgrade a program</span>
        </Button>

        <Button className="w-full h-10 flex justify-center items-center gap-x-3">
          <MintTokensIcon className="w-6" color="#000" />

          <span>Mint tokens</span>
        </Button>

        <SecondaryButton className="w-full h-10">
          Customize your proposal
        </SecondaryButton>
      </div>
    )
  }

  const StepTwo = () => {
    return <div>tessooo 222</div>
  }

  const StepThree = () => {
    return <div>asdasd 3432</div>
  }

  const steps = {
    0: {
      title: 'Select type',
      label: 'Step 1',
      getComponent: () => <StepOne />,
    },
    1: {
      title: 'Set proposal',
      label: 'Step 2',
      getComponent: () => <StepTwo />,
    },
    2: {
      title: 'Share your proposal',
      label: 'Step 3',
      getComponent: () => <StepThree />,
    },
  }

  return (
    // <div className="grid grid-cols-12 gap-4">
    //   <div
    //     className={`bg-bkg-2 col-span-12 md:col-span-7 md:order-first lg:col-span-8 order-last p-4 md:p-6 rounded-lg space-y-3 ${
    //       isLoading ? 'pointer-events-none' : ''
    //     }`}
    //   >
    //     <>
    //       <Link href={fmtUrlWithCluster(`/dao/${symbol}/`)}>
    //         <a className="flex items-center text-fgd-3 text-sm transition-all hover:text-fgd-1">
    //           <ArrowLeftIcon className="h-4 w-4 mr-1 text-primary-light" />
    //           Back
    //         </a>
    //       </Link>
    //       <div className="border-b border-fgd-4 pb-4 pt-2">
    //         <div className="flex items-center justify-between">
    //           <h1>
    //             Add a proposal
    //             {realmDisplayName ? ` to ${realmDisplayName}` : ``}{' '}
    //           </h1>
    //         </div>
    //       </div>
    //       <div className="pt-2">
    //         <div className="pb-4">
    //           <Input
    //             label="Title"
    //             placeholder="Title of your proposal"
    //             value={form.title}
    //             type="text"
    //             error={formErrors['title']}
    //             onChange={(evt) =>
    //               handleSetForm({
    //                 value: evt.target.value,
    //                 propertyName: 'title',
    //               })
    //             }
    //           />
    //         </div>
    //         <Textarea
    //           className="mb-3"
    //           label="Description"
    //           placeholder="Description of your proposal or use a github gist link (optional)"
    //           value={form.description}
    //           onChange={(evt) =>
    //             handleSetForm({
    //               value: evt.target.value,
    //               propertyName: 'description',
    //             })
    //           }
    //         ></Textarea>
    //         {canChooseWhoVote && (
    //           <VoteBySwitch
    //             checked={voteByCouncil}
    //             onChange={() => {
    //               setVoteByCouncil(!voteByCouncil)
    //             }}
    //           ></VoteBySwitch>
    //         )}
    //         <NewProposalContext.Provider
    //           value={{
    //             instructionsData,
    //             handleSetInstructions,
    //             governance,
    //             setGovernance,
    //           }}
    //         >
    //           <h2>Instructions</h2>
    //           {instructionsData.map((instruction, idx) => {
    //             const availableInstructionsForIdx = getAvailableInstructionsForIndex(
    //               idx
    //             )
    //             return (
    //               <div
    //                 key={idx}
    //                 className="mb-3 border border-fgd-4 p-4 md:p-6 rounded-lg"
    //               >
    //                 <Select
    //                   className="h-12"
    //                   disabled={!getAvailableInstructionsForIndex.length}
    //                   placeholder={`${
    //                     availableInstructionsForIdx.length
    //                       ? 'Select instruction'
    //                       : 'No available instructions'
    //                   }`}
    //                   label={`Instruction ${idx + 1}`}
    //                   onChange={(value) => setInstructionType({ value, idx })}
    //                   value={instruction.type?.name}
    //                 >
    //                   {availableInstructionsForIdx.map((inst) => (
    //                     <Select.Option key={inst.id} value={inst}>
    //                       <span>{inst.name}</span>
    //                     </Select.Option>
    //                   ))}
    //                 </Select>
    //                 <div className="flex items-end pt-4">
    //                   <InstructionContentContainer
    //                     idx={idx}
    //                     instructionsData={instructionsData}
    //                   >
    //                     {getCurrentInstruction({
    //                       typeId: instruction.type?.id,
    //                       idx,
    //                     })}
    //                   </InstructionContentContainer>
    //                   {idx !== 0 && (
    //                     <LinkButton
    //                       className="flex font-bold items-center ml-4 text-fgd-1 text-sm"
    //                       onClick={() => removeInstruction(idx)}
    //                     >
    //                       <XCircleIcon className="h-5 mr-1.5 text-red w-5" />
    //                       Remove
    //                     </LinkButton>
    //                   )}
    //                 </div>
    //               </div>
    //             )
    //           })}
    //         </NewProposalContext.Provider>
    //         <div className="flex justify-end mt-4 mb-8 px-6">
    //           <LinkButton
    //             className="flex font-bold items-center text-fgd-1 text-sm"
    //             onClick={addInstruction}
    //           >
    //             <PlusCircleIcon className="h-5 mr-1.5 text-green w-5" />
    //             Add instruction
    //           </LinkButton>
    //         </div>
    //         <div className="border-t border-fgd-4 flex justify-end mt-6 pt-6 space-x-4">
    //           <SecondaryButton
    //             disabled={isLoading}
    //             isLoading={isLoadingDraft}
    //             onClick={() => handleCreate(true)}
    //           >
    //             Save draft
    //           </SecondaryButton>
    //           <Button
    //             isLoading={isLoadingSignedProposal}
    //             disabled={isLoading}
    //             onClick={() => handleCreate(false)}
    //           >
    //             Add proposal
    //           </Button>
    //         </div>
    //       </div>
    //     </>
    //   </div>
    //   <div className="col-span-12 md:col-span-5 lg:col-span-4">
    //     <TokenBalanceCard />
    //   </div>
    // </div>

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
        <Tab.Group>
          <Tab.List className="flex max-w-2xl border-b border-gray-900">
            {Object.values(steps).map((step) => (
              <Tab
                style={{ outline: 'none' }}
                key={step.title}
                className={({ selected }) =>
                  classNames(
                    'w-full text-left py-4 leading-5 mx-3 font-bold text-white',
                    selected ? 'border-b-4 border-primary-dark' : 'opacity-50'
                  )
                }
              >
                <p className="text-primary-dark font-light tracking-widest text-xs">
                  {step.label.toUpperCase()}
                </p>

                <p className="text-base">{step.title}</p>
              </Tab>
            ))}
          </Tab.List>

          <Tab.Panels className="flex justify-between w-full">
            {Object.values(steps).map((step) => (
              <Tab.Panel
                key={step.title}
                className={classNames(
                  'w-full max-w-md mt-16 rounded-xl',
                  'focus:outline-none focus:ring-2 ring-offset-2 ring-offset-blue-400 ring-white ring-opacity-60'
                )}
              >
                <ul>{step.getComponent()}</ul>
              </Tab.Panel>
            ))}

            <div className="max-w-xs w-full mt-16">
              <TokenBalanceCard />

              <div className="flex justify-center items-center gap-x-3 mt-16 mb-6 pb-6 border-b border-gray-900">
                <CloudIcon className="mb-2" />

                <h2>Docs that may help you</h2>
              </div>

              <div className="bg-bkg-2 w-full p-4 rounded-md flex items-start justify-start gap-x-3">
                <LinkIcon className="" />

                <a href="#">Docs & tutorials</a>
              </div>

              <div className="bg-bkg-2 mt-4 w-full p-4 rounded-md flex items-start justify-start gap-x-3">
                <DocIcon className="mr-1" />

                <a href="#">About SPL</a>
              </div>
            </div>
          </Tab.Panels>
        </Tab.Group>
      </div>
    </NewProposalContext.Provider>
  )
}

export default New
