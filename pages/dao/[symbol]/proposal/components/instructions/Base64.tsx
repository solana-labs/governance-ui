/* eslint-disable @typescript-eslint/no-non-null-assertion */
import React, { useContext, useEffect, useState } from 'react'
// import useRealm from '@hooks/useRealm'
// import { PublicKey } from '@solana/web3.js'
import * as yup from 'yup'
import { isFormValid } from '@utils/formValidation'
import {
  Base64InstructionForm,
  Instruction,
} from '@utils/uiTypes/proposalCreationTypes'
import { NewProposalContext } from '../../new'
import useInstructions from '@hooks/useInstructions'
import { Governance } from '@models/accounts'
import { ParsedAccount } from '@models/core/accounts'
import useWalletStore from 'stores/useWalletStore'
// import { createUpgradeInstruction } from '@tools/sdk/bpfUpgradeableLoader/createUpgradeInstruction'
// import { serializeInstructionToBase64 } from '@models/serialisation'
// import Input from '@components/inputs/Input'
// import { debounce } from '@utils/debounce'
import GovernedAccountSelect from '../GovernedAccountSelect'
import { GovernedMultiTypeAccount } from '@utils/tokens'
import Input from '@components/inputs/Input'
import Textarea from '@components/inputs/Textarea'
import { getInstructionDataFromBase64 } from '@models/serialisation'

const Base64 = ({
  index,
  governance,
}: {
  index: number
  governance: ParsedAccount<Governance> | null
}) => {
  //   const connection = useWalletStore((s) => s.connection)
  const wallet = useWalletStore((s) => s.current)
  const {
    governancesArray,
    governedTokenAccounts,
    getMintWithGovernances,
  } = useInstructions()
  const shouldBeGoverned = index !== 0 && governance
  const [governedAccounts, setGovernedAccounts] = useState<
    GovernedMultiTypeAccount[]
  >([])
  const [form, setForm] = useState<Base64InstructionForm>({
    governedAccount: undefined,
    base64: '',
    holdUpTime: 0,
  })
  const [formErrors, setFormErrors] = useState({})
  const { handleSetInstructions } = useContext(NewProposalContext)
  const handleSetForm = ({ propertyName, value }) => {
    setFormErrors({})
    setForm({ ...form, [propertyName]: value })
  }
  useEffect(() => {
    async function prepGovernances() {
      const mintWithGovernances = await getMintWithGovernances()
      const matchedGovernances = governancesArray.map((gov) => {
        const governedTokenAccount = governedTokenAccounts.find(
          (x) => x.governance?.pubkey.toBase58() === gov.pubkey.toBase58()
        )
        const mintGovernance = mintWithGovernances.find(
          (x) => x.governance?.pubkey.toBase58() === gov.pubkey.toBase58()
        )
        if (governedTokenAccount) {
          return governedTokenAccount as GovernedMultiTypeAccount
        }
        if (mintGovernance) {
          return mintGovernance as GovernedMultiTypeAccount
        }
        return {
          governance: gov,
        }
      })
      setGovernedAccounts(matchedGovernances)
    }
    prepGovernances()
  }, [])
  const validateInstruction = async (): Promise<boolean> => {
    const { isValid, validationErrors } = await isFormValid(schema, form)
    setFormErrors(validationErrors)
    return isValid
  }
  async function getInstruction(): Promise<Instruction> {
    const isValid = await validateInstruction()
    let serializedInstruction = ''
    if (
      isValid &&
      form.governedAccount?.governance?.info &&
      wallet?.publicKey
    ) {
      const customIx = ''
      serializedInstruction = customIx //serializeInstructionToBase64(customIx)
    }
    const obj: Instruction = {
      serializedInstruction: serializedInstruction,
      isValid,
      governedAccount: form.governedAccount?.governance,
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
            message: `Buffer address is required`,
          })
        }
      }),
  })
  const validateAmountOnBlur = () => {
    const value = form.holdUpTime

    handleSetForm({
      value: parseFloat(
        Math.max(
          Number(0),
          Math.min(Number(Number.MAX_SAFE_INTEGER), Number(value))
        ).toFixed()
      ),
      propertyName: 'holdUpTime',
    })
  }
  return (
    <>
      <GovernedAccountSelect
        label="Governance"
        governedAccounts={governedAccounts}
        onChange={(value) => {
          handleSetForm({ value, propertyName: 'governedAccount' })
        }}
        value={form.governedAccount}
        error={formErrors['governedAccount']}
        shouldBeGoverned={shouldBeGoverned}
        governance={governance}
      ></GovernedAccountSelect>
      <Input
        min={0}
        label="Hol up time (days)"
        value={form.holdUpTime}
        type="number"
        onChange={(event) => {
          handleSetForm({
            value: event.target.value,
            propertyName: 'holdUpTime',
          })
        }}
        step={1}
        error={formErrors['holdUpTime']}
        onBlur={validateAmountOnBlur}
      />
      <Textarea
        label="Instruction"
        placeholder="Base64 encoded serialized Solana instruction"
        wrapperClassName="mb-5"
        value={form.base64}
        onChange={(evt) =>
          handleSetForm({
            value: evt.target.value,
            propertyName: 'base64',
          })
        }
        error={formErrors['base64']}
      ></Textarea>
    </>
  )
}

export default Base64
