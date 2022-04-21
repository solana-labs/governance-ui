import * as yup from 'yup';
import Select from '@components/inputs/Select';
import useInstructionFormBuilder from '@hooks/useInstructionFormBuilder';
import SolendConfiguration from '@tools/sdk/solend/configuration';
import { refreshReserve } from '@tools/sdk/solend/refreshReserve';
import { GovernedMultiTypeAccount } from '@utils/tokens';
import { RefreshReserveForm } from '@utils/uiTypes/proposalCreationTypes';
import SelectOptionList from '../../SelectOptionList';

const schema = yup.object().shape({
  governedAccount: yup
    .object()
    .nullable()
    .required('Governed account is required'),
  lendingMarketName: yup.string().required('Lending Market Name is required'),
  tokenName: yup.string().required('Token name is required'),
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
        lendingMarketName: form.lendingMarketName!,
        tokenName: form.tokenName!,
      });
    },
  });

  // Hardcoded gate used to be clear about what cluster is supported for now
  if (connection.cluster !== 'mainnet') {
    return <>This instruction does not support {connection.cluster}</>;
  }

  return (
    <>
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
      {form.lendingMarketName && (
        <Select
          label="Token Name"
          value={form.tokenName}
          placeholder="Please select..."
          onChange={(value) =>
            handleSetForm({ value, propertyName: 'tokenName' })
          }
          error={formErrors['tokenName']}
        >
          <SelectOptionList
            list={Object.keys(
              SolendConfiguration.getSupportedLendingMarketInformation(
                form.lendingMarketName,
              ).supportedTokens,
            )}
          />
        </Select>
      )}
    </>
  );
};

export default RefreshReserve;
