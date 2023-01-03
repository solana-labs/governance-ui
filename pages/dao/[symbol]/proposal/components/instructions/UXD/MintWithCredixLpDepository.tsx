import * as yup from 'yup';
import Select from '@components/inputs/Select';
import useInstructionFormBuilder from '@hooks/useInstructionFormBuilder';
import { getDepositoryMintSymbols } from '@tools/sdk/uxdProtocol/uxdClient';
import { GovernedMultiTypeAccount } from '@utils/tokens';
import { UXDMintWithCredixLpDepositoryForm } from '@utils/uiTypes/proposalCreationTypes';
import SelectOptionList from '../../SelectOptionList';
import Input from '@components/inputs/Input';
import { PublicKey } from '@solana/web3.js';
import createMintWithCredixLpDepositoryInstruction from '@tools/sdk/uxdProtocol/createMintWithCredixLpDepositoryInstruction';
import InputNumber from '@components/inputs/InputNumber';

const schema = yup.object().shape({
  governedAccount: yup
    .object()
    .nullable()
    .required('Governance account is required'),
  uxdProgram: yup.string().required('UXD Program address is required'),
  collateralName: yup.string().required('Collateral Name address is required'),
  uiCollateralAmount: yup
    .number()
    .moreThan(0, 'Collateral amount should be more than 0')
    .required('Collateral Amount is required'),
});

const UXDMintWithCredixLpDepository = ({
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
  } = useInstructionFormBuilder<UXDMintWithCredixLpDepositoryForm>({
    index,
    initialFormValues: {
      governedAccount,
    },
    schema,
    shouldSplitIntoSeparateTxs: true,
    buildInstruction: async function ({ form, governedAccountPubkey, wallet }) {
      return createMintWithCredixLpDepositoryInstruction({
        connection,
        uxdProgramId: new PublicKey(form.uxdProgram!),
        authority: governedAccountPubkey,
        depositoryMintName: form.collateralName!,
        collateralAmount: form.uiCollateralAmount!,
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
        label="Collateral Amount"
        value={form.uiCollateralAmount}
        min={0}
        max={10 ** 12}
        onChange={(value) =>
          handleSetForm({
            value,
            propertyName: 'uiCollateralAmount',
          })
        }
        error={formErrors['uiCollateralAmount']}
      />
    </>
  );
};

export default UXDMintWithCredixLpDepository;
