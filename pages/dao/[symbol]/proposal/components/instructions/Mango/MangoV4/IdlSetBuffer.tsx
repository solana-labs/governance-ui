/* eslint-disable @typescript-eslint/no-non-null-assertion */
import React, { useContext, useEffect, useState } from 'react'
import { PublicKey, TransactionInstruction } from '@solana/web3.js'
import * as yup from 'yup'
import { isFormValid, validatePubkey } from '@utils/formValidation'
import { UiInstruction } from '@utils/uiTypes/proposalCreationTypes'
import useGovernanceAssets from '@hooks/useGovernanceAssets'
import { Governance } from '@solana/spl-governance'
import { ProgramAccount } from '@solana/spl-governance'
import { serializeInstructionToBase64 } from '@solana/spl-governance'
import { AccountType, AssetAccount } from '@utils/uiTypes/assets'
import { NewProposalContext } from '../../../../new'
import InstructionForm, {
  InstructionInput,
  InstructionInputType,
} from '../../FormCreator'
import useWalletOnePointOh from '@hooks/useWalletOnePointOh'

interface AltSetForm {
  governedAccount: AssetAccount | null
  programId: string
  idlAccount: string
  buffer: string
  holdupTime: number
}

const IdlSetBuffer = ({
  index,
  governance,
}: {
  index: number
  governance: ProgramAccount<Governance> | null
}) => {
  const wallet = useWalletOnePointOh()
  const { assetAccounts } = useGovernanceAssets()
  const govAccounts = assetAccounts.filter(
    (x) => x.type === AccountType.PROGRAM
  )
  const shouldBeGoverned = !!(index !== 0 && governance)
  const [form, setForm] = useState<AltSetForm>({
    governedAccount: null,
    programId: '4MangoMjqJ2firMokCjjGgoK8d4MXcrgL7XJaL3w6fVg',
    idlAccount: '3foqXduY5PabCn6LjNrLo3waNf3Hy6vQgqavoVUCsUN9',
    buffer: '',
    holdupTime: 0,
  })
  const [formErrors, setFormErrors] = useState({})
  const { handleSetInstructions } = useContext(NewProposalContext)

  const validateInstruction = async (): Promise<boolean> => {
    const { isValid, validationErrors } = await isFormValid(schema, form)
    setFormErrors(validationErrors)
    return isValid
  }
  async function getInstruction(): Promise<UiInstruction> {
    const isValid = await validateInstruction()
    let serializedInstruction = ''
    if (
      isValid &&
      form.governedAccount?.governance?.account &&
      wallet?.publicKey
    ) {
      const ix = await createIdlUpgradeInstruction(
        new PublicKey(form.programId),
        new PublicKey(form.buffer),
        form.governedAccount.governance.pubkey!,
        new PublicKey(form.idlAccount)
      )
      serializedInstruction = serializeInstructionToBase64(ix)
    }
    const obj: UiInstruction = {
      serializedInstruction: serializedInstruction,
      isValid,
      governance: form.governedAccount?.governance,
      customHoldUpTime: form.holdupTime,
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
      .required('Program governed account is required'),
    programId: yup
      .string()
      .required()
      .test('is-valid-programId', 'Please enter a valid PublicKey', (value) =>
        value ? validatePubkey(value) : true
      ),
    idlAccount: yup
      .string()
      .required()
      .test('is-idl-account', 'Please enter a valid PublicKey', (value) =>
        value ? validatePubkey(value) : true
      ),
    buffer: yup
      .string()
      .required()
      .test('is-buffer', 'Please enter a valid PublicKey', (value) =>
        value ? validatePubkey(value) : true
      ),
  })
  const inputs: InstructionInput[] = [
    {
      label: 'Governance',
      initialValue: form.governedAccount,
      name: 'governedAccount',
      type: InstructionInputType.GOVERNED_ACCOUNT,
      shouldBeGoverned: shouldBeGoverned as any,
      governance: governance,
      options: govAccounts,
    },
    {
      label: 'Instruction hold up time (days)',
      initialValue: form.holdupTime,
      type: InstructionInputType.INPUT,
      inputType: 'number',
      name: 'holdupTime',
    },
    {
      label: 'Program',
      initialValue: form.programId,
      type: InstructionInputType.INPUT,
      name: 'programId',
    },
    {
      label: 'Idl Account',
      initialValue: form.idlAccount,
      type: InstructionInputType.INPUT,
      name: 'idlAccount',
    },
    {
      label: 'Buffer',
      initialValue: form.buffer,
      type: InstructionInputType.INPUT,
      name: 'buffer',
    },
  ]

  return (
    <>
      {form && (
        <InstructionForm
          outerForm={form}
          setForm={setForm}
          inputs={inputs}
          setFormErrors={setFormErrors}
          formErrors={formErrors}
        ></InstructionForm>
      )}
    </>
  )
}

export default IdlSetBuffer

export async function createIdlUpgradeInstruction(
  programId: PublicKey,
  bufferAddress: PublicKey,
  upgradeAuthority: PublicKey,
  idlAccount: PublicKey
) {
  const prefix = Buffer.from('0a69e9a778bcf440', 'hex')
  const ixn = Buffer.from('03', 'hex')
  const data = Buffer.concat([prefix.reverse(), ixn])
  const idlAddr = idlAccount

  const keys = [
    {
      pubkey: bufferAddress,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: idlAddr,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: upgradeAuthority,
      isWritable: true,
      isSigner: true,
    },
  ]

  return new TransactionInstruction({
    keys,
    programId,
    data,
  })
}
