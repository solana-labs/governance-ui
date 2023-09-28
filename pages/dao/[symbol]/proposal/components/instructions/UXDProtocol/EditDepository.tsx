import { useContext, useEffect, useState } from 'react'
import * as yup from 'yup'
import {
  Governance,
  ProgramAccount,
  serializeInstructionToBase64,
} from '@solana/spl-governance'
import Input from '@components/inputs/Input'
import Select from '@components/inputs/Select'
import Switch from '@components/Switch'
import useGovernanceAssets from '@hooks/useGovernanceAssets'
import {
  DEPOSITORY_TYPES,
  editUXDDepositoryIx,
  getDepositoryMintSymbols,
  getDepositoryTypes,
} from '@tools/sdk/uxdProtocol'
import { isFormValid } from '@utils/formValidation'
import {
  UiInstruction,
  UXDEditDepositoryForm,
} from '@utils/uiTypes/proposalCreationTypes'
import { NewProposalContext } from '../../../new'
import GovernedAccountSelect from '../../GovernedAccountSelect'
import SelectOptionList from '../../SelectOptionList'
import useLegacyConnectionContext from '@hooks/useLegacyConnectionContext'

const schema = yup.object().shape({
  governedAccount: yup
    .object()
    .nullable()
    .required('Governance account is required'),
  depositoryType: yup.string().required('Valid Depository type is required'),
  collateralName: yup.string().required('Valid Collateral name is required'),
  mintingFeeInBps: yup
    .number()
    .min(0, 'Minting fee in bps should be min 0')
    .max(255, 'Minting fee in bps should be max 255'),
  redeemingFeeInBps: yup
    .number()
    .min(0, 'Redeeming fee in bps should be min 0')
    .max(255, 'Redeeming fee in bps should be max 255'),
  redeemableAmountUnderManagementCap: yup
    .number()
    .min(0, 'Redeemable amount under management cap should be min 0'),
})

const EditDepository = ({
  index,
  governance,
}: {
  index: number
  governance: ProgramAccount<Governance> | null
}) => {
  const [mintingFeesInBpsChange, setMintingFeesInBpsChange] = useState<boolean>(
    false
  )

  const [
    redeemingFeesInBpsChange,
    setRedeemingFeesInBpsChange,
  ] = useState<boolean>(false)

  const [
    redeemableAmountUnderManagementCapChange,
    setRedeemableAmountUnderManagementCapChange,
  ] = useState<boolean>(false)

  const connection = useLegacyConnectionContext()
  const shouldBeGoverned = !!(index !== 0 && governance)
  const [formErrors, setFormErrors] = useState({})
  const { handleSetInstructions } = useContext(NewProposalContext)
  const { assetAccounts } = useGovernanceAssets()

  const [form, setForm] = useState<UXDEditDepositoryForm>({
    governedAccount: undefined,
    depositoryType: DEPOSITORY_TYPES.CREDIX,
    redeemableAmountUnderManagementCap: 0,
    mintingFeeInBps: 0,
    redeemingFeeInBps: 0,
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
      !form.governedAccount?.governance?.account.governedAccount ||
      !form.collateralName
    ) {
      return {
        serializedInstruction: '',
        isValid: false,
        governance: form.governedAccount?.governance,
      }
    }
    const uxdProgramId =
      form.governedAccount?.governance?.account.governedAccount
    const authority = form.governedAccount.governance.pubkey

    const depositoryMintName = form.collateralName
    const mintingFeeInBps = mintingFeesInBpsChange
      ? form.mintingFeeInBps
      : undefined

    const redeemingFeeInBps = redeemingFeesInBpsChange
      ? form.redeemingFeeInBps
      : undefined

    const redeemableAmountUnderManagementCap = redeemableAmountUnderManagementCapChange
      ? form.redeemableAmountUnderManagementCap
      : undefined

    const ix = await editUXDDepositoryIx(
      connection,
      uxdProgramId,
      form.depositoryType as DEPOSITORY_TYPES,
      {
        authority,
        depositoryMintName,
        mintingFeeInBps,
        redeemingFeeInBps,
        redeemableAmountUnderManagementCap,
      }
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
      <Select
        label="Depository Type"
        value={form.depositoryType}
        placeholder="Please select..."
        onChange={(value) =>
          handleSetForm({ value, propertyName: 'depositoryType' })
        }
        error={formErrors['depositoryType']}
      >
        <SelectOptionList list={getDepositoryTypes(false)} />
      </Select>
      <Select
        label="Collateral Name"
        value={form.collateralName}
        placeholder="Please select..."
        onChange={(value) =>
          handleSetForm({ value, propertyName: 'collateralName' })
        }
        error={formErrors['collateralName']}
      >
        <SelectOptionList list={getDepositoryMintSymbols(connection.cluster)} />
      </Select>

      <h5>Minting Fees in BPS</h5>

      <Switch
        checked={mintingFeesInBpsChange}
        onChange={(checked) => setMintingFeesInBpsChange(checked)}
      />

      {mintingFeesInBpsChange ? (
        <Input
          type="number"
          value={form.mintingFeeInBps}
          min={0}
          max={255}
          onChange={(evt) =>
            handleSetForm({
              value: evt.target.value,
              propertyName: 'mintingFeeInBps',
            })
          }
          error={formErrors['mintingFeeInBps']}
        />
      ) : null}

      <h5>Redeeming Fees in BPS</h5>

      <Switch
        checked={redeemingFeesInBpsChange}
        onChange={(checked) => setRedeemingFeesInBpsChange(checked)}
      />

      {redeemingFeesInBpsChange ? (
        <Input
          type="number"
          value={form.redeemingFeeInBps}
          min={0}
          max={255}
          onChange={(evt) =>
            handleSetForm({
              value: evt.target.value,
              propertyName: 'redeemingFeeInBps',
            })
          }
          error={formErrors['redeemingFeeInBps']}
        />
      ) : null}

      <h5>Redeemable Depository Supply Cap</h5>

      <Switch
        checked={redeemableAmountUnderManagementCapChange}
        onChange={(checked) =>
          setRedeemableAmountUnderManagementCapChange(checked)
        }
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

export default EditDepository
