import * as yup from 'yup';
import Input from '@components/inputs/Input';
import Select from '@components/inputs/Select';
import useInstructionFormBuilder from '@hooks/useInstructionFormBuilder';
import createDepositInsuranceToMangoDepositoryInstruction from '@tools/sdk/uxdProtocol/createDepositInsuranceToMangoDepositoryInstruction';
import {
  getDepositoryMintSymbols,
  getInsuranceMintSymbols,
} from '@tools/sdk/uxdProtocol/uxdClient';
import { GovernedMultiTypeAccount } from '@utils/tokens';
import { DepositInsuranceToMangoDepositoryForm } from '@utils/uiTypes/proposalCreationTypes';
import SelectOptionList from '../../SelectOptionList';

const schema = yup.object().shape({
  governedAccount: yup
    .object()
    .nullable()
    .required('Governance account is required'),
  collateralName: yup.string().required('Collateral Name address is required'),
  insuranceName: yup.string().required('Insurance Name address is required'),
  insuranceDepositedAmount: yup
    .number()
    .moreThan(0, 'Insurance Deposited amount should be more than 0')
    .required('Insurance Deposited amount is required'),
});

const UXDDepositInsuranceToMangoDepository = ({
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
  } = useInstructionFormBuilder<DepositInsuranceToMangoDepositoryForm>({
    index,
    initialFormValues: {
      governedAccount,
      insuranceDepositedAmount: 0,
    },
    schema,
    buildInstruction: async function ({ form, governedAccountPubkey }) {
      return createDepositInsuranceToMangoDepositoryInstruction(
        connection,
        form.governedAccount!.governance!.account.governedAccount,
        governedAccountPubkey,
        form.collateralName!,
        form.insuranceName!,
        form.insuranceDepositedAmount,
      );
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

      <Select
        label="Insurance Name"
        value={form.insuranceName}
        placeholder="Please select..."
        onChange={(value) =>
          handleSetForm({ value, propertyName: 'insuranceName' })
        }
        error={formErrors['insuranceName']}
      >
        <SelectOptionList list={getInsuranceMintSymbols(connection.cluster)} />
      </Select>

      <Input
        label="Insurance Deposited Amount"
        value={form.insuranceDepositedAmount}
        type="number"
        min={0}
        max={10 ** 12}
        onChange={(evt) =>
          handleSetForm({
            value: evt.target.value,
            propertyName: 'insuranceDepositedAmount',
          })
        }
        error={formErrors['insuranceDepositedAmount']}
      />
    </>
  );
};

export default UXDDepositInsuranceToMangoDepository;
