import { useContext, useEffect, useState } from 'react'
import * as yup from 'yup'
import { isFormValid, validatePubkey } from '@utils/formValidation'
import { UiInstruction } from '@utils/uiTypes/proposalCreationTypes'
import useGovernanceAssets from '@hooks/useGovernanceAssets'
import { Governance } from '@solana/spl-governance'
import { ProgramAccount } from '@solana/spl-governance'
import { serializeInstructionToBase64 } from '@solana/spl-governance'
import useWalletOnePointOh from '@hooks/useWalletOnePointOh'
import InstructionForm, { InstructionInput } from '../FormCreator'
import { InstructionInputType } from '../inputInstructionType'
import { NewProposalContext } from '../../../new'
import useLegacyConnectionContext from '@hooks/useLegacyConnectionContext'
import { PublicKey, TransactionInstruction } from '@solana/web3.js'
import { AssetAccount } from '@utils/uiTypes/assets'
import { StakeConnection, STAKING_ADDRESS } from '@pythnetwork/staking'
import { Wallet } from '@coral-xyz/anchor'

export interface PythUpdatePoolAuthorityForm {
  governedAccount: AssetAccount | null
  poolAuthority: string
}

const INSTRUCTION_DISCRIMINATOR = new Uint8Array([160, 162, 113, 9, 99, 187, 23, 239]);

const PythUpdatePoolAuthority = ({
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
  const [form, setForm] = useState<PythUpdatePoolAuthorityForm>({
    governedAccount: null,
    poolAuthority: '',
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
      const stakeConnection = await StakeConnection.createStakeConnection(
        connection.current,
        {} as Wallet,
        STAKING_ADDRESS
      )

      const poolAuthorityPublicKey = new PublicKey(form.poolAuthority)
      const instruction : TransactionInstruction = {
        keys: [
          {pubkey : form.governedAccount.governance.pubkey, isSigner: true, isWritable: false},
          {pubkey : stakeConnection.configAddress, isSigner: false, isWritable: true},
        ],
        programId : stakeConnection.program.programId,
        data : Buffer.concat([INSTRUCTION_DISCRIMINATOR, poolAuthorityPublicKey.toBuffer()])
      }

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
      poolAuthority: yup
      .string()
      .required('Pool authority is required')
      .test(
        'is-pool-authority-valid',
        'Invalid Pool Authority',
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
      label: 'Pool Authority',
      initialValue: form.poolAuthority,
      type: InstructionInputType.INPUT,
      inputType: 'text',
      name: 'poolAuthority',
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

export default PythUpdatePoolAuthority
