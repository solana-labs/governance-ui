import * as yup from 'yup'

import Switch from '@components/Switch'
import { useContext, useEffect, useState } from 'react'
import useGovernanceAssets from '@hooks/useGovernanceAssets'
import {
  Governance,
  ProgramAccount,
  serializeInstructionToBase64,
} from '@solana/spl-governance'
import useWalletStore from 'stores/useWalletStore'
import { NewProposalContext } from '../../../new'
import Input from '@components/inputs/Input'
import {
  UiInstruction,
  UXDEditMercurialVaultDepositoryForm,
} from '@utils/uiTypes/proposalCreationTypes'
import { isFormValid } from '@utils/formValidation'
import {
  Controller,
  MercurialVaultDepository,
  UXD_DECIMALS,
} from '@uxd-protocol/uxd-client'
import {
  getDepositoryMintInfo,
  getDepositoryMintSymbols,
  uxdClient,
} from '@tools/sdk/uxdProtocol/uxdClient'
import GovernedAccountSelect from '../../GovernedAccountSelect'
import SelectOptionList from '../../SelectOptionList'
import Select from '@components/inputs/Select'

const schema = yup.object().shape({
  governedAccount: yup
    .object()
    .nullable()
    .required('Governance account is required'),
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

const EditMercurialVaultDepository = ({
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

  const connection = useWalletStore((s) => s.connection)
  const shouldBeGoverned = !!(index !== 0 && governance)
  const [formErrors, setFormErrors] = useState({})
  const { handleSetInstructions } = useContext(NewProposalContext)
  const { assetAccounts } = useGovernanceAssets()

  const [form, setForm] = useState<UXDEditMercurialVaultDepositoryForm>({
    governedAccount: undefined,
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
    const client = uxdClient(uxdProgramId)
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

    const ix = client.createEditMercurialVaultDepositoryInstruction(
      new Controller('UXD', UXD_DECIMALS, uxdProgramId),
      depository,
      authority,
      {
        redeemableAmountUnderManagementCap,
        mintingFeeInBps,
        redeemingFeeInBps,
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

export default EditMercurialVaultDepository
