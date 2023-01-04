import * as yup from 'yup'
import {
  UiInstruction,
  UXDRegisterMercurialVaultDepositoryForm,
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
  getDepositoryMintInfo,
  getDepositoryMintSymbols,
  uxdClient,
} from '@tools/sdk/uxdProtocol/uxdClient'
import {
  Controller,
  MercurialVaultDepository,
  UXD_DECIMALS,
} from '@uxd-protocol/uxd-client'
import Select from '@components/inputs/Select'
import SelectOptionList from '../../SelectOptionList'
import Input from '@components/inputs/Input'

const schema = yup.object().shape({
  governedAccount: yup
    .object()
    .nullable()
    .required('Governance account is required'),
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
  uiRedeemableDepositorySupplyCap: yup
    .number()
    .min(0, 'Redeemable depository supply cap should be min 0')
    .required('Redeemable depository supply cap is required'),
})

const RegisterMercurialVaultDepository = ({
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

  const [form, setForm] = useState<UXDRegisterMercurialVaultDepositoryForm>({
    governedAccount: undefined,
    uiRedeemableDepositorySupplyCap: 0,
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
    const depositoryMintName = form.collateralName!
    const {
      address: collateralMint,
      decimals: collateralDecimals,
    } = getDepositoryMintInfo(connection.cluster, depositoryMintName)
    const depository = await MercurialVaultDepository.initialize({
      connection: connection.current,
      collateralMint: {
        mint: collateralMint,
        name: depositoryMintName,
        symbol: depositoryMintName,
        decimals: collateralDecimals,
      },
      uxdProgramId,
    })

    const ix = client.createRegisterMercurialVaultDepositoryInstruction(
      new Controller('UXD', UXD_DECIMALS, uxdProgramId),
      depository,
      authority,
      form.mintingFeeInBps,
      form.redeemingFeeInBps,
      form.uiRedeemableDepositorySupplyCap,
      { preflightCommitment: 'processed', commitment: 'processed' },
      payer
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
        value={form.uiRedeemableDepositorySupplyCap}
        min={0}
        max={10 ** 12}
        onChange={(evt) =>
          handleSetForm({
            value: evt.target.value,
            propertyName: 'uiRedeemableDepositorySupplyCap',
          })
        }
        error={formErrors['uiRedeemableDepositorySupplyCap']}
      />
    </>
  )
}

export default RegisterMercurialVaultDepository
