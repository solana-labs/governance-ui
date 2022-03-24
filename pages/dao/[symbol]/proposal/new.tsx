import Link from 'next/link'
import { useRouter } from 'next/router'
import React, { createContext, useEffect, useState } from 'react'
import * as yup from 'yup'
import {
  ArrowLeftIcon,
  PlusCircleIcon,
  XCircleIcon,
} from '@heroicons/react/outline'
import {
  getInstructionDataFromBase64,
  Governance,
  GovernanceAccountType,
  ProgramAccount,
} from '@solana/spl-governance'
import { PublicKey } from '@solana/web3.js'
import Button, { LinkButton, SecondaryButton } from '@components/Button'
import Input from '@components/inputs/Input'
import Select from '@components/inputs/Select'
import Textarea from '@components/inputs/Textarea'
import TokenBalanceCardWrapper from '@components/TokenBalance/TokenBalanceCardWrapper'
import useCreateProposal from '@hooks/useCreateProposal'
import useGovernanceAssets from '@hooks/useGovernanceAssets'
import useQueryContext from '@hooks/useQueryContext'
import useRealm from '@hooks/useRealm'
import { getTimestampFromDays } from '@tools/sdk/units'
import { formValidation, isFormValid } from '@utils/formValidation'
import {
  ComponentInstructionData,
  Instructions,
  InstructionsContext,
  UiInstruction,
} from '@utils/uiTypes/proposalCreationTypes'

import useWalletStore from 'stores/useWalletStore'
import { notify } from 'utils/notifications'

import InstructionContentContainer from './components/InstructionContentContainer'
import VoteBySwitch from './components/VoteBySwitch'
import ProposalForm from './components/instructions/ProposalForm'

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

// Takes the first encountered governance account
function extractGovernanceAccountFromInstructionsData(
  instructionsData: ComponentInstructionData[]
): ProgramAccount<Governance> | null {
  return (
    instructionsData.find((itx) => itx.governedAccount)?.governedAccount ?? null
  )
}

const New = () => {
  const router = useRouter()
  const { handleCreateProposal } = useCreateProposal()
  const { fmtUrlWithCluster } = useQueryContext()
  const { symbol, realm, realmDisplayName, canChooseWhoVote } = useRealm()

  const { getAvailableInstructions } = useGovernanceAssets()
  const availableInstructions = getAvailableInstructions()
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
        case GovernanceAccountType.ProgramGovernanceV1:
        case GovernanceAccountType.ProgramGovernanceV2:
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
      const instructionsData = instructions.map((x) => {
        return {
          data: x.serializedInstruction
            ? getInstructionDataFromBase64(x.serializedInstruction)
            : null,
          holdUpTime: x.customHoldUpTime
            ? getTimestampFromDays(x.customHoldUpTime)
            : selectedGovernance?.account?.config.minInstructionHoldUpTime,
          prerequisiteInstructions: x.prerequisiteInstructions || [],
          chunkSplitByDefault: x.chunkSplitByDefault || false,
          signers: x.signers,
          shouldSplitIntoSeparateTxs: x.shouldSplitIntoSeparateTxs,
        }
      })

      try {
        // Fetch governance to get up to date proposalCount
        selectedGovernance = (await fetchRealmGovernance(
          governance.pubkey
        )) as ProgramAccount<Governance>

        proposalAddress = await handleCreateProposal({
          title: form.title,
          description: form.description,
          governance: selectedGovernance,
          instructionsData,
          voteByCouncil,
          isDraft,
        })

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
    const governedAccount = extractGovernanceAccountFromInstructionsData(
      instructionsData
    )

    setGovernance(governedAccount)
  }, [instructionsData])

  useEffect(() => {
    //fetch to be up to date with amounts
    fetchTokenAccountsForSelectedRealmGovernances()
  }, [])

  return (
    <div className="grid grid-cols-12 gap-4">
      <div
        className={`bg-bkg-2 col-span-12 md:col-span-7 md:order-first lg:col-span-8 order-last p-4 md:p-6 rounded-lg space-y-3 ${
          isLoading ? 'pointer-events-none' : ''
        }`}
      >
        <>
          <Link href={fmtUrlWithCluster(`/dao/${symbol}/`)}>
            <a className="flex items-center text-fgd-3 text-sm transition-all hover:text-fgd-1">
              <ArrowLeftIcon className="h-4 w-4 mr-1 text-primary-light" />
              Back
            </a>
          </Link>
          <div className="border-b border-fgd-4 pb-4 pt-2">
            <div className="flex items-center justify-between">
              <h1>
                Add a proposal
                {realmDisplayName ? ` to ${realmDisplayName}` : ``}{' '}
              </h1>
            </div>
          </div>
          <div className="pt-2">
            <div className="pb-4">
              <Input
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
            </div>
            <Textarea
              className="mb-3"
              label="Description"
              placeholder="Description of your proposal or use a github gist link (optional)"
              value={form.description}
              onChange={(evt) =>
                handleSetForm({
                  value: evt.target.value,
                  propertyName: 'description',
                })
              }
            ></Textarea>
            {canChooseWhoVote && (
              <VoteBySwitch
                checked={voteByCouncil}
                onChange={() => {
                  setVoteByCouncil(!voteByCouncil)
                }}
              ></VoteBySwitch>
            )}
            <NewProposalContext.Provider
              value={{
                instructionsData,
                handleSetInstructions,
                governance,
                setGovernance,
              }}
            >
              <h2>Instructions</h2>
              {instructionsData.map((instruction, idx) => {
                const availableInstructionsForIdx = getAvailableInstructionsForIndex(
                  idx
                )
                return (
                  <div
                    key={idx}
                    className="mb-3 border border-fgd-4 p-4 md:p-6 rounded-lg"
                  >
                    <Select
                      className="h-12"
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
                        <Select.Option key={inst.name} value={inst}>
                          <span>{inst.name}</span>
                        </Select.Option>
                      ))}
                    </Select>
                    <div className="flex items-end pt-4">
                      <InstructionContentContainer
                        idx={idx}
                        instructionsData={instructionsData}
                      >
                        <ProposalForm
                          governance={governance}
                          index={idx}
                          itxType={instruction.type?.id}
                        />
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
            <div className="flex justify-end mt-4 mb-8 px-6">
              <LinkButton
                className="flex font-bold items-center text-fgd-1 text-sm"
                onClick={addInstruction}
              >
                <PlusCircleIcon className="h-5 mr-1.5 text-green w-5" />
                Add instruction
              </LinkButton>
            </div>
            <div className="border-t border-fgd-4 flex justify-end mt-6 pt-6 space-x-4">
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
        </>
      </div>
      <div className="col-span-12 md:col-span-5 lg:col-span-4">
        <TokenBalanceCardWrapper />
      </div>
    </div>
  )
}

export default New
