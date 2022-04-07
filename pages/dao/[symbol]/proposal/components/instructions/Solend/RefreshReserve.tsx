import * as yup from 'yup';
import Select from '@components/inputs/Select';
import useInstructionFormBuilder from '@hooks/useInstructionFormBuilder';
import { refreshReserve } from '@tools/sdk/solend/refreshReserve';
import { SOLEND_MINT_NAME_OPTIONS } from '@tools/sdk/solend/utils';
import { GovernedMultiTypeAccount } from '@utils/tokens';
import { RefreshReserveForm } from '@utils/uiTypes/proposalCreationTypes';
import SelectOptionList from '../../SelectOptionList';

const schema = yup.object().shape({
  governedAccount: yup
    .object()
    .nullable()
    .required('Governed account is required'),
  mintName: yup.string().required('Token Name is required'),
});

const RefreshReserve = ({
  index,
  governedAccount,
}: {
  index: number;
  governedAccount?: GovernedMultiTypeAccount;
}) => {
  const {
    form,
    connection,
    formErrors,
    handleSetForm,
  } = useInstructionFormBuilder<RefreshReserveForm>({
    index,
    initialFormValues: {
      governedAccount,
    },
    schema,
    buildInstruction: async function ({ form }) {
      return refreshReserve({
        mintName: form.mintName!,
      });
    },
  });

  // Hardcoded gate used to be clear about what cluster is supported for now
  if (connection.cluster !== 'mainnet') {
    return <>This instruction does not support {connection.cluster}</>;
  }

  return (
    <Select
      label="Token Name to refresh reserve for"
      value={form.mintName}
      placeholder="Please select..."
      onChange={(value) => handleSetForm({ value, propertyName: 'mintName' })}
      error={formErrors['baseTokenName']}
    >
      <SelectOptionList list={SOLEND_MINT_NAME_OPTIONS} />
    </Select>
  );
};

export default RefreshReserve;
