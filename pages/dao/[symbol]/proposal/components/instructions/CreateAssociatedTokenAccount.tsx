/* eslint-disable @typescript-eslint/no-non-null-assertion */
import React, { useContext, useEffect, useState } from 'react'
import useRealm from '@hooks/useRealm'
import { PublicKey } from '@solana/web3.js'
import * as yup from 'yup'
import { isFormValid } from '@utils/formValidation'
import {
  UiInstruction,
  CreateAssociatedTokenAccountForm,
} from '@utils/uiTypes/proposalCreationTypes'
import { NewProposalContext } from '../../new'
import useWalletStore from 'stores/useWalletStore'
import Select from '@components/inputs/Select'
import {
  ProgramAccount,
  serializeInstructionToBase64,
  Governance,
} from '@solana/spl-governance'
import GovernedAccountSelect from '../GovernedAccountSelect'
import { createAssociatedTokenAccount } from '@utils/associated'
import { getSplTokenMintAddressByUIName, SPL_TOKENS } from '@utils/splTokens'
import useGovernedMultiTypeAccounts from '@hooks/useGovernedMultiTypeAccounts'

const CreateAssociatedTokenAccount = ({
  index,
  governance,
}: {
  index: number
  governance: ProgramAccount<Governance> | null
}) => {
  const connection = useWalletStore((s) => s.connection)
  const wallet = useWalletStore((s) => s.current)
  const { realmInfo } = useRealm()
  const { governedMultiTypeAccounts } = useGovernedMultiTypeAccounts()

  const shouldBeGoverned = index !== 0 && governance
  const programId: PublicKey | undefined = realmInfo?.programId
  const [form, setForm] = useState<CreateAssociatedTokenAccountForm>({})
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

  async function getInstruction(): Promise<UiInstruction> {
    const isValid = await validateInstruction()

    if (
      !connection ||
      !isValid ||
      !programId ||
      !form.governedAccount?.governance?.account ||
      !form.splTokenMintUIName ||
      !wallet?.publicKey
    ) {
      return {
        serializedInstruction: '',
        isValid: false,
        governance: form.governedAccount?.governance,
      }
    }

    const [tx] = await createAssociatedTokenAccount(
      // fundingAddress
      wallet.publicKey,

      // walletAddress
      form.governedAccount.governance.pubkey,

      // splTokenMintAddress
      getSplTokenMintAddressByUIName(form.splTokenMintUIName)
    )

    console.log('infos', {
      governanceAccount: form.governedAccount.governance.account,
      governanceOwner: form.governedAccount.governance.owner.toString(),
      fundingAddress: wallet.publicKey.toString(),
      walletAddress: form.governedAccount.governance.pubkey.toString(),
      splTokenMintName: form.splTokenMintUIName,
      splTokenMintAddress: getSplTokenMintAddressByUIName(
        form.splTokenMintUIName
      ).toString(),
    })

    console.log('tx', tx)

    return {
      serializedInstruction: serializeInstructionToBase64(tx),
      isValid: true,
      governance: form.governedAccount.governance,
    }
  }

  useEffect(() => {
    handleSetForm({
      propertyName: 'programId',
      value: programId?.toString(),
    })
  }, [realmInfo?.programId])

  useEffect(() => {
    handleSetInstructions(
      {
        governedAccount: form.governedAccount?.governance,
        getInstruction,
      },
      index
    )
  }, [form])

  const schema = yup.object().shape({
    governedAccount: yup
      .object()
      .nullable()
      .required('Governed account is required'),
    splTokenMintUIName: yup.string().required('SPL Token Mint is required'),
  })

  return (
    <>
      <GovernedAccountSelect
        label="Governance"
        governedAccounts={governedMultiTypeAccounts}
        onChange={(value) => {
          handleSetForm({ value, propertyName: 'governedAccount' })
        }}
        value={form.governedAccount}
        error={formErrors['governedAccount']}
        shouldBeGoverned={shouldBeGoverned}
        governance={governance}
      ></GovernedAccountSelect>

      <Select
        label="SPL Token Mint"
        value={form.splTokenMintUIName}
        placeholder="Please select..."
        onChange={(value) =>
          handleSetForm({ value, propertyName: 'splTokenMintUIName' })
        }
        error={formErrors['baseTokenName']}
      >
        {Object.entries(SPL_TOKENS).map(([key, { name, mint }]) => (
          <Select.Option key={key} value={name}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span>{name}</span>

              <span style={{ color: 'grey', fontSize: '0.8em' }}>
                {mint.toString()}
              </span>
            </div>
          </Select.Option>
        ))}
      </Select>
    </>
  )
}

export default CreateAssociatedTokenAccount
