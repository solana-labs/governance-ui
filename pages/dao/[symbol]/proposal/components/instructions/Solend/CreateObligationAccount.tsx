import * as yup from 'yup';
import useInstructionFormBuilder from '@hooks/useInstructionFormBuilder';
import { createObligationAccount } from '@tools/sdk/solend/createObligationAccount';
import { GovernedMultiTypeAccount } from '@utils/tokens';
import { CreateSolendObligationAccountForm } from '@utils/uiTypes/proposalCreationTypes';

const schema = yup.object().shape({
  governedAccount: yup
    .object()
    .nullable()
    .required('Governed account is required'),
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
  } = useInstructionFormBuilder<CreateSolendObligationAccountForm>({
    index,
    initialFormValues: {
      governedAccount,
    },
    schema,
    buildInstruction: async function ({ wallet, governedAccountPubkey }) {
      return createObligationAccount({
        fundingAddress: wallet.publicKey!,
        walletAddress: governedAccountPubkey,
      });
    },
  });

  // Hardcoded gate used to be clear about what cluster is supported for now
  if (connection.cluster !== 'mainnet') {
    return <>This instruction does not support {connection.cluster}</>;
  }

  // only need governance select for this instruction
  return null;
};

export default CreateObligationAccount;
