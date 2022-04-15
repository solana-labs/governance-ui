import * as yup from 'yup';
import Input from '@components/inputs/Input';
import Select from '@components/inputs/Select';
import useInstructionFormBuilder from '@hooks/useInstructionFormBuilder';
import createWithdrawInsuranceFromMangoDepositoryInstruction from '@tools/sdk/uxdProtocol/createWithdrawInsuranceFromMangoDepositoryInstruction';
import {
  getDepositoryMintSymbols,
  getInsuranceMintSymbols,
} from '@tools/sdk/uxdProtocol/uxdClient';
import { GovernedMultiTypeAccount } from '@utils/tokens';
import { WithdrawInsuranceFromMangoDepositoryForm } from '@utils/uiTypes/proposalCreationTypes';
import SelectOptionList from '../../SelectOptionList';

const schema = yup.object().shape({
  governedAccount: yup
    .object()
    .nullable()
    .required('Program governed account is required'),
  collateralName: yup.string().required('Collateral Name is required'),
  insuranceName: yup.string().required('Insurance Name is required'),
  insuranceWithdrawnAmount: yup
    .number()
    .moreThan(0, 'Insurance Withdrawn amount should be more than 0')
    .required('Insurance Withdrawn amount is required'),
});

const WithdrawInsuranceFromMangoDepository = ({
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
  } = useInstructionFormBuilder<WithdrawInsuranceFromMangoDepositoryForm>({
    index,
    initialFormValues: {
      governedAccount,
      insuranceWithdrawnAmount: 0,
    },
    schema,
    buildInstruction: async function ({ form, governedAccountPubkey }) {
      return createWithdrawInsuranceFromMangoDepositoryInstruction(
        connection,
        form.governedAccount!.governance!.account.governedAccount,
        governedAccountPubkey,
        form.collateralName!,
        form.insuranceName!,
        form.insuranceWithdrawnAmount,
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
        label="Insurance Withdrawn Amount"
        value={form.insuranceWithdrawnAmount}
        type="number"
        min={0}
        onChange={(evt) =>
          handleSetForm({
            value: evt.target.value,
            propertyName: 'insuranceWithdrawnAmount',
          })
        }
        error={formErrors['insuranceWithdrawnAmount']}
      />
    </>
  );
};

export default WithdrawInsuranceFromMangoDepository;
