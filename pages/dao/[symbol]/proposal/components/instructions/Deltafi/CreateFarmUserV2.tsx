import * as yup from 'yup';
import useInstructionFormBuilder from '@hooks/useInstructionFormBuilder';
import deltafiConfiguration, {
  DeltafiDexV2,
  PoolInfo,
} from '@tools/sdk/deltafi/configuration';
import { GovernedMultiTypeAccount } from '@utils/tokens';
import { DeltafiCreateFarmUserForm } from '@utils/uiTypes/proposalCreationTypes';
import SelectDeltafiPool, { PoolName } from '@components/SelectDeltafiPool';
import createFarmUserV2 from '@tools/sdk/deltafi/instructions/createFarmUserV2';
import { useState } from 'react';
import useDeltafiProgram from '@hooks/useDeltafiProgram';

const schema = yup.object().shape({
  governedAccount: yup
    .object()
    .nullable()
    .required('Governed account is required'),
  poolName: yup.string().required('Pool name is required'),
});

const DeltafiCreateFarmUserV2 = ({
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
  } = useInstructionFormBuilder<DeltafiCreateFarmUserForm>({
    index,
    initialFormValues: {
      governedAccount,
    },
    schema,
    buildInstruction: async function ({
      wallet,
      cluster,
      governedAccountPubkey,
      form,
    }) {
      if (cluster !== 'mainnet') {
        throw new Error('Other cluster than mainnet are not supported yet.');
      }

      if (!deltafiProgram) {
        throw new Error('Deltafi program not loaded yet');
      }

      const poolInfo = deltafiConfiguration.getPoolInfoByPoolName(
        form.poolName!,
      );

      if (!poolInfo) {
        throw new Error(`Cannot find pool info with name ${form.poolName!}`);
      }

      if (!poolInfo.farmInfo) {
        throw new Error('Selected pool does not have a farm');
      }

      return createFarmUserV2({
        deltafiProgram,
        authority: governedAccountPubkey,
        poolInfo,
        farmInfo: poolInfo.farmInfo,
        payer: wallet.publicKey!,
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
        <div className="text-sm mt-2">This pool does not contains a farm</div>
      ) : null}
    </>
  );
};

export default DeltafiCreateFarmUserV2;
