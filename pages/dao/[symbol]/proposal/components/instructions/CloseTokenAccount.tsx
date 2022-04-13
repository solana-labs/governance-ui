import React, { useContext, useEffect, useState } from 'react'
import {
  Governance,
  ProgramAccount,
  serializeInstructionToBase64,
} from '@solana/spl-governance'
import {
  getTransferInstructionObj,
  validateInstruction,
} from '@utils/instructionTools'
import { UiInstruction } from '@utils/uiTypes/proposalCreationTypes'
import useWalletStore from 'stores/useWalletStore'

import { NewProposalContext } from '../../new'
import useRealm from '@hooks/useRealm'
import useGovernanceAssets from '@hooks/useGovernanceAssets'
import { AssetAccount } from '@utils/uiTypes/assets'
import InstructionForm, {
  InstructionInput,
  InstructionInputType,
} from './FormCreator'
import { Token, TOKEN_PROGRAM_ID } from '@solana/spl-token'
import * as yup from 'yup'

export interface CloseTokenAccountForm {
  governedAccount: AssetAccount | undefined
  fundsDestinationAccount: string
}

const CloseTokenAccount = ({
  index,
  governance,
}: {
  index: number
  governance: ProgramAccount<Governance> | null
}) => {
  const { realm } = useRealm()
  const wallet = useWalletStore((s) => s.current)
  const connection = useWalletStore((s) => s.connection)
  const shouldBeGoverned = index !== 0 && governance
  const { governedTokenAccountsWithoutNfts } = useGovernanceAssets()
  const [form, setForm] = useState<CloseTokenAccountForm>()
  const [formErrors, setFormErrors] = useState({})
  const { handleSetInstructions } = useContext(NewProposalContext)
  const schema = yup.object().shape({
    governedAccount: yup
      .object()
      .nullable()
      .required('Program governed account is required'),
  })
  async function getInstruction(): Promise<UiInstruction> {
    const isValid = await validateInstruction({ schema, form, setFormErrors })
    let serializedInstructionClose = ''
    let serializedTransfer = ''
    let instructions: any = null
    if (
      isValid &&
      form!.governedAccount?.governance?.account &&
      wallet?.publicKey &&
      realm
    ) {
      instructions = !form!.governedAccount.extensions.token!.account.amount?.isZero()
        ? await getTransferInstructionObj({
            connection: connection,
            governedTokenAccount: form!.governedAccount!,
            amount: form!.governedAccount.extensions.token!.account.amount!,
            destinationAccount: form!.fundsDestinationAccount!,
            wallet: wallet,
          })
        : null
      const closeInstruction = Token.createCloseAccountInstruction(
        TOKEN_PROGRAM_ID,
        form!.governedAccount.extensions.token!.publicKey!,
        wallet.publicKey,
        form!.governedAccount.extensions.token!.account.owner!,
        []
      )
      serializedTransfer = instructions?.transferInstruction
        ? serializeInstructionToBase64(instructions?.transferInstruction)
        : ''
      serializedInstructionClose = serializeInstructionToBase64(
        closeInstruction
      )
    }
    const obj: UiInstruction = {
      prerequisiteInstructions: [],
      serializedInstruction: serializedInstructionClose,
      additionalSerializedInstructions: [],
      isValid,
      governance: form!.governedAccount?.governance,
    }
    if (instructions?.ataInstruction) {
      obj.prerequisiteInstructions?.push(instructions?.ataInstruction)
    }
    if (serializedTransfer) {
      obj.additionalSerializedInstructions!.push(serializedTransfer)
    }
    return obj
  }
  useEffect(() => {
    handleSetInstructions(
      { governedAccount: form?.governedAccount?.governance, getInstruction },
      index
    )
  }, [form])
  const inputs: InstructionInput[] = [
    {
      label: 'Token account',
      initialValue: null,
      name: 'governedAccount',
      type: InstructionInputType.GOVERNED_ACCOUNT,
      shouldBeGoverned: shouldBeGoverned as any,
      governance: governance,
      options: governedTokenAccountsWithoutNfts.filter((x) => !x.isSol),
    },
    {
      label: 'Funds destination account',
      initialValue: '',
      name: 'fundsDestinationAccount',
      type: InstructionInputType.INPUT,
      inputType: 'text',
      hide: form?.governedAccount?.extensions.amount?.isZero(),
    },
  ]
  return (
    <>
      <InstructionForm
        outerForm={form}
        setForm={setForm}
        inputs={inputs}
        setFormErrors={setFormErrors}
        formErrors={formErrors}
      ></InstructionForm>
    </>
  )
}

export default CloseTokenAccount
