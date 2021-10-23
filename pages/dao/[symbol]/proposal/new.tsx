import Link from 'next/link'
import { ArrowLeftIcon } from '@heroicons/react/outline'

import TokenBalanceCard from '@components/TokenBalanceCard'
import useRealm from '@hooks/useRealm'

import useQueryContext from '@hooks/useQueryContext'
import Input from '@components/inputs/Input'
import Textarea from '@components/inputs/Textarea'
import Select from '@components/inputs/Select'
import React, { createContext, useEffect, useState } from 'react'
import { SecondaryButton } from '@components/Button'
import SplTokenTransfer from './components/instructions/SplTokenTransfer'
import MinimumApprovalThreshold from './components/MinimumApprovalThreshold'
import { RpcContext } from '@models/core/api'
import { createProposal } from 'actions/createProposal'
import useWalletStore from 'stores/useWalletStore'
import { getInstructionDataFromBase64 } from '@models/serialisation'
import { PublicKey } from '@solana/web3.js'
import { XCircleIcon } from '@heroicons/react/solid'
import { notify } from 'utils/notifications'
import * as yup from 'yup'
import { formValidation, isFormValid } from '@utils/formValidation'
import { useRouter } from 'next/router'
import {
  ComponentInstructionData,
  Instruction,
  Instructions,
  InstructionsContext,
} from '@utils/uiTypes/proposalCreationTypes'
import useInstructions from '@hooks/useInstructions'
import { ParsedAccount } from '@models/core/accounts'
import { Governance } from '@models/accounts'
import DropdownBtn, { DropdownBtnOptions } from '@components/DropdownBtn'
import InstructionContainer from './components/InstructionContainer'

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
    realmDisplayName,
    ownVoterWeight,
    mint,
    councilMint,
  } = useRealm()
  const { getAvailableInstructions } = useInstructions()
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
  const [instructionsData, setInstructions] = useState<
    ComponentInstructionData[]
  >([{ type: availableInstructions[0] }])
  const [
    governance,
    setGovernance,
  ] = useState<ParsedAccount<Governance> | null>(null)
  const [isLoading, setIsLoading] = useState(false)

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
    const instructions: Instruction[] = []
    for (const inst of instructionsData) {
      if (inst.getInstruction) {
        const instruction: Instruction = await inst?.getInstruction()
        instructions.push(instruction)
      }
    }
    return instructions
  }
  const handleCreate = async (isDraft) => {
    setFormErrors({})
    setIsLoading(true)
    const { isValid, validationErrors }: formValidation = await isFormValid(
      schema,
      form
    )

    const instructions: Instruction[] = await handleGetInstructions()
    let proposalAddress: PublicKey | null = null
    if (!realm) {
      setIsLoading(false)
      throw 'No realm selected'
    }

    if (isValid && instructions.every((x: Instruction) => x.isValid)) {
      let selectedGovernance = governance
      if (!governance) {
        setIsLoading(false)
        throw Error('No governance selected')
      }

      const rpcContext = new RpcContext(
        new PublicKey(realm.account.owner.toString()),
        wallet,
        connection.current,
        connection.endpoint
      )
      const instructionsData = instructions.map((x) =>
        getInstructionDataFromBase64(x.serializedInstruction)
      )

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
          selectedGovernance?.info?.config.minInstructionHoldUpTime,
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
    setIsLoading(false)
  }

  useEffect(() => {
    setInstructions([instructionsData[0]])
  }, [instructionsData[0].governedAccount?.token?.publicKey])
  useEffect(() => {
    const firstInstruction = instructionsData[0]
    if (firstInstruction && firstInstruction.governedAccount?.governance) {
      setGovernance(firstInstruction.governedAccount.governance)
    }
  }, [instructionsData[0]])
  useEffect(() => {
    //fetch to be up to date with amounts
    fetchTokenAccountsForSelectedRealmGovernances()
  }, [])
  const returnCurrentInstruction = ({ typeId, idx }) => {
    switch (typeId) {
      case Instructions.Transfer:
        return (
          <InstructionContainer idx={idx} instructionsData={instructionsData}>
            <SplTokenTransfer
              index={idx}
              governance={governance}
            ></SplTokenTransfer>
          </InstructionContainer>
        )
      default:
        null
    }
  }
  const dropDownBtnFinishActions: DropdownBtnOptions[] = [
    {
      label: 'Propose',
      callback: () => handleCreate(false),
      isDefault: true,
    },
    {
      label: 'Save Draft',
      callback: () => handleCreate(true),
      isDefault: false,
    },
  ]
  return (
    <div className="grid grid-cols-12 gap-4">
      <div
        className={`bg-bkg-2 border border-bkg-3 rounded-lg p-6 col-span-8 space-y-3 ${
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
          <div className="border-b border-bkg-3 py-4">
            <div className="flex items-center justify-between mb-1">
              <h1>
                Add a proposal
                {realmDisplayName ? ` to ${realmDisplayName}` : ``}{' '}
              </h1>
            </div>
          </div>
          <div>
            <Input
              prefix="Title"
              placeholder="title of your proposal"
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
              placeholder="write a description of your proposal or use a github gist link (optional)"
              wrapperClassName="mb-5"
              prefix="Description"
              value={form.description}
              onChange={(evt) =>
                handleSetForm({
                  value: evt.target.value,
                  propertyName: 'description',
                })
              }
            ></Textarea>
            {instructionsData.map((instruction, idx) => (
              <div key={idx} className="mb-5 border border-bkg-3 p-5">
                {idx !== 0 && (
                  <XCircleIcon
                    className="h-7 cursor-pointer float-right"
                    onClick={() => removeInstruction(idx)}
                  ></XCircleIcon>
                )}
                <Select
                  placeholder={`${
                    availableInstructions.length
                      ? 'select instruction'
                      : 'there are no available instructions'
                  }`}
                  prefix="Instruction"
                  onChange={(value) => setInstructionType({ value, idx })}
                  value={instruction.type?.name}
                >
                  {availableInstructions.map((inst) => (
                    <Select.Option key={inst.id} value={inst}>
                      <span>{inst.name}</span>
                    </Select.Option>
                  ))}
                </Select>
                <NewProposalContext.Provider
                  value={{
                    instructionsData,
                    handleSetInstructions,
                    governance,
                    setGovernance,
                  }}
                >
                  {returnCurrentInstruction({
                    typeId: instruction.type?.id,
                    idx,
                  })}
                </NewProposalContext.Provider>
              </div>
            ))}
            <div className="flex justify-left mt-5 mb-5">
              <SecondaryButton className="w-24" onClick={addInstruction}>
                (+)
              </SecondaryButton>
            </div>
            <MinimumApprovalThreshold
              governance={governance}
            ></MinimumApprovalThreshold>
            <div className="flex justify-end mt-5">
              <DropdownBtn
                isLoading={isLoading}
                options={dropDownBtnFinishActions}
              ></DropdownBtn>
            </div>
          </div>
        </>
      </div>
      <div className="col-span-4 space-y-4">
        <TokenBalanceCard />
      </div>
    </div>
  )
}

export default New
