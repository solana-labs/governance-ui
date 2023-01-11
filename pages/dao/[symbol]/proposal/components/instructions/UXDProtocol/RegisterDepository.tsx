import * as yup from 'yup'
import {
  UiInstruction,
  UXDRegisterDepositoryForm,
} from '@utils/uiTypes/proposalCreationTypes'
import {
  Governance,
  ProgramAccount,
  serializeInstructionToBase64,
} from '@solana/spl-governance'
import useGovernanceAssets from '@hooks/useGovernanceAssets'
import { useState, useContext, useEffect } from 'react'
import useWalletStore from 'stores/useWalletStore'
import { NewProposalContext } from '../../../new'
import { isFormValid } from '@utils/formValidation'
import GovernedAccountSelect from '../../GovernedAccountSelect'
import {
  DEPOSITORY_TYPES,
  getDepositoryMintSymbols,
  getDepositoryTypes,
  registerUXDDepositoryIx,
} from '@tools/sdk/uxdProtocol'
import Select from '@components/inputs/Select'
import SelectOptionList from '../../SelectOptionList'
import Input from '@components/inputs/Input'

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
    .max(255, 'Minting fee in bps should be max 255')
    .required('Minting fee in bps is required'),
  redeemingFeeInBps: yup
    .number()
    .min(0, 'Redeeming fee in bps should be min 0')
    .max(255, 'Redeeming fee in bps should be max 255')
    .required('Redeeming fee in bps is required'),
  redeemableDepositorySupplyCap: yup
    .number()
    .min(0, 'Redeemable depository supply cap should be min 0')
    .required('Redeemable depository supply cap is required'),
})

const RegisterCredixDepository = ({
  index,
  governance,
}: {
  index: number
  governance: ProgramAccount<Governance> | null
}) => {
  const connection = useWalletStore((s) => s.connection)
  const wallet = useWalletStore((s) => s.current)
  const shouldBeGoverned = !!(index !== 0 && governance)
  const [formErrors, setFormErrors] = useState({})
  const { handleSetInstructions } = useContext(NewProposalContext)
  const { assetAccounts } = useGovernanceAssets()

  const [form, setForm] = useState<UXDRegisterDepositoryForm>({
    governedAccount: undefined,
    depositoryType: 'Credix',
    redeemableDepositorySupplyCap: 0,
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
      !wallet?.publicKey ||
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
    const payer = wallet.publicKey

    const ix = await registerUXDDepositoryIx(
      connection,
      uxdProgramId,
      form.depositoryType as DEPOSITORY_TYPES,
      {
        authority,
        payer,
        depositoryMintName: form.collateralName,
        mintingFeeInBps: form.mintingFeeInBps,
        redeemingFeeInBps: form.redeemingFeeInBps,
        redeemableDepositorySupplyCap: form.redeemableDepositorySupplyCap,
      }
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

      <Input
        label="Minting Fees in BPS"
        value={form.mintingFeeInBps}
        type="number"
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

      <Input
        label="Redeeming Fees in BPS"
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

      <Input
        label="Redeemable Depository Supply Cap"
        type="number"
        value={form.redeemableDepositorySupplyCap}
        min={0}
        max={10 ** 12}
        onChange={(evt) =>
          handleSetForm({
            value: evt.target.value,
            propertyName: 'redeemableDepositorySupplyCap',
          })
        }
        error={formErrors['redeemableDepositorySupplyCap']}
      />
    </>
  )
}

export default RegisterCredixDepository
