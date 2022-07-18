import * as yup from 'yup';
import Input from '@components/inputs/Input';
import useInstructionFormBuilder from '@hooks/useInstructionFormBuilder';
import createInitializeControllerInstruction from '@tools/sdk/uxdProtocol/createInitializeControllerInstruction';
import { GovernedMultiTypeAccount } from '@utils/tokens';
import { UXDInitializeControllerForm } from '@utils/uiTypes/proposalCreationTypes';

const schema = yup.object().shape({
  mintDecimals: yup
    .number()
    .min(0, 'Mint decimals cannot be less than 0')
    .max(9, 'Mint decimals cannot be more than 9')
    .required('Mint Decimals is required'),
  governedAccount: yup
    .object()
    .nullable()
    .required('Governance account is required'),
});

const InitializeController = ({
  index,
  governedAccount,
}: {
  index: number;
  governedAccount?: GovernedMultiTypeAccount;
}) => {
  const {
    form,
    formErrors,
    handleSetForm,
  } = useInstructionFormBuilder<UXDInitializeControllerForm>({
    index,
    initialFormValues: {
      governedAccount,
      mintDecimals: 0,
    },
    schema,
    buildInstruction: async function ({ form, wallet, governedAccountPubkey }) {
      return createInitializeControllerInstruction({
        uxdProgramId: form.governedAccount!.governance!.account.governedAccount,
        authority: governedAccountPubkey,
        payer: wallet.publicKey!,
      });
    },
  });

  return (
    <>
      <Input
        label="Mint Decimals"
        value={form.mintDecimals}
        type="number"
        min={0}
        max={9}
        onChange={(evt) =>
          handleSetForm({
            value: evt.target.value,
            propertyName: 'mintDecimals',
          })
        }
        error={formErrors['mintDecimals']}
      />
    </>
  );
};

export default InitializeController;
