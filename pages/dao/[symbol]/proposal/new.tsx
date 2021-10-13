import Link from 'next/link'
import { ArrowLeftIcon } from '@heroicons/react/outline'
import useProposal from '../../../../hooks/useProposal'
import TokenBalanceCard from '../../../../components/TokenBalanceCard'
import useRealm from '../../../../hooks/useRealm'
import { option } from '../../../../tools/core/option'
import useQueryContext from '../../../../hooks/useQueryContext'
import Input from '../../../../components/inputs/Input'
import Textarea from '../../../../components/inputs/Textarea'
import Select from '../../../../components/inputs/Select'
import React, { useEffect, useState } from 'react'
import SplTokenTransferForm from './instructions/splTokenTransferForm'
import Button from '../../../../components/Button'

export enum Instructions {
  Transfer,
}
const instructions = [{ id: Instructions.Transfer, name: 'Spl-Token Transfer' }]

const New = () => {
  const { generateUrlWithClusterParam } = useQueryContext()
  const { symbol } = useRealm()
  const { proposal } = useProposal()

  const [form, setForm] = useState({
    instruction: instructions[0],
    title: '',
    description: '',
  })
  const [instructionForm, setInstructionForm] = useState({})

  const handleSetForm = ({ propertyName, value }) => {
    setForm({ ...form, [propertyName]: value })
  }

  const onInstructionFormUpdate = ({ form }) => {
    setInstructionForm(form)
  }

  const returnInstructionForm = () => {
    switch (form.instruction?.id) {
      case Instructions.Transfer:
        return (
          <SplTokenTransferForm
            onChange={onInstructionFormUpdate}
          ></SplTokenTransferForm>
        )
      default:
        null
    }
  }

  const handleCreate = () => {
    const model = { ...form, ...instructionForm }
    console.log(model)
  }

  useEffect(() => {
    setInstructionForm({})
  }, [form.instruction?.id])
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
            <Select
              prefix="Instruction"
              onChange={(value) =>
                handleSetForm({ value, propertyName: 'instruction' })
              }
              value={form.instruction?.name}
            >
              {instructions.map((inst) => (
                <Select.Option key={inst.id} value={inst}>
                  <span>{inst.name}</span>
                </Select.Option>
              ))}
            </Select>
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
              prefix="Description"
              value={form.description}
              onChange={(evt) =>
                handleSetForm({
                  value: evt.target.value,
                  propertyName: 'description',
                })
              }
            ></Textarea>
            {returnInstructionForm()}
            <div>
              <Button className="mt-5 w-44" onClick={handleCreate}>
                Create
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
