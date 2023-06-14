import { useContext, useEffect, useState } from 'react'
import * as yup from 'yup'
import { Controller, UXD_DECIMALS } from '@uxd-protocol/uxd-client'
import {
  Governance,
  ProgramAccount,
  serializeInstructionToBase64,
} from '@solana/spl-governance'
import Input from '@components/inputs/Input'
import Switch from '@components/Switch'
import useGovernanceAssets from '@hooks/useGovernanceAssets'
import { uxdClient } from '@tools/sdk/uxdProtocol/uxdClient'
import { isFormValid } from '@utils/formValidation'
import {
  UiInstruction,
  UXDEditControllerForm,
} from '@utils/uiTypes/proposalCreationTypes'
import { NewProposalContext } from '../../../new'
import GovernedAccountSelect from '../../GovernedAccountSelect'
import { useConnection } from '@solana/wallet-adapter-react'

const schema = yup.object().shape({
  governedAccount: yup
    .object()
    .nullable()
    .required('Governance account is required'),
  redeemableGlobalSupplyCap: yup
    .number()
    .min(0, 'Redeemable global supply cap should be min 0'),
})

const EditController = ({
  index,
  governance,
}: {
  index: number
  governance: ProgramAccount<Governance> | null
}) => {
  const [
    redeemableGlobalSupplyCapChange,
    setRedeemableGlobalSupplyCapChange,
  ] = useState<boolean>(false)

  const connection = useConnection()
  const shouldBeGoverned = !!(index !== 0 && governance)
  const [formErrors, setFormErrors] = useState({})
  const { handleSetInstructions } = useContext(NewProposalContext)
  const { assetAccounts } = useGovernanceAssets()

  const [form, setForm] = useState<UXDEditControllerForm>({
    governedAccount: undefined,
    redeemableGlobalSupplyCap: 0,
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
    const ix = client.createEditControllerInstruction(
      new Controller('UXD', UXD_DECIMALS, uxdProgramId),
      authority,
      {
        redeemableGlobalSupplyCap: form.redeemableGlobalSupplyCap,
      },
      { preflightCommitment: 'processed', commitment: 'processed' }
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
    <>
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
      <h5>Redeemable Global Supply Cap</h5>
      <Switch
        checked={redeemableGlobalSupplyCapChange}
        onChange={(checked) => setRedeemableGlobalSupplyCapChange(checked)}
      />
      {redeemableGlobalSupplyCapChange ? (
        <Input
          label="Redeemable Global Supply Cap"
          value={form.redeemableGlobalSupplyCap}
          type="number"
          min={0}
          max={10 ** 12}
          onChange={(evt) =>
            handleSetForm({
              value: evt.target.value,
              propertyName: 'redeemableGlobalSupplyCap',
            })
          }
          error={formErrors['redeemableGlobalSupplyCap']}
        />
      ) : null}
    </>
  )
}

export default EditController
