import * as yup from 'yup';
import useInstructionFormBuilder from '@hooks/useInstructionFormBuilder';
import { DeltafiDexV2, PoolInfo } from '@tools/sdk/deltafi/configuration';
import { GovernedMultiTypeAccount } from '@utils/tokens';
import { DeltafiClaimFarmRewardsForm } from '@utils/uiTypes/proposalCreationTypes';
import SelectDeltafiPool, { PoolName } from '@components/SelectDeltafiPool';
import { useState } from 'react';
import useDeltafiProgram from '@hooks/useDeltafiProgram';
import claimFarmRewards from '@tools/sdk/deltafi/instructions/claimFarmRewards';

const schema = yup.object().shape({
  governedAccount: yup
    .object()
    .nullable()
    .required('Governed account is required'),
  poolName: yup.string().required('Pool name is required'),
});

const DeltafiClaimFarmRewards = ({
  index,
  governedAccount,
}: {
  index: number;
  governedAccount?: GovernedMultiTypeAccount;
}) => {
  const { poolInfoList } = DeltafiDexV2.configuration;

  const deltafiProgram = useDeltafiProgram();

  const [poolInfo, setPoolInfo] = useState<PoolInfo | null>(null);

  const {
    form,
    handleSetForm,
  } = useInstructionFormBuilder<DeltafiClaimFarmRewardsForm>({
    index,
    initialFormValues: {
      governedAccount,
    },
    schema,
    buildInstruction: async function ({ cluster, governedAccountPubkey }) {
      if (cluster !== 'mainnet') {
        throw new Error('Other cluster than mainnet are not supported yet.');
      }

      if (!deltafiProgram) {
        throw new Error('Deltafi program not loaded yet');
      }

      if (!poolInfo) {
        throw new Error('Pool info is required');
      }

      if (!poolInfo.farmInfo) {
        throw new Error('Farm info is required');
      }

      return claimFarmRewards({
        deltafiProgram,
        authority: governedAccountPubkey,
        poolInfo,
        farmInfo: poolInfo.farmInfo,
      });
    },
  });

  return (
    <>
      <SelectDeltafiPool
        title="Pool"
        poolInfoList={poolInfoList}
        selectedValue={form.poolName}
        onSelect={(poolName: PoolName) => {
          const poolInfo = poolInfoList.find(({ name }) => name === poolName);

          setPoolInfo(poolInfo ?? null);

          handleSetForm({
            value: poolName,
            propertyName: 'poolName',
          });
        }}
      />

      {poolInfo && !poolInfo.farmInfo ? (
        <div className="mt-2 text-sm">This pool does not contains a farm</div>
      ) : null}
    </>
  );
};

export default DeltafiClaimFarmRewards;
