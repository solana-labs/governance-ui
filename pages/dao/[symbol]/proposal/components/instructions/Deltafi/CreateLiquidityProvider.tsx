import * as yup from 'yup';
import useInstructionFormBuilder from '@hooks/useInstructionFormBuilder';
import deltafiConfiguration, {
  DeltafiDexV2,
} from '@tools/sdk/deltafi/configuration';
import { GovernedMultiTypeAccount } from '@utils/tokens';
import { DeltafiCreateLiquidityProviderForm } from '@utils/uiTypes/proposalCreationTypes';
import SelectDeltafiPool, { PoolName } from '@components/SelectDeltafiPool';
import createLiquidityProviderV2 from '@tools/sdk/deltafi/instructions/createLiquidityProviderV2';

const schema = yup.object().shape({
  governedAccount: yup
    .object()
    .nullable()
    .required('Governed account is required'),
  poolName: yup.string().required('Pool name is required'),
});

const DeltafiCreateLiquidityProvider = ({
  index,
  governedAccount,
}: {
  index: number;
  governedAccount?: GovernedMultiTypeAccount;
}) => {
  const { poolInfoList } = DeltafiDexV2.configuration['mainnet-prod'];

  const {
    form,
    handleSetForm,
  } = useInstructionFormBuilder<DeltafiCreateLiquidityProviderForm>({
    index,
    initialFormValues: {
      governedAccount,
    },
    schema,
    buildInstruction: async function ({
      connection,
      wallet,
      cluster,
      governedAccountPubkey,
      form,
    }) {
      if (cluster !== 'mainnet') {
        throw new Error('Other cluster than mainnet are not supported yet.');
      }

      const deltafiProgram = deltafiConfiguration.getDeltafiProgram({
        connection,
        wallet,
      });

      // We consider that the configuration must have token info about tokens used in pools
      // thus the use of !
      const poolInfo = poolInfoList.find(({ name }) => name === form.poolName!);

      if (!poolInfo) {
        throw new Error('Pool info is required');
      }

      return createLiquidityProviderV2({
        deltafiProgram,
        authority: governedAccountPubkey,
        poolInfo,
        payer: wallet.publicKey!,
      });
    },
  });

  return (
    <SelectDeltafiPool
      title="Pool"
      poolInfoList={poolInfoList}
      selectedValue={form.poolName}
      onSelect={(poolName: PoolName) =>
        handleSetForm({
          value: poolName,
          propertyName: 'poolName',
        })
      }
    />
  );
};

export default DeltafiCreateLiquidityProvider;
