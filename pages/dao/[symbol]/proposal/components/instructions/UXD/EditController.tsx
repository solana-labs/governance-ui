import * as yup from 'yup';
import Select from '@components/inputs/Select';
import useInstructionFormBuilder from '@hooks/useInstructionFormBuilder';
import { getDepositoryMintSymbols } from '@tools/sdk/uxdProtocol/uxdClient';
import { GovernedMultiTypeAccount } from '@utils/tokens';
import { UXDEditControllerForm } from '@utils/uiTypes/proposalCreationTypes';
import SelectOptionList from '../../SelectOptionList';
import Input from '@components/inputs/Input';
import Switch from '@components/Switch';
import { useState } from 'react';
import createEditControllerInstruction from '@tools/sdk/uxdProtocol/createEditControllerInstruction';

const schema = yup.object().shape({
  governedAccount: yup
    .object()
    .nullable()
    .required('Governance account is required'),
  collateralName: yup.string(),
  insuranceName: yup.string(),
  uiQuoteMintAndRedeemSoftCap: yup
    .number()
    .min(0, 'Quote mint and redeem soft cap should be min 0'),
  uiRedeemableSoftCap: yup
    .number()
    .min(0, 'Redeemable soft cap should be min 0'),
  uiRedeemableGlobalSupplyCap: yup
    .number()
    .min(0, 'Redeemable global supply cap should be min 0'),
});

const RegisterMercurialVaultDepository = ({
  index,
  governedAccount,
}: {
  index: number;
  governedAccount?: GovernedMultiTypeAccount;
}) => {
  const [
    quoteMintAndRedeemSoftCapChange,
    setQuoteMintAndRedeemSoftCapChange,
  ] = useState<boolean>(false);

  const [
    redeemableSoftCapChange,
    setRedeemableSoftCapChange,
  ] = useState<boolean>(false);

  const [
    redeemableGlobalSupplyCapChange,
    setRedeemableGlobalSupplyCapChange,
  ] = useState<boolean>(false);

  const {
    connection,
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
        connection,
        uxdProgramId: form.governedAccount!.governance!.account.governedAccount,
        authority: governedAccountPubkey,

        // TODO
        // Temporary authority override for tests with mainnet test program
        //authority: new PublicKey(
        //  '8cJ5KH2ExX2rrY6DbzAqrBMDkQxYZfyedB1C4L4osc5N',
        // ),
        // ================

        ...(quoteMintAndRedeemSoftCapChange
          ? {
              depositoryMintName: form.collateralName!,
              insuranceMintName: form.insuranceName!,
              quoteMintAndRedeemSoftCap: form.uiQuoteMintAndRedeemSoftCap!,
            }
          : (null as any)),

        redeemableSoftCap: redeemableSoftCapChange
          ? form.uiRedeemableSoftCap!
          : undefined,

        redeemableGlobalSupplyCap: redeemableGlobalSupplyCapChange
          ? form.uiRedeemableGlobalSupplyCap!
          : undefined,
      });
    },
  });

  return (
    <>
      <Select
        label="Collateral name of an existing mango depository"
        value={form.collateralName}
        placeholder="Please select..."
        onChange={(value) =>
          handleSetForm({ value, propertyName: 'collateralName' })
        }
        error={formErrors['collateralName']}
      >
        <SelectOptionList list={getDepositoryMintSymbols(connection.cluster)} />
      </Select>
      <h5>Quote Mint and Redeem Soft Cap</h5>
      <Switch
        checked={quoteMintAndRedeemSoftCapChange}
        onChange={(checked) => setQuoteMintAndRedeemSoftCapChange(checked)}
      />
      {quoteMintAndRedeemSoftCapChange ? (
        <Input
          value={form.uiQuoteMintAndRedeemSoftCap}
          type="number"
          min={0}
          max={10 ** 12}
          onChange={(evt) =>
            handleSetForm({
              value: evt.target.value,
              propertyName: 'uiQuoteMintAndRedeemSoftCap',
            })
          }
          error={formErrors['uiQuoteMintAndRedeemSoftCap']}
        />
      ) : null}
      <h5>Redeemable Soft Cap Change</h5>
      <Switch
        checked={redeemableSoftCapChange}
        onChange={(checked) => setRedeemableSoftCapChange(checked)}
      />
      {redeemableSoftCapChange ? (
        <Input
          value={form.uiRedeemableSoftCap}
          type="number"
          min={0}
          max={10 ** 12}
          onChange={(evt) =>
            handleSetForm({
              value: evt.target.value,
              propertyName: 'uiRedeemableSoftCap',
            })
          }
          error={formErrors['uiRedeemableSoftCap']}
        />
      ) : null}
      <h5>Redeemable Global Supply Cap</h5>
      <Switch
        checked={redeemableGlobalSupplyCapChange}
        onChange={(checked) => setRedeemableGlobalSupplyCapChange(checked)}
      />
      {redeemableGlobalSupplyCapChange ? (
        <Input
          label="Redeemable Global Supply Cap"
          value={form.uiRedeemableGlobalSupplyCap}
          type="number"
          min={0}
          max={10 ** 12}
          onChange={(evt) =>
            handleSetForm({
              value: evt.target.value,
              propertyName: 'uiRedeemableGlobalSupplyCap',
            })
          }
          error={formErrors['uiRedeemableGlobalSupplyCap']}
        />
      ) : null}
    </>
  );
};

export default RegisterMercurialVaultDepository;
