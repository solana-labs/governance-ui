import * as yup from 'yup';
import Select from '@components/inputs/Select';
import useInstructionFormBuilder from '@hooks/useInstructionFormBuilder';
import { getDepositoryMintSymbols } from '@tools/sdk/uxdProtocol/uxdClient';
import { GovernedMultiTypeAccount } from '@utils/tokens';
import { UXDRedeemFromCredixLpDepositoryForm } from '@utils/uiTypes/proposalCreationTypes';
import SelectOptionList from '../../SelectOptionList';
import Input from '@components/inputs/Input';
import { PublicKey } from '@solana/web3.js';
import createRedeemFromCredixLpDepositoryInstruction from '@tools/sdk/uxdProtocol/createRedeemFromCredixLpDepositoryInstruction';
import InputNumber from '@components/inputs/InputNumber';

const schema = yup.object().shape({
  governedAccount: yup
    .object()
    .nullable()
    .required('Governance account is required'),
  uxdProgram: yup.string().required('UXD Program address is required'),
  collateralName: yup.string().required('Collateral Name address is required'),
  uiRedeemableAmount: yup
    .number()
    .moreThan(0, 'Redeemable amount should be more than 0')
    .required('Redeemable Amount is required'),
});

const UXDRedeemFromCredixLpDepository = ({
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
  } = useInstructionFormBuilder<UXDRedeemFromCredixLpDepositoryForm>({
    index,
    initialFormValues: {
      governedAccount,
    },
    schema,
    shouldSplitIntoSeparateTxs: true,
    buildInstruction: async function ({ form, governedAccountPubkey, wallet }) {
      return createRedeemFromCredixLpDepositoryInstruction({
        connection,
        uxdProgramId: new PublicKey(form.uxdProgram!),
        authority: governedAccountPubkey,
        depositoryMintName: form.collateralName!,
        redeemableAmount: form.uiRedeemableAmount!,
        payer: wallet.publicKey!,
      });
    },
  });

  return (
    <>
      <Input
        label="UXD Program"
        value={form.uxdProgram}
        type="string"
        onChange={(evt) =>
          handleSetForm({
            value: evt.target.value,
            propertyName: 'uxdProgram',
          })
        }
        error={formErrors['uxdProgram']}
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

      <InputNumber
        label="Redeemable Amount"
        value={form.uiRedeemableAmount}
        min={0}
        max={10 ** 12}
        onChange={(value) =>
          handleSetForm({
            value,
            propertyName: 'uiRedeemableAmount',
          })
        }
        error={formErrors['uiRedeemableAmount']}
      />
    </>
  );
};

export default UXDRedeemFromCredixLpDepository;
