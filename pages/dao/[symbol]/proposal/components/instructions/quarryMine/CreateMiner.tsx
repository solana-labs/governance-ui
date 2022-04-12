import * as yup from 'yup';
import Select from '@components/inputs/Select';
import useInstructionFormBuilder from '@hooks/useInstructionFormBuilder';
import { augmentedProvider } from '@tools/sdk/augmentedProvider';
import quarryMineConfiguration from '@tools/sdk/quarryMine/configuration';
import { createMinerInstruction } from '@tools/sdk/quarryMine/instructions/createMiner';
import { GovernedMultiTypeAccount } from '@utils/tokens';
import { QuarryMineCreateMinerForm } from '@utils/uiTypes/proposalCreationTypes';
import SelectOptionList from '../../SelectOptionList';

const schema = yup.object().shape({
  governedAccount: yup
    .object()
    .nullable()
    .required('Governed account is required'),
  mintName: yup.string().required('Mint name is required'),
});

const CreateMiner = ({
  index,
  governedAccount,
}: {
  index: number;
  governedAccount?: GovernedMultiTypeAccount;
}) => {
  const {
    form,
    handleSetForm,
    formErrors,
    connection,
  } = useInstructionFormBuilder<QuarryMineCreateMinerForm>({
    index,
    initialFormValues: {
      governedAccount,
    },
    schema,
    buildInstruction: async function ({
      form,
      governedAccountPubkey,
      connection,
      wallet,
    }) {
      return createMinerInstruction({
        augmentedProvider: augmentedProvider(connection, wallet),
        authority: governedAccountPubkey,
        payer: wallet.publicKey!,
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
      label="Mint Name"
      value={form.mintName}
      placeholder="Please select..."
      onChange={(value) => {
        handleSetForm({
          value,
          propertyName: 'mintName',
        });
      }}
      error={formErrors['mintName']}
    >
      <SelectOptionList
        list={Object.keys(quarryMineConfiguration.supportedMintNames)}
      />
    </Select>
  );
};

export default CreateMiner;
