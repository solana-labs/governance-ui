import * as yup from 'yup';
// The ComputeBudgetProgram.requestUnits function
// is available starting at @solana/web3.js v1.41.0 and it's not possible for now
// to update the main solana/web3.js package as it requires to update also governance related package
// @ts-ignore
import { ComputeBudgetProgram } from '@solana/web3.js-1.41.0';
import useInstructionFormBuilder from '@hooks/useInstructionFormBuilder';
import { GovernedMultiTypeAccount } from '@utils/tokens';
import { NativeIncreaseComputingBudgetForm } from '@utils/uiTypes/proposalCreationTypes';
import Input from '@components/inputs/Input';

const IncreaseComputingBudget = ({
  index,
  governedAccount,
}: {
  index: number;
  governedAccount?: GovernedMultiTypeAccount;
}) => {
  const {
    form,
    handleSetForm,
    formErrors,
  } = useInstructionFormBuilder<NativeIncreaseComputingBudgetForm>({
    index,
    initialFormValues: {
      governedAccount,
    },
    schema: yup.object().shape({
      governedAccount: yup
        .object()
        .nullable()
        .required('Governed account is required'),
      computingBudget: yup
        .number()
        .moreThan(0, 'Computing budget should be more than 0')
        .required('Computing budget is required'),
    }),

    buildInstruction: async function ({ form }) {
      return ComputeBudgetProgram.requestUnits({
        units: form.computingBudget!,
        additionalFee: 0,
      });
    },
  });

  return (
    <Input
      label="Computing Budget"
      value={form.computingBudget}
      type="number"
      min="0"
      onChange={(evt) =>
        handleSetForm({
          value: evt.target.value,
          propertyName: 'computingBudget',
        })
      }
      error={formErrors['computingBudget']}
    />
  );
};

export default IncreaseComputingBudget;
