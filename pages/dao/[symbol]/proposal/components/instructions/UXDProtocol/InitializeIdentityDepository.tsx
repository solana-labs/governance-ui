import { useContext, useEffect, useState } from 'react'
import * as yup from 'yup'
import {
  Governance,
  ProgramAccount,
  serializeInstructionToBase64,
} from '@solana/spl-governance'
import { useConnection } from '@solana/wallet-adapter-react'
import {
  Controller,
  IdentityDepository,
  USDC,
  USDC_DECIMALS,
  UXD_DECIMALS,
} from '@uxd-protocol/uxd-client'
import useGovernanceAssets from '@hooks/useGovernanceAssets'
import useWalletOnePointOh from '@hooks/useWalletOnePointOh'
import { uxdClient } from '@tools/sdk/uxdProtocol/uxdClient'
import { isFormValid } from '@utils/formValidation'
import {
  UiInstruction,
  UXDInitializeIdentityDepositoryForm,
} from '@utils/uiTypes/proposalCreationTypes'

import { NewProposalContext } from '../../../new'
import GovernedAccountSelect from '../../GovernedAccountSelect'

const schema = yup.object().shape({
  governedAccount: yup
    .object()
    .nullable()
    .required('Governance account is required'),
})

const InitializeIdentityDepository = ({
  index,
  governance,
}: {
  index: number
  governance: ProgramAccount<Governance> | null
}) => {
  const connection = useConnection()
  const wallet = useWalletOnePointOh()
  const shouldBeGoverned = !!(index !== 0 && governance)
  const [formErrors, setFormErrors] = useState({})
  const { handleSetInstructions } = useContext(NewProposalContext)
  const { assetAccounts } = useGovernanceAssets()

  const [form, setForm] = useState<UXDInitializeIdentityDepositoryForm>({
    governedAccount: undefined,
  })

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
      !wallet?.publicKey ||
      !form.governedAccount?.governance?.account.governedAccount
    ) {
      return {
        serializedInstruction: '',
        isValid: false,
        governance: form.governedAccount?.governance,
      }
    }
    const uxdProgramId =
      form.governedAccount?.governance?.account.governedAccount
    const client = uxdClient(uxdProgramId)
    const authority = form.governedAccount.governance.pubkey
    const payer = wallet.publicKey

    const identityDepository = new IdentityDepository(
      USDC,
      'USDC',
      USDC_DECIMALS,
      uxdProgramId
    )
    const ix = client.createInitializeIdentityDepositoryInstruction(
      new Controller('UXD', UXD_DECIMALS, uxdProgramId),
      identityDepository,
      authority,
      { preflightCommitment: 'processed', commitment: 'processed' },
      payer
    )

    return {
      serializedInstruction: serializeInstructionToBase64(ix),
      isValid: true,
      governance: form.governedAccount.governance,
    }
  }

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

  return (
    <GovernedAccountSelect
      label="Governed account"
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

export default InitializeIdentityDepository
