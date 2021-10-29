/* eslint-disable @typescript-eslint/no-non-null-assertion */
import React, { useContext, useEffect, useState } from 'react'
import useRealm from '@hooks/useRealm'
import { PublicKey } from '@solana/web3.js'
import * as yup from 'yup'
import { isFormValid } from '@utils/formValidation'
import {
  Instruction,
  ProgramUpgradeForm,
} from '@utils/uiTypes/proposalCreationTypes'
import { NewProposalContext } from '../../new'
import useInstructions from '@hooks/useInstructions'
import ProgramGovernedAccountSelect from '../ProgramGovernedAccountSelect'
import { Governance, GovernanceAccountType } from '@models/accounts'
import { ParsedAccount } from '@models/core/accounts'
import useWalletStore from 'stores/useWalletStore'
import { createUpgradeInstruction } from '@tools/sdk/bpfUpgradeableLoader/createUpgradeInstruction'
import { serializeInstructionToBase64 } from '@models/serialisation'
import Input from '@components/inputs/Input'
import { debounce } from '@utils/debounce'
import { tryParseKey } from '@tools/validators/pubkey'
import { validateBuffer } from '@utils/validations'

const ProgramUpgrade = ({
  index,
  governance,
}: {
  index: number
  governance: ParsedAccount<Governance> | null
}) => {
  const connection = useWalletStore((s) => s.connection)
  const wallet = useWalletStore((s) => s.current)
  const { realmInfo } = useRealm()
  const { getGovernancesByAccountType } = useInstructions()
  const programGovernances = getGovernancesByAccountType(
    GovernanceAccountType.ProgramGovernance
  )
  const shouldBeGoverned = index !== 0 && governance
  const programId: PublicKey | undefined = realmInfo?.programId
  const [form, setForm] = useState<ProgramUpgradeForm>({
    governedAccount: undefined,
    programId: programId?.toString(),
    bufferAddress: '',
  })
  const [formErrors, setFormErrors] = useState({})
  const { handleSetInstructions } = useContext(NewProposalContext)
  const handleSetForm = ({ propertyName, value }) => {
    setFormErrors({})
    setForm({ ...form, [propertyName]: value })
  }
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
      programId &&
      form.governedAccount?.info &&
      wallet?.publicKey
    ) {
      const upgradeIx = await createUpgradeInstruction(
        form.governedAccount.info.governedAccount,
        new PublicKey(form.bufferAddress),
        form.governedAccount.pubkey,
        wallet!.publicKey
      )
      serializedInstruction = serializeInstructionToBase64(upgradeIx)
    }
    const obj: Instruction = {
      serializedInstruction: serializedInstruction,
      isValid,
      governedAccount: form.governedAccount,
    }
    return obj
  }
  useEffect(() => {
    handleSetForm({
      propertyName: 'programId',
      value: programId?.toString(),
    })
  }, [realmInfo?.programId])

  useEffect(() => {
    if (form.bufferAddress) {
      debounce.debounceFcn(async () => {
        const pubKey = tryParseKey(form.bufferAddress)
        if (pubKey) {
          console.log('buffer ok')
        } else {
          console.log('buffer not ok')
        }
      })
    }
  }, [form.bufferAddress])
  useEffect(() => {
    handleSetInstructions(
      { governedAccount: form.governedAccount, getInstruction },
      index
    )
  }, [form])

  const schema = yup.object().shape({
    bufferAddress: yup
      .string()
      .test('accountTests', 'Buffer validation', async function (val: string) {
        if (val) {
          try {
            await validateBuffer(connection, val, form.governedAccount?.pubkey)
            return true
          } catch (e) {
            return this.createError({
              message: `${e}`,
            })
          }
        } else {
          return this.createError({
            message: `Buffer address is required`,
          })
        }
      }),
    governedAccount: yup
      .object()
      .nullable()
      .required('Program governed account is required'),
  })

  return (
    <>
      <ProgramGovernedAccountSelect
        programGovernances={programGovernances}
        onChange={(value) => {
          handleSetForm({ value, propertyName: 'governedAccount' })
        }}
        value={form.governedAccount?.info.governedAccount.toBase58()}
        error={formErrors['governedAccount']}
        shouldBeGoverned={shouldBeGoverned}
        governance={governance}
      ></ProgramGovernedAccountSelect>
      <Input
        label="Buffer address"
        value={form.bufferAddress}
        type="text"
        onChange={(evt) =>
          handleSetForm({
            value: evt.target.value,
            propertyName: 'bufferAddress',
          })
        }
        error={formErrors['bufferAddress']}
      />
    </>
  )
}

export default ProgramUpgrade
