/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { useContext, useEffect, useState } from 'react'
import * as yup from 'yup'
import { isFormValid, validatePubkey } from '@utils/formValidation'
import { UiInstruction } from '@utils/uiTypes/proposalCreationTypes'
import useGovernanceAssets from '@hooks/useGovernanceAssets'
import { Governance } from '@solana/spl-governance'
import { ProgramAccount } from '@solana/spl-governance'
import { serializeInstructionToBase64 } from '@solana/spl-governance'
import { MESH_PROGRAM_ID, MeshEditMemberForm } from './common'
import useWalletOnePointOh from '@hooks/useWalletOnePointOh'
import InstructionForm, { InstructionInput } from '../FormCreator'
import { InstructionInputType } from '../inputInstructionType'
import { NewProposalContext } from '../../../new'
import Squads from '@sqds/mesh'
import useLegacyConnectionContext from '@hooks/useLegacyConnectionContext'
import { PublicKey } from '@solana/web3.js'
import { Wallet } from '@coral-xyz/anchor'

const MeshAddMember = ({
  index,
  governance,
}: {
  index: number
  governance: ProgramAccount<Governance> | null
}) => {
  const wallet = useWalletOnePointOh()
  const connection = useLegacyConnectionContext()
  const { assetAccounts } = useGovernanceAssets()
  const shouldBeGoverned = !!(index !== 0 && governance)
  const [form, setForm] = useState<MeshEditMemberForm>({
    governedAccount: null,
    vault: '',
    member: '',
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

    if (
      isValid &&
      form.governedAccount?.governance?.account &&
      wallet?.publicKey
    ) {
      const squads = new Squads({
        connection: connection.current,
        wallet: {} as Wallet,
        multisigProgramId: MESH_PROGRAM_ID,
      })
      const instruction = await squads.buildAddMember(
        new PublicKey(form.vault),
        form.governedAccount.governance.pubkey,
        new PublicKey(form.member)
      )
      return {
        serializedInstruction: serializeInstructionToBase64(instruction),
        isValid,
        governance: form.governedAccount?.governance,
        chunkBy: 1,
      }
    } else {
      return {
        serializedInstruction: '',
        isValid,
        governance: form.governedAccount?.governance,
        chunkBy: 1,
      }
    }
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
    vault: yup
      .string()
      .required('Vault is required')
      .test('is-vault-valid', 'Invalid Vault Account', function (val: string) {
        return val ? validatePubkey(val) : true
      }),
    member: yup
      .string()
      .required('Member is required')
      .test(
        'is-member-valid',
        'Invalid Member Account',
        function (val: string) {
          return val ? validatePubkey(val) : true
        }
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
      options: assetAccounts,
    },
    {
      label: 'Vault',
      initialValue: form.vault,
      type: InstructionInputType.INPUT,
      inputType: 'text',
      name: 'vault',
    },
    {
      label: 'Member',
      initialValue: form.member,
      type: InstructionInputType.INPUT,
      inputType: 'text',
      name: 'member',
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

export default MeshAddMember
