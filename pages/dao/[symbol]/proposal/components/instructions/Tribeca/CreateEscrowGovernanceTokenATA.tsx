import * as yup from 'yup';
import useInstructionFormBuilder from '@hooks/useInstructionFormBuilder';
import {
  getTribecaLocker,
  getTribecaPrograms,
} from '@tools/sdk/tribeca/configurations';
import { createEscrowATAInstruction } from '@tools/sdk/tribeca/instructions/createEscrowSaberATAInstruction';
import { GovernedMultiTypeAccount } from '@utils/tokens';
import { TribecaCreateEscrowGovernanceTokenATAForm } from '@utils/uiTypes/proposalCreationTypes';
import GovernorSelect from './GovernorSelect';

const schema = yup.object().shape({
  governedAccount: yup
    .object()
    .nullable()
    .required('Governed account is required'),
  tribecaConfiguration: yup
    .object()
    .nullable()
    .required('Tribeca Configuration governor is required'),
});

const CreateEscrowGovernanceATA = ({
  index,
  governedAccount,
}: {
  index: number;
  governedAccount?: GovernedMultiTypeAccount;
}) => {
  const {
    connection,
    form,
    handleSetForm,
  } = useInstructionFormBuilder<TribecaCreateEscrowGovernanceTokenATAForm>({
    index,
    initialFormValues: {
      governedAccount,
      tribecaConfiguration: null,
    },
    schema,
    buildInstruction: async function ({
      form,
      connection,
      wallet,
      governedAccountPubkey,
    }) {
      const programs = getTribecaPrograms({
        connection,
        wallet,
        config: form.tribecaConfiguration!,
      });
      const lockerData = await getTribecaLocker({
        config: form.tribecaConfiguration!,
        programs,
      });
      // FIXME: does not pass this check without refreshing the form
      if (!lockerData) {
        throw new Error('Error initializing Tribeca configuration');
      }

      return createEscrowATAInstruction({
        tribecaConfiguration: form.tribecaConfiguration!,
        lockerData,
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
        handleSetForm({ propertyName: 'tribecaConfiguration', value })
      }
    />
  );
};

export default CreateEscrowGovernanceATA;
