import * as yup from 'yup';
import Select from '@components/inputs/Select';
import useInstructionFormBuilder from '@hooks/useInstructionFormBuilder';
import quarryMineConfiguration from '@tools/sdk/quarryMine/configuration';
import { claimRewardsInstruction } from '@tools/sdk/quarryMine/instructions/claimRewards';
import { GovernedMultiTypeAccount } from '@utils/tokens';
import { QuarryMineClaimRewardsForm } from '@utils/uiTypes/proposalCreationTypes';

import SelectOptionList from '../../SelectOptionList';
import { augmentedProvider } from '@tools/sdk/augmentedProvider';

const schema = yup.object().shape({
  governedAccount: yup
    .object()
    .nullable()
    .required('Governed account is required'),
  mintName: yup.string().required('Mint name is required'),
});

const ClaimRewards = ({
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
  } = useInstructionFormBuilder<QuarryMineClaimRewardsForm>({
    index,
    initialFormValues: {
      governedAccount,
    },
    schema,
    buildInstruction: async function ({
      form,
      wallet,
      connection,
      governedAccountPubkey,
    }) {
      return claimRewardsInstruction({
        augmentedProvider: augmentedProvider(connection, wallet),
        authority: governedAccountPubkey,
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

export default ClaimRewards;
