import * as yup from 'yup';
import Select from '@components/inputs/Select';
import useInstructionFormBuilder from '@hooks/useInstructionFormBuilder';
import { createAssociatedTokenAccount } from '@utils/associated';
import { getSplTokenMintAddressByUIName, SPL_TOKENS } from '@utils/splTokens';
import { GovernedMultiTypeAccount } from '@utils/tokens';
import { CreateAssociatedTokenAccountForm } from '@utils/uiTypes/proposalCreationTypes';

const schema = yup.object().shape({
  governedAccount: yup
    .object()
    .nullable()
    .required('Governed account is required'),
  splTokenMintUIName: yup.string().required('SPL Token Mint is required'),
});

const CreateAssociatedTokenAccount = ({
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
  } = useInstructionFormBuilder<CreateAssociatedTokenAccountForm>({
    index,
    initialFormValues: {
      governedAccount,
    },
    schema,
    buildInstruction: async function ({ wallet, governedAccountPubkey, form }) {
      const [tx] = await createAssociatedTokenAccount(
        // fundingAddress
        wallet.publicKey!,

        // walletAddress
        governedAccountPubkey,

        // splTokenMintAddress
        getSplTokenMintAddressByUIName(form.splTokenMintUIName!),
      );
      return tx;
    },
  });

  return (
    <Select
      label="SPL Token Mint"
      value={form.splTokenMintUIName}
      placeholder="Please select..."
      onChange={(value) =>
        handleSetForm({ value, propertyName: 'splTokenMintUIName' })
      }
      error={formErrors['baseTokenName']}
    >
      {Object.entries(SPL_TOKENS).map(([key, { name, mint }]) => (
        <Select.Option key={key} value={name}>
          <div className="flex flex-col">
            <span>{name}</span>

            <span className="text-gray-500 text-sm">{mint.toString()}</span>
          </div>
        </Select.Option>
      ))}
    </Select>
  );
};

export default CreateAssociatedTokenAccount;
