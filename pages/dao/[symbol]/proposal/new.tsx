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
import InitializeController from './components/instructions/InitializeController'
import SetRedeemGlobalSupplyCap from './components/instructions/SetRedeemGlobalSupplyCap'
import RegisterMangoDepository from './components/instructions/RegisterMangoDepository'
import SetMangoDepositoriesRedeemableSoftCap from './components/instructions/SetMangoDepositoriesRedeemableSoftCap'
import DepositInsuranceToMangoDepository from './components/instructions/DepositInsuranceToMangoDepository'
import WithdrawInsuranceFromMangoDepository from './components/instructions/WithdrawInsuranceFromMangoDepository'
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
  } = useRealm()
  const { getAvailableInstructions } = useGovernanceAssets()
  const availableInstructions = getAvailableInstructions()
  const wallet = useWalletStore((s) => s.current)
  const connection = useWalletStore((s) => s.connection)
  const {
    fetchRealmGovernance,
    fetchTokenAccountsForSelectedRealmGovernances,
  } = useWalletStore((s) => s.actions)

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

        // Select the governing token mint for the proposal
        // By default we choose the community mint if it has positive supply (otherwise nobody can vote)
        // TODO: If token holders for both mints can vote the we should add the option in the UI to choose who votes (community or the council)
        const proposalMint = !mint?.supply.isZero()
          ? realm.info.communityMint
          : !councilMint?.supply.isZero()
          ? realm.info.config.councilMint
          : undefined

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
      case Instructions.InitializeController:
        return <InitializeController index={idx} governance={governance} />
      case Instructions.SetRedeemableGlobalSupplyCap:
        return <SetRedeemGlobalSupplyCap index={idx} governance={governance} />
      case Instructions.SetMangoDepositoriesRedeemableSoftCap:
        return (
          <SetMangoDepositoriesRedeemableSoftCap
            index={idx}
            governance={governance}
          />
        )
      case Instructions.RegisterMangoDepository:
        return <RegisterMangoDepository index={idx} governance={governance} />
      case Instructions.DepositInsuranceToMangoDepository:
        return (
          <DepositInsuranceToMangoDepository
            index={idx}
            governance={governance}
          />
        )
      case Instructions.WithdrawInsuranceFromMangoDepository:
        return (
          <WithdrawInsuranceFromMangoDepository
            index={idx}
            governance={governance}
          />
        )
      case Instructions.Mint:
        return <Mint index={idx} governance={governance}></Mint>
      case Instructions.Base64:
        return <CustomBase64 index={idx} governance={governance}></CustomBase64>
      case Instructions.None:
        return <Empty index={idx} governance={governance}></Empty>
      default:
        null
    }
  }

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
              label="Description"
              placeholder="Description of your proposal or use a github gist link (optional)"
              wrapperClassName="mb-5"
              value={form.description}
              onChange={(evt) =>
                handleSetForm({
                  value: evt.target.value,
                  propertyName: 'description',
                })
              }
            ></Textarea>
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
                        <Select.Option key={inst.id} value={inst}>
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
        <TokenBalanceCard />
      </div>
    </div>
  )
}

export default New
