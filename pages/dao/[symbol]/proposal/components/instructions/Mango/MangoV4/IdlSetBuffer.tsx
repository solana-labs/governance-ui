/* eslint-disable @typescript-eslint/no-non-null-assertion */
import React, { useContext, useEffect, useState } from 'react'
import { PublicKey, TransactionInstruction } from '@solana/web3.js'
import * as yup from 'yup'
import { isFormValid, validatePubkey } from '@utils/formValidation'
import { UiInstruction } from '@utils/uiTypes/proposalCreationTypes'
import useGovernanceAssets from '@hooks/useGovernanceAssets'
import { Governance } from '@solana/spl-governance'
import { ProgramAccount } from '@solana/spl-governance'
import useWalletStore from 'stores/useWalletStore'
import { serializeInstructionToBase64 } from '@solana/spl-governance'
import { AccountType, AssetAccount } from '@utils/uiTypes/assets'
import UseMangoV4 from '@hooks/useMangoV4'
import { NewProposalContext } from '../../../../new'
import InstructionForm, {
  InstructionInput,
  InstructionInputType,
} from '../../FormCreator'
import { Layout, rustEnum, struct } from '@project-serum/borsh'

interface AltSetForm {
  governedAccount: AssetAccount | null
  programId: string
  idlAccount: string
  buffer: string
}

const IdlSetBuffer = ({
  index,
  governance,
}: {
  index: number
  governance: ProgramAccount<Governance> | null
}) => {
  const wallet = useWalletStore((s) => s.current)
  const { mangoGroup } = UseMangoV4()
  const { assetAccounts } = useGovernanceAssets()
  const solAccounts = assetAccounts.filter(
    (x) =>
      x.type === AccountType.SOL &&
      mangoGroup?.admin &&
      x.extensions.transferAddress?.equals(mangoGroup.admin)
  )
  const shouldBeGoverned = !!(index !== 0 && governance)
  const [form, setForm] = useState<AltSetForm>({
    governedAccount: null,
    programId: '4MangoMjqJ2firMokCjjGgoK8d4MXcrgL7XJaL3w6fVg',
    idlAccount: '3foqXduY5PabCn6LjNrLo3waNf3Hy6vQgqavoVUCsUN9',
    buffer: '',
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
      const ix = await createSetBuffer(
        new PublicKey(form.programId),
        new PublicKey(form.buffer),
        new PublicKey(form.idlAccount),
        form.governedAccount.extensions.transferAddress!
      )
      console.log(ix)
      serializedInstruction = serializeInstructionToBase64(ix)
    }
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
      options: solAccounts,
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

export async function createSetBuffer(
  programId: PublicKey,
  buffer: PublicKey,
  idlAccount: PublicKey,
  idlAuthority: PublicKey
) {
  const data = encodeInstruction({ setBuffer: {} })

  const keys = [
    {
      pubkey: buffer,
      isWritable: true,
      isSigner: false,
    },
    { pubkey: idlAccount, isWritable: true, isSigner: false },
    { pubkey: idlAuthority, isWritable: false, isSigner: true },
  ]

  return new TransactionInstruction({
    keys,
    programId,
    data,
  })
}

const IDL_INSTRUCTION_LAYOUT: Layout<IdlInstruction> = rustEnum([
  struct([], 'create'),
  struct([], 'createBuffer'),
  struct([], 'write'),
  struct([], 'setBuffer'),
  struct([], 'setAuthority'),
])

export const IDL_TAG = Buffer.from('0a69e9a778bcf440', 'hex').reverse()

export function encodeInstruction(i: IdlInstruction): Buffer {
  const buffer = Buffer.alloc(1000) // TODO: use a tighter buffer.
  const len = IDL_INSTRUCTION_LAYOUT.encode(i, buffer)
  return Buffer.concat([IDL_TAG, buffer.slice(0, len)])
}

// Simplified since we only use the SetBuffer variant.
export type IdlInstruction =
  | Create
  | CreateBuffer
  | Write
  | SetBuffer
  | SetAuthority

// eslint-disable-next-line @typescript-eslint/ban-types
type Create = {}
// eslint-disable-next-line @typescript-eslint/ban-types
type CreateBuffer = {}
// eslint-disable-next-line @typescript-eslint/ban-types
type Write = {}
// eslint-disable-next-line @typescript-eslint/ban-types
type SetBuffer = {}
// eslint-disable-next-line @typescript-eslint/ban-types
type SetAuthority = {}
