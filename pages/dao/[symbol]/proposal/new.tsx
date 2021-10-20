import Link from 'next/link'
import { ArrowLeftIcon } from '@heroicons/react/outline'
import useProposal from '@hooks/useProposal'
import TokenBalanceCard from '@components/TokenBalanceCard'
import useRealm from '@hooks/useRealm'
import { option } from '@tools/core/option'
import useQueryContext from '@hooks/useQueryContext'
import Input from '@components/inputs/Input'
import Textarea from '@components/inputs/Textarea'
import Select from '@components/inputs/Select'
import React, { useRef, useState } from 'react'
import Button from '@components/Button'
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
  createParams,
  Instruction,
  Instructions,
  SplTokenTransferRef,
} from '@utils/uiTypes/proposalCreationTypes'
import useInstructions from '@hooks/useInstructions'
import { ParsedAccount } from '@models/core/accounts'
import { Governance } from '@models/accounts'

const schema = yup.object().shape({
  title: yup.string().required('Title is required'),
})

const New = () => {
  const refs = useRef<SplTokenTransferRef[]>([])
  const router = useRouter()
  const { generateUrlWithClusterParam } = useQueryContext()
  const { symbol, realm, ownTokenRecord } = useRealm()
  const { getAvailableInstructions } = useInstructions()
  const { proposal } = useProposal()
  const wallet = useWalletStore((s) => s.current)
  const connection = useWalletStore((s) => s.connection)
  const availableInstructions = getAvailableInstructions()
  const defaultInstructionComponentModel = {
    type: availableInstructions[0],
  }
  const { fetchRealmGovernance } = useWalletStore((s) => s.actions)
  const [form, setForm] = useState({
    title: '',
    description: '',
  })
  const [formErrors, setFormErrors] = useState({})
  const [instructionsComponents, setInstructions] = useState([
    { ...defaultInstructionComponentModel, type: availableInstructions[0] },
  ])

  const handleSetForm = ({ propertyName, value }) => {
    setFormErrors({})
    setForm({ ...form, [propertyName]: value })
  }
  const setInstructionType = ({ value, idx }) => {
    const newInstruction = {
      type: value,
    }
    setInstructionChangeAtIndex({ newModel: newInstruction, idx })
  }
  const setInstructionChangeAtIndex = ({ newModel, idx }) => {
    const newInstructions = [...instructionsComponents]
    newInstructions[idx] = newModel
    setInstructions(newInstructions)
  }
  const addInstruction = () => {
    setInstructions([
      ...instructionsComponents,
      defaultInstructionComponentModel,
    ])
  }
  const removeInstruction = (idx) => {
    setInstructions([
      ...instructionsComponents.filter((x, index) => index !== idx),
    ])
  }
  const getInstructions = async () => {
    const instructions: Instruction[] = []
    const instRefs: SplTokenTransferRef[] = refs.current
    for (const inst of instRefs) {
      const instruction: Instruction = await inst?.getSerializedInstruction()
      instructions.push(instruction)
    }
    return instructions
  }
  const handleCreate = async (isDraft) => {
    setFormErrors({})

    const { isValid, validationErrors }: formValidation = await isFormValid(
      schema,
      form
    )
    const instructions: Instruction[] = await getInstructions()
    let proposalAddress: PublicKey | null = null
    if (!realm) {
      throw 'no realm selected'
    }
    if (isValid && instructions.every((x: Instruction) => x.isValid)) {
      const governancePk = instructions[0].governance?.pubkey
      if (!governancePk) {
        throw 'no source account selected'
      }
      if (!ownTokenRecord) {
        notify({ type: 'error', message: `no own token record found` })
        throw 'no own token record found'
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
        const governance = (await fetchRealmGovernance(
          governancePk
        )) as ParsedAccount<Governance>

        const params: createParams = [
          rpcContext,
          realm.pubkey,
          governance.pubkey,
          ownTokenRecord?.pubkey,
          form.title,
          form.description,
          realm.info.communityMint,
          governance?.info?.config.minInstructionHoldUpTime,
          governance?.info?.proposalCount,
          instructionsData,
          isDraft,
        ]

        proposalAddress = await createProposal(...params)
        const url = generateUrlWithClusterParam(
          `/dao/${symbol}/proposal/${proposalAddress}`
        )
        router.push(url)
      } catch (ex) {
        notify({ type: 'error', message: `${ex}` })
      }
    } else {
      setFormErrors(validationErrors)
    }
  }

  const returnCurrentInstruction = ({ typeId, idx }) => {
    const props = {
      ref: (element) => {
        refs.current[idx] = element
      },
    }
    switch (typeId) {
      case Instructions.Transfer:
        return <SplTokenTransfer {...props}></SplTokenTransfer>
      default:
        null
    }
  }

  return (
    <div className="grid grid-cols-12 gap-4">
      <div className="bg-bkg-2 border border-bkg-3 rounded-lg p-6 col-span-8 space-y-3">
        <>
          <Link href={generateUrlWithClusterParam(`/dao/${symbol}/`)}>
            <a className="flex items-center text-fgd-3 text-sm transition-all hover:text-fgd-1">
              <ArrowLeftIcon className="h-4 w-4 mr-1 text-primary-light" />
              Back
            </a>
          </Link>
          <div className="border-b border-bkg-3 py-4">
            <div className="flex items-center justify-between mb-1">
              <h1>New proposal</h1>
            </div>
          </div>
          <div>
            <Input
              prefix="Title"
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
              placeholder="Description or github gist link (optional)"
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
            {instructionsComponents.map((instruction, idx) => (
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
                      ? 'Instruction'
                      : 'No available instruction to select'
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
                {returnCurrentInstruction({
                  typeId: instruction.type?.id,
                  idx,
                })}
              </div>
            ))}
            <div className="flex justify-center mt-5 mb-5">
              <Button className="w-44" onClick={addInstruction}>
                Add new instruction
              </Button>
            </div>
            <MinimumApprovalThreshold></MinimumApprovalThreshold>
            <div className="flex justify-end mt-5">
              <Button className="w-44 mr-5" onClick={() => handleCreate(true)}>
                Create Draft
              </Button>
              <Button className="w-44" onClick={() => handleCreate(false)}>
                Propose
              </Button>
            </div>
          </div>
        </>
      </div>
      <div className="col-span-4 space-y-4">
        <TokenBalanceCard proposal={option(proposal?.info)} />
      </div>
    </div>
  )
}

export default New
