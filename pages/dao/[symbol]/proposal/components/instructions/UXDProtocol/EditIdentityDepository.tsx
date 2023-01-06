import { useContext, useEffect, useState } from 'react'
import * as yup from 'yup'
import {
  Governance,
  ProgramAccount,
  serializeInstructionToBase64,
} from '@solana/spl-governance'
import {
  Controller,
  IdentityDepository,
  USDC,
  USDC_DECIMALS,
  UXD_DECIMALS,
} from '@uxd-protocol/uxd-client'
import Input from '@components/inputs/Input'
import Switch from '@components/Switch'
import useGovernanceAssets from '@hooks/useGovernanceAssets'
import { uxdClient } from '@tools/sdk/uxdProtocol/uxdClient'
import { isFormValid } from '@utils/formValidation'
import {
  UiInstruction,
  UXDEditIdentityDepositoryForm,
} from '@utils/uiTypes/proposalCreationTypes'
import useWalletStore from 'stores/useWalletStore'
import { NewProposalContext } from '../../../new'
import GovernedAccountSelect from '../../GovernedAccountSelect'

const schema = yup.object().shape({
  governedAccount: yup
    .object()
    .nullable()
    .required('Governance account is required'),
  mintingDisabled: yup.boolean(),
  redeemableAmountUnderManagementCap: yup
    .number()
    .min(0, 'Redeemable amount under management cap should be min 0'),
})

const EditIdentityDepository = ({
  index,
  governance,
}: {
  index: number
  governance: ProgramAccount<Governance> | null
}) => {
  const [mintingDisabledChange, setMintingDisabledChange] = useState<boolean>(
    false
  )
  const [
    redeemableAmountUnderManagementCapChange,
    setRedeemableAmountUnderManagementCapChange,
  ] = useState<boolean>(false)

  const connection = useWalletStore((s) => s.connection)
  const shouldBeGoverned = !!(index !== 0 && governance)
  const [formErrors, setFormErrors] = useState({})
  const { handleSetInstructions } = useContext(NewProposalContext)
  const { assetAccounts } = useGovernanceAssets()

  const [form, setForm] = useState<UXDEditIdentityDepositoryForm>({
    governedAccount: undefined,
    mintingDisabled: false,
    redeemableAmountUnderManagementCap: 0,
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

    const identityDepository = new IdentityDepository(
      USDC,
      'USDC',
      USDC_DECIMALS,
      uxdProgramId
    )

    const ix = client.createEditIdentityDepositoryInstruction(
      new Controller('UXD', UXD_DECIMALS, uxdProgramId),
      identityDepository,
      authority,
      {
        redeemableAmountUnderManagementCap: redeemableAmountUnderManagementCapChange
          ? form.redeemableAmountUnderManagementCap
          : undefined,
        mintingDisabled: mintingDisabledChange
          ? form.mintingDisabled!
          : undefined,
      },
      { preflightCommitment: 'processed', commitment: 'processed' }
    )

    return {
      serializedInstruction: serializeInstructionToBase64(ix),
      isValid: true,
      governance: form.governedAccount.governance,
      shouldSplitIntoSeparateTxs: true,
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

      <h5>Minting Disable</h5>
      <div className="flex">
        <span className="mr-2">Do not change</span>
        <Switch
          checked={mintingDisabledChange}
          onChange={(checked) => setMintingDisabledChange(checked)}
        />
        <span className="ml-2">Change</span>
      </div>

      {mintingDisabledChange ? (
        <div className="flex">
          <span className="mr-2">Minting is Enabled</span>
          <Switch
            checked={form.mintingDisabled!}
            onChange={(checked) =>
              handleSetForm({
                value: checked,
                propertyName: 'mintingDisabled',
              })
            }
          />
          <span className="ml-2">Minting is Disabled</span>
        </div>
      ) : null}

      <h5>Redeemable Depository Supply Cap</h5>
      <Switch
        checked={redeemableAmountUnderManagementCapChange}
        onChange={(checked) => {
          handleSetForm({
            value: undefined,
            propertyName: 'uiRedeemableAmountUnderManagementCap',
          })
          setRedeemableAmountUnderManagementCapChange(checked)
        }}
      />
      {redeemableAmountUnderManagementCapChange ? (
        <Input
          type="number"
          value={form.redeemableAmountUnderManagementCap}
          min={0}
          max={10 ** 12}
          onChange={(evt) =>
            handleSetForm({
              value: evt.target.value,
              propertyName: 'redeemableAmountUnderManagementCap',
            })
          }
          error={formErrors['redeemableAmountUnderManagementCap']}
        />
      ) : null}
    </>
  )
}

export default EditIdentityDepository
