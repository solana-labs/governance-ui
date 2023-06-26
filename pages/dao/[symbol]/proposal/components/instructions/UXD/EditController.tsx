import * as yup from 'yup';
import useInstructionFormBuilder from '@hooks/useInstructionFormBuilder';
import { GovernedMultiTypeAccount } from '@utils/tokens';
import { UXDEditControllerForm } from '@utils/uiTypes/proposalCreationTypes';
import Switch from '@components/Switch';
import { useState } from 'react';
import createEditControllerInstruction from '@tools/sdk/uxdProtocol/createEditControllerInstruction';
import InputNumber from '@components/inputs/InputNumber';
import InputText from '@components/inputs/InputText';
import { PublicKey } from '@solana/web3.js';

const schema = yup.object().shape({
  governedAccount: yup
    .object()
    .nullable()
    .required('Governance account is required'),
  uiRedeemableGlobalSupplyCap: yup
    .number()
    .min(0, 'Redeemable global supply cap should be min 0'),
});

const EditControllerDepository = ({
  index,
  governedAccount,
}: {
  index: number;
  governedAccount?: GovernedMultiTypeAccount;
}) => {
  const [
    redeemableGlobalSupplyCapChange,
    setRedeemableGlobalSupplyCapChange,
  ] = useState<boolean>(false);
  const [
    depositoriesRoutingWeightBpsChange,
    setDepositoriesRoutingWeightBpsChange,
  ] = useState<boolean>(false);
  const [
    routerDepositoriesChange,
    setRouterDepositoriesChange,
  ] = useState<boolean>(false);

  const {
    form,
    formErrors,
    handleSetForm,
  } = useInstructionFormBuilder<UXDEditControllerForm>({
    index,
    initialFormValues: {
      governedAccount,
    },
    schema,
    buildInstruction: async function ({ form, governedAccountPubkey }) {
      return createEditControllerInstruction({
        uxdProgramId: form.governedAccount!.governance!.account.governedAccount,
        authority: governedAccountPubkey,

        // TODO
        // Temporary authority override for tests with mainnet test program
        //authority: new PublicKey(
        //  '8cJ5KH2ExX2rrY6DbzAqrBMDkQxYZfyedB1C4L4osc5N',
        // ),
        // ================

        redeemableGlobalSupplyCap: redeemableGlobalSupplyCapChange
          ? form.uiRedeemableGlobalSupplyCap!
          : undefined,
        
          depositoriesRoutingWeightBps: depositoriesRoutingWeightBpsChange ? {
            identityDepositoryWeightBps: form.identityDepositoryWeightBps!,
            mercurialVaultDepositoryWeightBps: form.mercurialVaultDepositoryWeightBps!,
            credixLpDepositoryWeightBps: form.credixLpDepositoryWeightBps!,
          } : undefined,
          routerDepositories: routerDepositoriesChange ? {
            identityDepository: new PublicKey(form.identityDepository!),
            mercurialVaultDepository: new PublicKey(form.mercurialVaultDepository!),
            credixLpDepository: new PublicKey(form.credixLpDepository!),
          } : undefined,
    
      });
    },
  });

  return (
    <>
      <h5>Redeemable Global Supply Cap</h5>
      <Switch
        checked={redeemableGlobalSupplyCapChange}
        onChange={(checked) => setRedeemableGlobalSupplyCapChange(checked)}
      />
      {redeemableGlobalSupplyCapChange ? (
        <InputNumber
          label="Redeemable Global Supply Cap"
          value={form.uiRedeemableGlobalSupplyCap}
          min={0}
          max={10 ** 12}
          onChange={(value) =>
            handleSetForm({
              value,
              propertyName: 'uiRedeemableGlobalSupplyCap',
            })
          }
          error={formErrors['uiRedeemableGlobalSupplyCap']}
        />
      ) : null}
      <h5>Depositories Routing Weights (Bps)</h5>
      <Switch
        checked={depositoriesRoutingWeightBpsChange}
        onChange={(checked) => setDepositoriesRoutingWeightBpsChange(checked)}
      />
      {depositoriesRoutingWeightBpsChange ? (
        <>
        <InputNumber
          label="Identity Depository Weight (Bps)"
          value={form.identityDepositoryWeightBps}
          min={0}
          max={100 * 100}
          onChange={(value) =>
            handleSetForm({
              value,
              propertyName: 'identityDepositoryWeightBps',
            })
          }
          error={formErrors['identityDepositoryWeightBps']}
        />
        <InputNumber
          label="Mercurial Vault Depository Weight (Bps)"
          value={form.mercurialVaultDepositoryWeightBps}
          min={0}
          max={100 * 100}
          onChange={(value) =>
            handleSetForm({
              value,
              propertyName: 'mercurialVaultDepositoryWeightBps',
            })
          }
          error={formErrors['mercurialVaultDepositoryWeightBps']}
        />
        <InputNumber
          label="Credix Lp Depository Weight (Bps)"
          value={form.credixLpDepositoryWeightBps}
          min={0}
          max={100 * 100}
          onChange={(value) =>
            handleSetForm({
              value,
              propertyName: 'credixLpDepositoryWeightBps',
            })
          }
          error={formErrors['credixLpDepositoryWeightBps']}
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
        <InputText
          label="Identity Depository"
          value={form.identityDepository}
          onChange={(value) =>
            handleSetForm({
              value,
              propertyName: 'identityDepository',
            })
          }
          error={formErrors['identityDepository']}
        />
        <InputText
          label="Mercurial Vault Depository"
          value={form.mercurialVaultDepository}
          onChange={(value) =>
            handleSetForm({
              value,
              propertyName: 'mercurialVaultDepository',
            })
          }
          error={formErrors['mercurialVaultDepository']}
        />
        <InputText
          label="Credix Lp Depository"
          value={form.credixLpDepository}
          onChange={(value) =>
            handleSetForm({
              value,
              propertyName: 'credixLpDepository',
            })
          }
          error={formErrors['credixLpDepository']}
        />
        </>
      ) : null}
    </>
  );
};

export default EditControllerDepository;
