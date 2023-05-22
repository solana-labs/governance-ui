import React, { useContext, useEffect, useState } from 'react'
import * as yup from 'yup'

import {
  Governance,
  ProgramAccount,
  serializeInstructionToBase64,
} from '@solana/spl-governance'
import { PublicKey } from '@solana/web3.js'
import useRealm from '@hooks/useRealm'
import { createAssociatedTokenAccount } from '@utils/associated'
import { isFormValid, validatePubkey } from '@utils/formValidation'
import {
  CreateAssociatedTokenAccountForm,
  UiInstruction,
} from '@utils/uiTypes/proposalCreationTypes'

/* eslint-disable @typescript-eslint/no-non-null-assertion */
import useWalletStore from 'stores/useWalletStore'

import { NewProposalContext } from '../../new'
import GovernedAccountSelect from '../GovernedAccountSelect'
import useGovernanceAssets from '@hooks/useGovernanceAssets'
import TokenMintInput from '@components/inputs/TokenMintInput'
import useWalletOnePointOh from '@hooks/useWalletOnePointOh'
import useLegacyConnectionContext from '@hooks/useLegacyConnectionContext'

const CreateAssociatedTokenAccount = ({
  index,
  governance,
}: {
  index: number
  governance: ProgramAccount<Governance> | null
}) => {
  const connection = useLegacyConnectionContext()
  const wallet = useWalletOnePointOh()
  const { realmInfo } = useRealm()

  const { assetAccounts } = useGovernanceAssets()

  const shouldBeGoverned = !!(index !== 0 && governance)
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
      !form.splTokenMint ||
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
      new PublicKey(form.splTokenMint)
    )

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
    // eslint-disable-next-line react-hooks/exhaustive-deps -- TODO please fix, it can cause difficult bugs. You might wanna check out https://bobbyhadz.com/blog/react-hooks-exhaustive-deps for info. -@asktree
  }, [programId])

  useEffect(() => {
    handleSetInstructions(
      {
        governedAccount: form.governedAccount?.governance,
        getInstruction,
      },
      index
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps -- TODO please fix, it can cause difficult bugs. You might wanna check out https://bobbyhadz.com/blog/react-hooks-exhaustive-deps for info. -@asktree
  }, [form])

  const schema = yup.object().shape({
    governedAccount: yup
      .object()
      .nullable()
      .required('Governed account is required'),
    splTokenMint: yup
      .string()
      .test(validatePubkey)
      .required('SPL Token Mint is required'),
  })

  return (
    <>
      <GovernedAccountSelect
        label="Governance"
        governedAccounts={assetAccounts}
        onChange={(value) => {
          handleSetForm({ value, propertyName: 'governedAccount' })
        }}
        value={form.governedAccount}
        error={formErrors['governedAccount']}
        shouldBeGoverned={shouldBeGoverned}
        governance={governance}
      />

      <TokenMintInput
        noMaxWidth={false}
        label="SPL Token Mint"
        onValidMintChange={(mintAddress, _) => {
          handleSetForm({
            value: mintAddress,
            propertyName: 'splTokenMint',
          })
        }}
      />
    </>
  )
}

export default CreateAssociatedTokenAccount
