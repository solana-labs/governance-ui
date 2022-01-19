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
import { RpcContext } from '@solana/spl-governance'
import { createProposal } from 'actions/createProposal'
import useWalletStore from 'stores/useWalletStore'
import { getInstructionDataFromBase64 } from '@solana/spl-governance'
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
import { ProgramAccount } from '@solana/spl-governance'
import { Governance, GovernanceAccountType } from '@solana/spl-governance'
import InstructionContentContainer from './components/InstructionContentContainer'
import ProgramUpgrade from './components/instructions/ProgramUpgrade'
import Empty from './components/instructions/Empty'
import Mint from './components/instructions/Mint'
import CustomBase64 from './components/instructions/CustomBase64'
import { getTimestampFromDays } from '@tools/sdk/units'
import MakeChangeMaxAccounts from './components/instructions/Mango/MakeChangeMaxAccounts'
import VoteBySwitch from './components/VoteBySwitch'
import { getProgramVersionForRealm } from '@models/registry/api'
import LinksCompactWrapper from '@components/LinksCompactWrapper'

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
  ] = useState<ProgramAccount<Governance> | null>(null)
  const [isLoadingSignedProposal, setIsLoadingSignedProposal] = useState(false)
  const [isLoadingDraft, setIsLoadingDraft] = useState(false)
  const isLoading = isLoadingSignedProposal || isLoadingDraft
  const customInstructionFilterForSelectedGovernance = (
    instructionType: Instructions
  ) => {
    if (!governance) {
      return true
    } else {
      const governanceType = governance.account.accountType
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
        new PublicKey(realm.owner.toString()),
        getProgramVersionForRealm(realmInfo!),
        wallet!,
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
            : selectedGovernance?.account?.config.minInstructionHoldUpTime,
          prerequisiteInstructions: x.prerequisiteInstructions || [],
        }
      })

      try {
        // Fetch governance to get up to date proposalCount
        selectedGovernance = (await fetchRealmGovernance(
          governance.pubkey
        )) as ProgramAccount<Governance>

        const ownTokenRecord = ownVoterWeight.getTokenRecordToCreateProposal(
          governance.account.config
        )
        const defaultProposalMint = !mint?.supply.isZero()
          ? realm.account.communityMint
          : !councilMint?.supply.isZero()
          ? realm.account.config.councilMint
          : undefined

        const proposalMint =
          canChooseWhoVote && voteByCouncil
            ? realm.account.config.councilMint
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
          selectedGovernance?.account?.proposalCount,
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
        return <SplTokenTransfer index={idx} governance={governance} />
      case Instructions.ProgramUpgrade:
        return <ProgramUpgrade index={idx} governance={governance} />
      case Instructions.Mint:
        return <Mint index={idx} governance={governance} />
      case Instructions.Base64:
        return <CustomBase64 index={idx} governance={governance} />
      case Instructions.None:
        return <Empty index={idx} governance={governance} />
      case Instructions.MangoMakeChangeMaxAccounts:
        return <MakeChangeMaxAccounts index={idx} governance={governance} />
      default:
        null
    }
  }

  return (
    <div>
      <div>
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

        <div className="w-full flex lg:flex-row flex-col justify-between items-start mt-16">
          <div className="w-full flex lg:mb-0 mb-20 flex-col gap-y-5 justify-start items-start lg:max-w-xl rounded-xl">
            <NewProposalContext.Provider
              value={{
                instructionsData,
                handleSetInstructions,
                governance,
                setGovernance,
              }}
            >
              <h2>Choose your instructions</h2>

              {instructionsData.map((instruction, idx) => {
                const availableInstructionsForIdx = getAvailableInstructionsForIndex(
                  idx
                )
                return (
                  <div key={idx} className="mb-3 rounded-lg w-full">
                    <Select
                      useDefaultStyle={false}
                      className="w-full bg-bkg-3 border border-bkg-3 default-transition text-sm text-fgd-1 rounded-md focus:border-bkg-3 focus:outline-none"
                      noMaxWidth
                      disabled={!getAvailableInstructionsForIndex.length}
                      placeholder={`${
                        availableInstructionsForIdx.length
                          ? 'Select instruction'
                          : 'No available instructions'
                      }`}
                      label={`Instruction ${idx + 1}`}
                      onChange={(value) => setInstructionType({ value, idx })}
                      value={instruction.type?.name}
                    >
                      {availableInstructionsForIdx.map((inst) => (
                        <Select.Option
                          className="bg-bkg-3"
                          key={inst.id}
                          value={inst}
                        >
                          <span>{inst.name}</span>
                        </Select.Option>
                      ))}
                    </Select>

                    <div className="flex items-end pt-4">
                      <InstructionContentContainer
                        idx={idx}
                        instructionsData={instructionsData}
                      >
                        {getCurrentInstruction({
                          typeId: instruction.type?.id,
                          idx,
                        })}
                      </InstructionContentContainer>

                      {idx !== 0 && (
                        <LinkButton
                          className="flex font-bold items-center ml-4 text-fgd-1 text-sm"
                          onClick={() => removeInstruction(idx)}
                        >
                          <XCircleIcon className="h-5 mr-1.5 text-red w-5" />
                          Remove
                        </LinkButton>
                      )}
                    </div>
                  </div>
                )
              })}
            </NewProposalContext.Provider>

            <LinkButton
              className="flex font-bold items-center text-fgd-1 text-sm"
              onClick={addInstruction}
            >
              <PlusCircleIcon className="h-5 mr-1.5 text-green w-5" />
              Add instruction
            </LinkButton>

            <VoteBySwitch
              checked={voteByCouncil}
              onChange={() => {
                setVoteByCouncil(!voteByCouncil)
              }}
            />

            <div className="flex w-full justify-end mt-6 pt-6 space-x-4">
              <SecondaryButton
                disabled={isLoading}
                isLoading={isLoadingDraft}
                onClick={() => handleCreate(true)}
              >
                Save draft
              </SecondaryButton>
              <Button
                isLoading={isLoadingSignedProposal}
                disabled={isLoading}
                onClick={() => handleCreate(false)}
              >
                Add proposal
              </Button>
            </div>
          </div>

          <div className="md:max-w-xs w-full">
            <Input
              wrapperClassName="w-full"
              noMaxWidth
              label="Title"
              placeholder="Title of your proposal"
              value={form.title}
              type="text"
              error={formErrors['title']}
              onChange={(evt) =>
                handleSetForm({
                  value: evt.target.value,
                  propertyName: 'title',
                })
              }
            />

            <Textarea
              wrapperClassName="mt-6 mb-16 w-full"
              noMaxWidth
              label="Description"
              placeholder="Describe your proposal or use a github gist link (optional)"
              value={form.description}
              onChange={(evt) =>
                handleSetForm({
                  value: evt.target.value,
                  propertyName: 'description',
                })
              }
            />

            <TokenBalanceCard />

            <LinksCompactWrapper />
          </div>
        </div>
      </div>
    </div>
  )
}

export default New
