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
import React, { useState } from 'react'
import Button from '@components/Button'
import SplTokenTransferForm from '../proposal/components/instructions/splTokenTransferForm'
import MinimumApprovalTreshold from './components/MinimumApprovalTreshold'
import { RpcContext } from '@models/core/api'
import { createProposalDraft } from 'actions/createProposalDraft'
import useWalletStore from 'stores/useWalletStore'
import { getInstructionDataFromBase64 } from '@models/serialisation'
export enum Instructions {
  Transfer,
}
const availabileInstructions = [
  { id: Instructions.Transfer, name: 'Spl-Token Transfer' },
]

const defaultInstructionModel = { type: null, serializedInstruction: '' }

const New = () => {
  const { generateUrlWithClusterParam } = useQueryContext()
  const { symbol, realm } = useRealm()
  const { proposal } = useProposal()
  const wallet = useWalletStore((s) => s.current)
  const connection = useWalletStore((s) => s.connection)
  const [form, setForm] = useState({
    title: '',
    description: '',
  })
  const [instructions, setInstructions] = useState([
    { ...defaultInstructionModel, type: availabileInstructions[0] },
  ])
  const [sourceAccount, setSourceAccount] = useState(null)

  const handleSetForm = ({ propertyName, value }) => {
    setForm({ ...form, [propertyName]: value })
  }
  const setInstructionType = ({ value, idx }) => {
    const newInstruction = {
      type: value,
    }
    setInstructionChangeAtIndex({ newModel: newInstruction, idx })
  }
  const handleSetInstructionForm = ({ serializedInstruction, idx }) => {
    const newInstruction = {
      ...instructions[idx],
      serializedInstruction,
    }
    setInstructionChangeAtIndex({ newModel: newInstruction, idx })
  }
  const setInstructionChangeAtIndex = ({ newModel, idx }) => {
    const newInstructions = [...instructions]
    newInstructions[idx] = newModel
    setInstructions(newInstructions)
  }
  const onInstructionFormUpdate = ({ serializedInstruction, idx }) => {
    handleSetInstructionForm({ serializedInstruction, idx })
  }
  const addInstruction = () => {
    setInstructions([...instructions, defaultInstructionModel])
  }
  const removeInstruction = (idx) => {
    setInstructions([...instructions.filter((x, index) => index !== idx)])
  }

  const returnCurrentInstruction = ({ typeId, idx }) => {
    const props = {
      onChange: (serializedInstruction) =>
        onInstructionFormUpdate({ serializedInstruction, idx }),
      onSourceAccountChange: (sourceAccount) => setSourceAccount(sourceAccount),
    }
    switch (typeId) {
      case Instructions.Transfer:
        return <SplTokenTransferForm {...props}></SplTokenTransferForm>
      default:
        null
    }
  }

  const handlePropose = () => {
    console.log(instructions)
  }

  const handleCreateDraft = async () => {
    const holduptime = sourceAccount?.info?.minInstructionHoldUpTime || 0
    const proposalIndex = sourceAccount?.info?.proposalCount
      ? sourceAccount?.info?.proposalCount + 1
      : 0
    const rpcContext = new RpcContext(
      realm.account.owner,
      wallet,
      connection.current,
      connection.endpoint
    )
    const instructionsData = instructions.map((x) =>
      getInstructionDataFromBase64(x.serializedInstruction)
    )

    try {
      await createProposalDraft(
        rpcContext,
        realm.pubkey,
        sourceAccount.pubkey,
        sourceAccount.info?.governedAccount?.pubkey,
        form.title,
        form.description,
        //brak pewnosci
        realm.info.communityMint,
        holduptime,
        proposalIndex,
        instructionsData
      )
    } catch (ex) {
      console.error("Can't create draft", ex)
    } finally {
      console.log('done')
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
              onChange={(evt) =>
                handleSetForm({
                  value: evt.target.value,
                  propertyName: 'title',
                })
              }
            />
            <Textarea
              className="mb-5"
              prefix="Description"
              value={form.description}
              onChange={(evt) =>
                handleSetForm({
                  value: evt.target.value,
                  propertyName: 'description',
                })
              }
            ></Textarea>
            {instructions.map((instruction, idx) => (
              <div key={idx} className="mb-5 border border-bkg-3 p-5">
                {idx !== 0 && (
                  <div onClick={() => removeInstruction(idx)}>x</div>
                )}
                <Select
                  prefix="Instruction"
                  onChange={(value) => setInstructionType({ value, idx })}
                  value={instruction.type?.name}
                >
                  {availabileInstructions.map((inst) => (
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
            <Button className="mt-5 w-44 mb-5" onClick={addInstruction}>
              Add new instruction
            </Button>
            <MinimumApprovalTreshold></MinimumApprovalTreshold>
            <div>
              <Button className="mt-5 w-44" onClick={handleCreateDraft}>
                Create Draft
              </Button>
              <Button className="mt-5 w-44" onClick={handlePropose}>
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
