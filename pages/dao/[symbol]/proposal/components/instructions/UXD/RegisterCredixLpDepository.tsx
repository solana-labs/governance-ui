import * as yup from 'yup';
import Select from '@components/inputs/Select';
import useInstructionFormBuilder from '@hooks/useInstructionFormBuilder';
import { getDepositoryMintSymbols } from '@tools/sdk/uxdProtocol/uxdClient';
import { GovernedMultiTypeAccount } from '@utils/tokens';
import { UXDRegisterCredixLpDepositoryForm } from '@utils/uiTypes/proposalCreationTypes';
import SelectOptionList from '../../SelectOptionList';
import Input from '@components/inputs/Input';
import createRegisterCredixLpDepositoryInstruction from '@tools/sdk/uxdProtocol/createRegisterCredixLpDepositoryInstruction';

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
});

const RegisterCredixLpDepository = ({
  index,
  governedAccount,
}: {
  index: number;
  governedAccount?: GovernedMultiTypeAccount;
}) => {
  const {
    connection,
    form,
    formErrors,
    handleSetForm,
  } = useInstructionFormBuilder<UXDRegisterCredixLpDepositoryForm>({
    index,
    initialFormValues: {
      governedAccount,
    },
    schema,
    buildInstruction: async function ({ form, wallet, governedAccountPubkey }) {
      return createRegisterCredixLpDepositoryInstruction({
        connection,
        uxdProgramId: form.governedAccount!.governance!.account.governedAccount,
        authority: governedAccountPubkey,

        // TODO
        // Temporary authority override for tests with mainnet test program
        // authority: new PublicKey(
        //  '8cJ5KH2ExX2rrY6DbzAqrBMDkQxYZfyedB1C4L4osc5N',
        // ),
        // ================

        payer: wallet.publicKey!,
        depositoryMintName: form.collateralName!,
        mintingFeeInBps: form.mintingFeeInBps!,
        redeemingFeeInBps: form.redeemingFeeInBps!,
        redeemableDepositorySupplyCap: form.uiRedeemableDepositorySupplyCap!,
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
        value={form.redeemingFeeInBps}
        type="number"
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
        value={form.uiRedeemableDepositorySupplyCap}
        type="number"
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
  );
};

export default RegisterCredixLpDepository;
