import { useContext, useEffect, useState } from 'react'
import * as yup from 'yup'
import { serializeInstructionToBase64 } from '@solana/spl-governance'
import { TransactionInstruction } from '@solana/web3.js'
import { debounce } from '@utils/debounce'
import { isFormValid } from '@utils/formValidation'
import { GovernedMultiTypeAccount } from '@utils/tokens'
import { UiInstruction } from '@utils/uiTypes/proposalCreationTypes'

import { NewProposalContext } from 'pages/dao/[symbol]/proposal/new'
import useWalletStore from 'stores/useWalletStore'

function useInstructionFormBuilder<
  T extends {
    governedAccount?: GovernedMultiTypeAccount
  }
>({
  index,
  initialFormValues,
  schema,
  buildInstruction,
}: {
  index?: number
  initialFormValues: T
  schema: yup.ObjectSchema<
    {
      [key in keyof T]: yup.AnySchema
    }
  >
  buildInstruction?: () => Promise<TransactionInstruction>
}) {
  const connection = useWalletStore((s) => s.connection)
  const wallet = useWalletStore((s) => s.current)
  const { handleSetInstructions } = useContext(NewProposalContext)

  const [form, setForm] = useState<T>(initialFormValues)
  const [formErrors, setFormErrors] = useState({})

  const handleSetForm = ({ propertyName, value }) => {
    setFormErrors({})
    setForm({ ...form, [propertyName]: value })
  }

  const validateForm = async (): Promise<boolean> => {
    const { isValid, validationErrors } = await isFormValid(schema, form)
    setFormErrors(validationErrors)
    return isValid
  }

  const getInstruction = async (): Promise<UiInstruction> => {
    if (
      !wallet?.publicKey ||
      !form.governedAccount?.governance?.account ||
      //!buildInstruction ||
      !(await validateForm())
    ) {
      return {
        serializedInstruction: '',
        isValid: false,
        governance: form.governedAccount?.governance,
      }
    }

    try {
      return {
        serializedInstruction: buildInstruction
          ? serializeInstructionToBase64(await buildInstruction())
          : '',
        isValid: true,
        governance: form.governedAccount?.governance,
      }
    } catch (e) {
      console.error(e)
      return {
        serializedInstruction: '',
        isValid: false,
        governance: form.governedAccount?.governance,
      }
    }
  }

  useEffect(() => {
    handleSetForm({
      propertyName: 'governedAccount',
      value: initialFormValues.governedAccount,
    })
  }, [JSON.stringify(initialFormValues.governedAccount)])

  useEffect(() => {
    console.debug('form', form)
    debounce.debounceFcn(async () => {
      await validateForm()
    })
    handleSetInstructions(
      { governedAccount: form.governedAccount?.governance, getInstruction },
      index
    )
  }, [form])

  return {
    form,
    setForm,
    wallet,
    connection,
    formErrors,
    handleSetForm,
    validateForm,
  }
}

export default useInstructionFormBuilder
