import * as yup from 'yup';
import { EmptyInstructionForm } from '@utils/uiTypes/proposalCreationTypes';
import useInstructionFormBuilder from '@hooks/useInstructionFormBuilder';
import { GovernedMultiTypeAccount } from '@utils/tokens';

const Empty = ({
  index,
  governedAccount,
}: {
  index: number;
  governedAccount?: GovernedMultiTypeAccount;
}) => {
  useInstructionFormBuilder<EmptyInstructionForm>({
    index,
    initialFormValues: {
      governedAccount,
    },
    schema: yup.object().shape({
      governedAccount: yup
        .object()
        .nullable()
        .required('Governed account is required'),
    }),
  });

  return null;
};

export default Empty;
