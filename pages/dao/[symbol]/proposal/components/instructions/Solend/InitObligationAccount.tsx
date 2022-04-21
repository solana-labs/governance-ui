import * as yup from 'yup';
import Select from '@components/inputs/Select';
import useInstructionFormBuilder from '@hooks/useInstructionFormBuilder';
import { initObligationAccount } from '@tools/sdk/solend/initObligationAccount';
import SolendConfiguration from '@tools/sdk/solend/configuration';
import { GovernedMultiTypeAccount } from '@utils/tokens';
import { InitSolendObligationAccountForm } from '@utils/uiTypes/proposalCreationTypes';
import SelectOptionList from '../../SelectOptionList';

const schema = yup.object().shape({
  governedAccount: yup
    .object()
    .nullable()
    .required('Governed account is required'),
  lendingMarketName: yup.string().required('Lending market is required'),
});

const InitObligationAccount = ({
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
  } = useInstructionFormBuilder<InitSolendObligationAccountForm>({
    index,
    initialFormValues: {
      governedAccount,
    },
    schema,
    buildInstruction: async function ({ governedAccountPubkey, form }) {
      return initObligationAccount({
        obligationOwner: governedAccountPubkey,
        lendingMarketName: form.lendingMarketName!,
      });
    },
  });

  // Hardcoded gate used to be clear about what cluster is supported for now
  if (connection.cluster !== 'mainnet') {
    return <>This instruction does not support {connection.cluster}</>;
  }

  return (
    <Select
      label="Lending Market"
      value={form.lendingMarketName}
      placeholder="Please select..."
      onChange={(value) =>
        handleSetForm({ value, propertyName: 'lendingMarketName' })
      }
      error={formErrors['lendingMarketName']}
    >
      <SelectOptionList
        list={SolendConfiguration.getSupportedLendingMarketNames()}
      />
    </Select>
  );
};

export default InitObligationAccount;
