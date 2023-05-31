import React, { useContext, useEffect, useState } from 'react'
import {
  Governance,
  ProgramAccount,
  serializeInstructionToBase64,
} from '@solana/spl-governance'
import * as yup from 'yup'
import { PublicKey } from '@solana/web3.js'
import useRealm from '@hooks/useRealm'
import { createObligationAccount } from '@tools/sdk/solend/createObligationAccount'
import { isFormValid } from '@utils/formValidation'
import {
  CreateSolendObligationAccountForm,
  UiInstruction,
} from '@utils/uiTypes/proposalCreationTypes'

/* eslint-disable @typescript-eslint/no-non-null-assertion */

import { NewProposalContext } from '../../../new'
import GovernedAccountSelect from '../../GovernedAccountSelect'
import useGovernanceAssets from '@hooks/useGovernanceAssets'
import useWalletOnePointOh from '@hooks/useWalletOnePointOh'
import useLegacyConnectionContext from '@hooks/useLegacyConnectionContext'

const CreateObligationAccount = ({
  index,
  governance,
}: {
  index: number
  governance: ProgramAccount<Governance> | null
}) => {
  const connection = useLegacyConnectionContext()
  const wallet = useWalletOnePointOh()
  const { realmInfo } = useRealm()

  // Hardcoded gate used to be clear about what cluster is supported for now
  if (connection.cluster !== 'mainnet') {
    return <>This instruction does not support {connection.cluster}</>
  }
  // eslint-disable-next-line react-hooks/rules-of-hooks -- TODO this is potentially quite serious! please fix next time the file is edited, -@asktree
  const { assetAccounts } = useGovernanceAssets()
  const shouldBeGoverned = !!(index !== 0 && governance)
  const programId: PublicKey | undefined = realmInfo?.programId
  // eslint-disable-next-line react-hooks/rules-of-hooks -- TODO this is potentially quite serious! please fix next time the file is edited, -@asktree
  const [form, setForm] = useState<CreateSolendObligationAccountForm>({})
  // eslint-disable-next-line react-hooks/rules-of-hooks -- TODO this is potentially quite serious! please fix next time the file is edited, -@asktree
  const [formErrors, setFormErrors] = useState({})
  // eslint-disable-next-line react-hooks/rules-of-hooks -- TODO this is potentially quite serious! please fix next time the file is edited, -@asktree
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
      !wallet?.publicKey
    ) {
      return {
        serializedInstruction: '',
        isValid: false,
        governance: form.governedAccount?.governance,
      }
    }

    const tx = await createObligationAccount({
      fundingAddress: wallet.publicKey,
      walletAddress: form.governedAccount.governance.pubkey,
    })

    return {
      serializedInstruction: serializeInstructionToBase64(tx),
      isValid: true,
      governance: form.governedAccount.governance,
    }
  }

  // eslint-disable-next-line react-hooks/rules-of-hooks -- TODO this is potentially quite serious! please fix next time the file is edited, -@asktree
  useEffect(() => {
    handleSetForm({
      propertyName: 'programId',
      value: programId?.toString(),
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps -- TODO please fix, it can cause difficult bugs. You might wanna check out https://bobbyhadz.com/blog/react-hooks-exhaustive-deps for info. -@asktree
  }, [programId])

  // eslint-disable-next-line react-hooks/rules-of-hooks -- TODO this is potentially quite serious! please fix next time the file is edited, -@asktree
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
  })

  return (
    <GovernedAccountSelect
      label="Wallet"
      governedAccounts={assetAccounts}
      onChange={(value) => {
        handleSetForm({ value, propertyName: 'governedAccount' })
      }}
      value={form.governedAccount}
      error={formErrors['governedAccount']}
      shouldBeGoverned={shouldBeGoverned}
      governance={governance}
    />
  )
}

export default CreateObligationAccount
