import * as yup from 'yup';
import useInstructionFormBuilder from '@hooks/useInstructionFormBuilder';
import { getTribecaPrograms } from '@tools/sdk/tribeca/configurations';
import { prepareEpochGaugeVoterInstruction } from '@tools/sdk/tribeca/instructions/prepareEpochGaugeVoterInstruction';
import { GovernedMultiTypeAccount } from '@utils/tokens';
import { TribecaPrepareEpochGaugeVoterForm } from '@utils/uiTypes/proposalCreationTypes';
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

const PrepareEpochGaugeVoter = ({
  index,
  governedAccount,
}: {
  index: number;
  governedAccount?: GovernedMultiTypeAccount;
}) => {
  const connection = useWalletStore((s) => s.connection);
  const {
    form,
    handleSetForm,
  } = useInstructionFormBuilder<TribecaPrepareEpochGaugeVoterForm>({
    index,
    initialFormValues: {
      governedAccount,
      tribecaConfiguration: null,
    },
    schema,
    buildInstruction: async function ({ wallet, form, governedAccountPubkey }) {
      const programs = getTribecaPrograms({
        connection: connection.current,
        wallet,
        config: form.tribecaConfiguration!,
      });

      return prepareEpochGaugeVoterInstruction({
        tribecaConfiguration: form.tribecaConfiguration!,
        programs,
        payer: wallet.publicKey!,
        authority: governedAccountPubkey,
      });
    },
  });

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

export default PrepareEpochGaugeVoter;
