import React, { useContext, useEffect, useState } from 'react'
import * as yup from 'yup'
import { serializeInstructionToBase64 } from '@solana/spl-governance'
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  Token,
  TOKEN_PROGRAM_ID,
  u64,
} from '@solana/spl-token'
import { WalletAdapter } from '@solana/wallet-adapter-base'
import {
  PublicKey,
  SystemProgram,
  TransactionInstruction,
} from '@solana/web3.js'
import {
  getInstructionDataFromBase64,
  Governance,
  ProgramAccount,
} from '@solana/spl-governance'
import Input from '@components/inputs/Input'
import Textarea from '@components/inputs/Textarea'
import { validateInstruction } from '@utils/instructionTools'
import {
  Base64InstructionForm,
  HelloForm,
  UiInstruction,
} from '@utils/uiTypes/proposalCreationTypes'

import useWalletStore from 'stores/useWalletStore'
import * as borsh from 'borsh'
import { NewProposalContext } from '../../new'
import GovernedAccountSelect from '../GovernedAccountSelect'
import useGovernedMultiTypeAccounts from '@hooks/useGovernedMultiTypeAccounts'

const HelloContract = ({
  index,
  governance,
}: {
  index: number
  governance: ProgramAccount<Governance> | null
}) => {
  const wallet = useWalletStore((s) => s.current)
  const { governedMultiTypeAccounts } = useGovernedMultiTypeAccounts()
  const shouldBeGoverned = index !== 0 && governance
  const [form, setForm] = useState<HelloForm>({
    governedAccount: undefined,
    name: '',
  })
  const [formErrors, setFormErrors] = useState({})
  const { handleSetInstructions } = useContext(NewProposalContext)
  const handleSetForm = ({ propertyName, value }) => {
    setFormErrors({})
    setForm({ ...form, [propertyName]: value })
  }
  async function getInstruction(): Promise<UiInstruction> {
    const isValid = await validateInstruction({ schema, form, setFormErrors })
    const instruction = new TransactionInstruction({
      keys: [
        {
          pubkey: new PublicKey('HEPfmxFKcTRTsxoWCatDQeKViDih3XrCD7eVs5t9iums'),
          isSigner: true,
          isWritable: false,
        },
      ],
      programId: new PublicKey('9e78qsrsE2e5Q97T1biobry8mSot8NorEDJHJnMa5CpN'),
      data: Buffer.alloc(0),
    })
    const serializedInstruction = serializeInstructionToBase64(instruction)
    console.log('Inst:', serializedInstruction)
    const obj: UiInstruction = {
      serializedInstruction: serializedInstruction,
      isValid,
      governance: form.governedAccount?.governance,
    }
    return obj
  }
  useEffect(() => {
    handleSetInstructions(
      { governedAccount: form.governedAccount?.governance, getInstruction },
      index
    )
  }, [form])
  const schema = yup.object().shape({
    governedAccount: yup
      .object()
      .nullable()
      .required('Governed account is required'),
    base64: yup
      .string()
      .required('Instruction is required')
      .test('base64Test', 'Invalid base64', function (val: string) {
        if (val) {
          try {
            getInstructionDataFromBase64(val)
            return true
          } catch (e) {
            return false
          }
        } else {
          return this.createError({
            message: `Instruction is required`,
          })
        }
      }),
  })

  return (
    <>
      <GovernedAccountSelect
        label="Governance"
        governedAccounts={governedMultiTypeAccounts}
        onChange={(value) => {
          handleSetForm({ value, propertyName: 'governedAccount' })
        }}
        value={form.governedAccount}
        error={formErrors['governedAccount']}
        shouldBeGoverned={shouldBeGoverned}
        governance={governance}
      />
      <Input
        label="Name"
        value={form.name}
        type="string"
        onChange={(event) => {
          handleSetForm({
            value: event.target.value,
            propertyName: 'name',
          })
        }}
        step={1}
        error={formErrors['name']}
      />
    </>
  )
}

export default HelloContract
