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
  const [governedAccounts, setGoverernedAccounts] = useState<
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
      console.log(matchedGovernances)
      setGoverernedAccounts(matchedGovernances)
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
      .required('Program governed account is required'),
  })

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
    </>
  )
}

export default Base64
