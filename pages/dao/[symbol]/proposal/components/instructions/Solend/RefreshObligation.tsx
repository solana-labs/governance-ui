import * as yup from 'yup';
import Select from '@components/inputs/Select';
import useInstructionFormBuilder from '@hooks/useInstructionFormBuilder';
import SolendConfiguration from '@tools/sdk/solend/configuration';
import { refreshObligation } from '@tools/sdk/solend/refreshObligation';
import { GovernedMultiTypeAccount } from '@utils/tokens';
import { RefreshObligationForm } from '@utils/uiTypes/proposalCreationTypes';
import SelectOptionList from '../../SelectOptionList';

const schema = yup.object().shape({
  governedAccount: yup
    .object()
    .nullable()
    .required('Governed account is required'),
  lendingMarketName: yup.string().required('Lending market is required'),
});

const RefreshObligation = ({
  index,
  governedAccount,
}: {
  index: number;
  governedAccount?: GovernedMultiTypeAccount;
}) => {
  const {
    form,
    formErrors,
    connection,
    handleSetForm,
  } = useInstructionFormBuilder<RefreshObligationForm>({
    index,
    initialFormValues: {
      governedAccount,
    },
    schema,
    buildInstruction: async function ({ form, governedAccountPubkey }) {
      return refreshObligation({
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

export default RefreshObligation;
