import * as yup from 'yup';
import Select from '@components/inputs/Select';
import useInstructionFormBuilder from '@hooks/useInstructionFormBuilder';
import SolendConfiguration from '@tools/sdk/solend/configuration';
import { createObligationAccount } from '@tools/sdk/solend/createObligationAccount';
import { GovernedMultiTypeAccount } from '@utils/tokens';
import { CreateSolendObligationAccountForm } from '@utils/uiTypes/proposalCreationTypes';
import SelectOptionList from '../../SelectOptionList';

const schema = yup.object().shape({
  governedAccount: yup
    .object()
    .nullable()
    .required('Governed account is required'),
  lendingMarketName: yup.string().required('Lending market is required'),
});

const CreateObligationAccount = ({
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
  } = useInstructionFormBuilder<CreateSolendObligationAccountForm>({
    index,
    initialFormValues: {
      governedAccount,
    },
    schema,
    buildInstruction: async function ({ wallet, governedAccountPubkey, form }) {
      return createObligationAccount({
        payer: wallet.publicKey!,
        authority: governedAccountPubkey,
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

export default CreateObligationAccount;
