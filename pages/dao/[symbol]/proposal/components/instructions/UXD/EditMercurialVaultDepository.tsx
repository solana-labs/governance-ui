import * as yup from 'yup';
import Select from '@components/inputs/Select';
import useInstructionFormBuilder from '@hooks/useInstructionFormBuilder';
import { getDepositoryMintSymbols } from '@tools/sdk/uxdProtocol/uxdClient';
import { GovernedMultiTypeAccount } from '@utils/tokens';
import { UXDEditMercurialVaultDepositoryForm } from '@utils/uiTypes/proposalCreationTypes';
import SelectOptionList from '../../SelectOptionList';
import Switch from '@components/Switch';
import { useState } from 'react';
import createEditMercurialVaultDepositoryInstruction from '@tools/sdk/uxdProtocol/createEditMercurialVaultDepositoryInstruction';
import InputNumber from '@components/inputs/InputNumber';
import InputText from '@components/inputs/InputText';
import { PublicKey } from '@solana/web3.js';

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
  uiRedeemableAmountUnderManagementCap: yup
    .number()
    .min(0, 'Redeemable amount under management cap should be min 0'),
});

const EditMercurialVaultDepository = ({
  index,
  governedAccount,
}: {
  index: number;
  governedAccount?: GovernedMultiTypeAccount;
}) => {

  const [
    uiRedeemableAmountUnderManagementCapChange,
    setUiRedeemableAmountUnderManagementCapChange,
  ] = useState<boolean>(false);

  const [mintingFeesInBpsChange, setMintingFeesInBpsChange] = useState<boolean>(
    false,
  );

  const [
    redeemingFeesInBpsChange,
    setRedeemingFeesInBpsChange,
  ] = useState<boolean>(false);

  const [
    mintingDisabledChange,
    setMintingDisabledChange,
  ] = useState<boolean>(false);

  const [
    profitsBeneficiaryCollateralChange,
    setProfitsBeneficiaryCollateralChange,
  ] = useState<boolean>(false);

  const {
    connection,
    form,
    formErrors,
    handleSetForm,
  } = useInstructionFormBuilder<UXDEditMercurialVaultDepositoryForm>({
    index,
    initialFormValues: {
      governedAccount,
    },
    schema,
    buildInstruction: async function ({ form, governedAccountPubkey }) {
      return createEditMercurialVaultDepositoryInstruction({
        connection,
        uxdProgramId: form.governedAccount!.governance!.account.governedAccount,

        authority: governedAccountPubkey,

        // TODO
        // Temporary authority override for tests with mainnet test program
        // authority: new PublicKey(
        //  '8cJ5KH2ExX2rrY6DbzAqrBMDkQxYZfyedB1C4L4osc5N',
        // ),
        // ================

        depositoryMintName: form.collateralName!,

        redeemableAmountUnderManagementCap: uiRedeemableAmountUnderManagementCapChange
          ? form.uiRedeemableAmountUnderManagementCap!
          : undefined,
        mintingFeeInBps: mintingFeesInBpsChange
          ? form.mintingFeeInBps!
          : undefined,
        redeemingFeeInBps: redeemingFeesInBpsChange
          ? form.redeemingFeeInBps!
          : undefined,
        mintingDisabled: mintingDisabledChange
          ? form.mintingDisabled!
          : undefined,
        profitsBeneficiaryCollateral: profitsBeneficiaryCollateralChange
          ? new PublicKey(form.profitsBeneficiaryCollateral!)
          : undefined,
      });
    },
  });

  return (
    <>
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

      <h5>Redeemable Depository Supply Cap</h5>

      <Switch
        checked={uiRedeemableAmountUnderManagementCapChange}
        onChange={(checked) =>
          setUiRedeemableAmountUnderManagementCapChange(checked)
        }
      />

      {uiRedeemableAmountUnderManagementCapChange ? (
        <InputNumber
          value={form.uiRedeemableAmountUnderManagementCap}
          min={0}
          max={10 ** 12}
          onChange={(value) =>
            handleSetForm({
              value,
              propertyName: 'uiRedeemableAmountUnderManagementCap',
            })
          }
          error={formErrors['uiRedeemableAmountUnderManagementCap']}
        />
      ) : null}

      <h5>Minting Fees in BPS</h5>

      <Switch
        checked={mintingFeesInBpsChange}
        onChange={(checked) => setMintingFeesInBpsChange(checked)}
      />

      {mintingFeesInBpsChange ? (
        <InputNumber
          value={form.mintingFeeInBps}
          min={0}
          max={255}
          onChange={(value) =>
            handleSetForm({
              value,
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
        <InputNumber
          value={form.redeemingFeeInBps}
          min={0}
          max={255}
          onChange={(value) =>
            handleSetForm({
              value,
              propertyName: 'redeemingFeeInBps',
            })
          }
          error={formErrors['redeemingFeeInBps']}
        />
      ) : null}


      <h5>Minting Disabled</h5>

      <Switch
        checked={mintingDisabledChange}
        onChange={(checked) =>
          setMintingDisabledChange(checked)
        }
      />

      {mintingDisabledChange ? (
        <Switch
          checked={form.mintingDisabled ?? false}
          onChange={(value) =>
            handleSetForm({
              value,
              propertyName: 'mintingDisabled',
            })
          }
        />
      ) : null}

      <h5>Profits Beneficiary Collateral</h5>

      <Switch
        checked={profitsBeneficiaryCollateralChange}
        onChange={(checked) =>
          setProfitsBeneficiaryCollateralChange(checked)
        }
      />

      {profitsBeneficiaryCollateralChange ? (
        <InputText
          value={form.profitsBeneficiaryCollateral}
          onChange={(value) =>
            handleSetForm({
              value,
              propertyName: 'profitsBeneficiaryCollateral',
            })
          }
          error={formErrors['profitsBeneficiaryCollateral']}
        />
      ) : null}

    </>
  );
};

export default EditMercurialVaultDepository;
