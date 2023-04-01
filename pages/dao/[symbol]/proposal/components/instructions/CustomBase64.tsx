import React, { useContext, useEffect, useState } from 'react'
import * as yup from 'yup'
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
  UiInstruction,
} from '@utils/uiTypes/proposalCreationTypes'

import { NewProposalContext } from '../../new'
import GovernedAccountSelect from '../GovernedAccountSelect'
import useRealm from '@hooks/useRealm'
import useGovernanceAssets from '@hooks/useGovernanceAssets'
import useWalletOnePointOh from '@hooks/useWallet'

const CustomBase64 = ({
  index,
  governance,
}: {
  index: number
  governance: ProgramAccount<Governance> | null
}) => {
  const { ownVoterWeight } = useRealm()
  const wallet = useWalletOnePointOh()
  const { assetAccounts } = useGovernanceAssets()
  const shouldBeGoverned = !!(index !== 0 && governance)
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
  async function getInstruction(): Promise<UiInstruction> {
    const isValid = await validateInstruction({ schema, form, setFormErrors })
    let serializedInstruction = ''
    if (
      isValid &&
      form.governedAccount?.governance?.account &&
      wallet?.publicKey
    ) {
      serializedInstruction = form.base64
    }
    const obj: UiInstruction = {
      serializedInstruction: serializedInstruction,
      isValid,
      governance: form.governedAccount?.governance,
      customHoldUpTime: form.holdUpTime,
    }
    return obj
  }
  useEffect(() => {
    handleSetInstructions(
      { governedAccount: form.governedAccount?.governance, getInstruction },
      index
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps -- TODO please fix, it can cause difficult bugs. You might wanna check out https://bobbyhadz.com/blog/react-hooks-exhaustive-deps for info. -@asktree
  }, [form])
  const schema = yup.object().shape({
    governedAccount: yup
      .object()
      .nullable()
      .required('Governed account is required'),
    base64: yup
      .string()
      .required('Instruction is required')
      .test(
        'base64Test',
        'Invalid input. Must be base64 encoded governance program InstructionData',
        function (val: string) {
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
        }
      ),
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
        governedAccounts={assetAccounts.filter((x) =>
          ownVoterWeight.canCreateProposal(x.governance.account.config)
        )}
        onChange={(value) => {
          handleSetForm({ value, propertyName: 'governedAccount' })
        }}
        value={form.governedAccount}
        error={formErrors['governedAccount']}
        shouldBeGoverned={shouldBeGoverned}
        governance={governance}
      />
      <Input
        min={0}
        label="Hold up time (days)"
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

export default CustomBase64
