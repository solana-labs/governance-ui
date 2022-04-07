import * as yup from 'yup';
import Select from '@components/inputs/Select';
import useInstructionFormBuilder from '@hooks/useInstructionFormBuilder';
import { refreshObligation } from '@tools/sdk/solend/refreshObligation';
import { SOLEND_MINT_NAME_OPTIONS } from '@tools/sdk/solend/utils';
import { GovernedMultiTypeAccount } from '@utils/tokens';
import { RefreshObligationForm } from '@utils/uiTypes/proposalCreationTypes';
import SelectOptionList from '../../SelectOptionList';

const schema = yup.object().shape({
  governedAccount: yup
    .object()
    .nullable()
    .required('Governed account is required'),
  mintName: yup.string().required('Token Name is required'),
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
        mintNames: [form.mintName!],
      });
    },
  });

  // Hardcoded gate used to be clear about what cluster is supported for now
  if (connection.cluster !== 'mainnet') {
    return <>This instruction does not support {connection.cluster}</>;
  }

  return (
    <Select
      label="Token Name to refresh obligation for"
      value={form.mintName}
      placeholder="Please select..."
      onChange={(value) => handleSetForm({ value, propertyName: 'mintName' })}
      error={formErrors['baseTokenName']}
    >
      <SelectOptionList list={SOLEND_MINT_NAME_OPTIONS} />
    </Select>
  );
};

export default RefreshObligation;
