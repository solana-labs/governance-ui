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
import { PublicKey } from '@solana/web3.js'

const schema = yup.object().shape({
  governedAccount: yup
    .object()
    .nullable()
    .required('Governance account is required'),
  redeemableGlobalSupplyCap: yup
    .number()
    .min(0, 'Redeemable global supply cap should be min 0'),
  depositoriesRoutingWeightBps: yup.object().shape({
    identityDepositoryWeightBps: yup
      .number()
      .required('identity depository weight is required'),
    mercurialVaultDepositoryWeightBps: yup
      .number()
      .required('mercurial depository weight is required'),
    credixLpDepositoryWeightBps: yup
      .number()
      .required('credix depository weight is required'),
  }),
  routerDepositories: yup.object().shape({
    identityDepository: yup
      .string()
      .required('identity depository address is required'),
    mercurialVaultDepository: yup
      .string()
      .required('mercurial depository address is required'),
    credixLpDepository: yup
      .string()
      .required('credix depository address is required'),
  }),
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

  const [
    depositoriesRoutingWeightBpsChange,
    setDepositoriesRoutingWeightBpsChange,
  ] = useState<boolean>(false)
  const [
    routerDepositoriesChange,
    setRouterDepositoriesChange,
  ] = useState<boolean>(false)

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
    const depositoriesRoutingWeightBps =
      depositoriesRoutingWeightBpsChange &&
      form.depositoriesRoutingWeightBps?.credixLpDepositoryWeightBps &&
      form.depositoriesRoutingWeightBps.identityDepositoryWeightBps &&
      form.depositoriesRoutingWeightBps.mercurialVaultDepositoryWeightBps
        ? form.depositoriesRoutingWeightBps
        : undefined

    const routerDepositories =
      routerDepositoriesChange &&
      form.routerDepositories?.credixLpDepository &&
      form.routerDepositories.identityDepository &&
      form.routerDepositories.mercurialVaultDepository
        ? {
            credixLpDepository: new PublicKey(
              form.routerDepositories.credixLpDepository
            ),
            identityDepository: new PublicKey(
              form.routerDepositories.identityDepository
            ),
            mercurialVaultDepository: new PublicKey(
              form.routerDepositories.mercurialVaultDepository
            ),
          }
        : undefined
    const ix = client.createEditControllerInstruction(
      new Controller('UXD', UXD_DECIMALS, uxdProgramId),
      authority,
      {
        redeemableGlobalSupplyCap: form.redeemableGlobalSupplyCap,
        depositoriesRoutingWeightBps,
        routerDepositories,
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

      <h5>Depositories Routing Weight in Bps</h5>

      <Switch
        checked={depositoriesRoutingWeightBpsChange}
        onChange={(checked) => setDepositoriesRoutingWeightBpsChange(checked)}
      />
      {depositoriesRoutingWeightBpsChange ? (
        <>
          <Input
            label="Identity Depository Routing Weight in Bps"
            value={
              form.depositoriesRoutingWeightBps?.identityDepositoryWeightBps
            }
            type="number"
            min={0}
            max={10 ** 12}
            onChange={(evt) =>
              handleSetForm({
                value: {
                  ...form.depositoriesRoutingWeightBps,
                  identityDepositoryWeightBps: evt.target.value,
                },
                propertyName: 'depositoriesRoutingWeightBps',
              })
            }
            error={formErrors['depositoriesRoutingWeightBps']}
          />
          <Input
            label="Mercurial Vault Depository Routing Weight in Bps"
            value={
              form.depositoriesRoutingWeightBps
                ?.mercurialVaultDepositoryWeightBps
            }
            type="number"
            min={0}
            max={10 ** 12}
            onChange={(evt) =>
              handleSetForm({
                value: {
                  ...form.depositoriesRoutingWeightBps,
                  mercurialVaultDepositoryWeightBps: evt.target.value,
                },
                propertyName: 'depositoriesRoutingWeightBps',
              })
            }
            error={formErrors['depositoriesRoutingWeightBps']}
          />
          <Input
            label="Credix LP Depository Routing Weight in Bps"
            value={
              form.depositoriesRoutingWeightBps?.credixLpDepositoryWeightBps
            }
            type="number"
            min={0}
            max={10 ** 12}
            onChange={(evt) =>
              handleSetForm({
                value: {
                  ...form.depositoriesRoutingWeightBps,
                  credixLpDepositoryWeightBps: evt.target.value,
                },
                propertyName: 'depositoriesRoutingWeightBps',
              })
            }
            error={formErrors['depositoriesRoutingWeightBps']}
          />
        </>
      ) : null}

      <h5>Router Depositories</h5>

      <Switch
        checked={routerDepositoriesChange}
        onChange={(checked) => setRouterDepositoriesChange(checked)}
      />
      {routerDepositoriesChange ? (
        <>
          <Input
            label="Identity Depository"
            value={form.routerDepositories?.identityDepository}
            type="string"
            onChange={(evt) =>
              handleSetForm({
                value: {
                  ...form.routerDepositories,
                  identityDepository: evt.target.value,
                },
                propertyName: 'routerDepositories',
              })
            }
            error={formErrors['routerDepositories']}
          />
          <Input
            label="Mercurial Vault Depository"
            value={form.routerDepositories?.mercurialVaultDepository}
            type="string"
            onChange={(evt) =>
              handleSetForm({
                value: {
                  ...form.routerDepositories,
                  mercurialVaultDepository: evt.target.value,
                },
                propertyName: 'routerDepositories',
              })
            }
            error={formErrors['routerDepositories']}
          />
          <Input
            label="Credix LP Depository"
            value={form.routerDepositories?.credixLpDepository}
            type="string"
            onChange={(evt) =>
              handleSetForm({
                value: {
                  ...form.routerDepositories,
                  credixLpDepository: evt.target.value,
                },
                propertyName: 'routerDepositories',
              })
            }
            error={formErrors['routerDepositories']}
          />
        </>
      ) : null}
    </>
  )
}

export default EditController
