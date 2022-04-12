import * as yup from 'yup';
import useInstructionFormBuilder from '@hooks/useInstructionFormBuilder';
import { getTribecaPrograms } from '@tools/sdk/tribeca/configurations';
import { resetEpochGaugeVoterInstruction } from '@tools/sdk/tribeca/instructions/resetEpochGaugeVoterInstruction';
import { GovernedMultiTypeAccount } from '@utils/tokens';
import { TribecaResetEpochGaugeVoterForm } from '@utils/uiTypes/proposalCreationTypes';
import useWalletStore from 'stores/useWalletStore';
import GovernorSelect from './GovernorSelect';

const schema = yup.object().shape({
  governedAccount: yup
    .object()
    .nullable()
    .required('Governed account is required'),
  tribecaConfiguration: yup
    .object()
    .nullable()
    .required('Tribeca Configuration Governor is required'),
});

const ResetEpochGaugeVoter = ({
  index,
  governedAccount,
}: {
  index: number;
  governedAccount?: GovernedMultiTypeAccount;
}) => {
  const {
    form,
    handleSetForm,
  } = useInstructionFormBuilder<TribecaResetEpochGaugeVoterForm>({
    index,
    initialFormValues: {
      governedAccount,
      tribecaConfiguration: null,
    },
    schema,
    buildInstruction: async function ({
      connection,
      wallet,
      form,
      governedAccountPubkey,
    }) {
      const programs = getTribecaPrograms({
        connection,
        wallet,
        config: form.tribecaConfiguration!,
      });
      return resetEpochGaugeVoterInstruction({
        programs,
        authority: governedAccountPubkey,
        tribecaConfiguration: form.tribecaConfiguration!,
      });
    },
  });
  const connection = useWalletStore((s) => s.connection);

  // Hardcoded gate used to be clear about what cluster is supported for now
  if (connection.cluster !== 'mainnet') {
    return <>This instruction does not support {connection.cluster}</>;
  }

  return (
    <GovernorSelect
      tribecaConfiguration={form.tribecaConfiguration}
      setTribecaConfiguration={(value) =>
        handleSetForm({ value, propertyName: 'tribecaConfiguration' })
      }
    />
  );
};

export default ResetEpochGaugeVoter;
