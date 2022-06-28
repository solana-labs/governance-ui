import * as yup from 'yup';
import useInstructionFormBuilder from '@hooks/useInstructionFormBuilder';
import deltafiConfiguration, {
  DeltafiDexV2,
  PoolInfo,
  UserStakeInfo,
} from '@tools/sdk/deltafi/configuration';
import { GovernedMultiTypeAccount } from '@utils/tokens';
import { DeltafiPoolWithdrawForm } from '@utils/uiTypes/proposalCreationTypes';
import Input from '@components/inputs/Input';
import SelectDeltafiPool, { PoolName } from '@components/SelectDeltafiPool';
import { uiAmountToNativeBN } from '@tools/sdk/units';
import withdraw from '@tools/sdk/deltafi/instructions/withdraw';
import { useEffect, useState } from 'react';
import useDeltafiProgram from '@hooks/useDeltafiProgram';

const schema = yup.object().shape({
  governedAccount: yup
    .object()
    .nullable()
    .required('Governed account is required'),
  poolName: yup.string().required('Pool name is required'),
  uiBaseShare: yup
    .number()
    .typeError('Base Share has to be a number')
    .required('Base Share is required'),
  uiQuoteShare: yup
    .number()
    .typeError('Quote Share has to be a number')
    .required('Quote Share is required'),
  uiMinBaseAmount: yup
    .number()
    .typeError('Min Base Amount has to be a number')
    .required('Min Base Amount is required'),
  uiMinQuoteAmount: yup
    .number()
    .typeError('Min Quote Amount has to be a number')
    .required('Min Quote Amount is required'),
});

const DeltafiPoolWithdraw = ({
  index,
  governedAccount,
}: {
  index: number;
  governedAccount?: GovernedMultiTypeAccount;
}) => {
  const deltafiProgram = useDeltafiProgram();

  const [poolInfo, setPoolInfo] = useState<PoolInfo | null>(null);

  const [userStakeInfo, setUserStakeInfo] = useState<UserStakeInfo | null>(
    null,
  );

  const { poolInfoList } = DeltafiDexV2.configuration;

  const {
    form,
    handleSetForm,
    formErrors,
    governedAccountPubkey,
    connection,
    wallet,
  } = useInstructionFormBuilder<DeltafiPoolWithdrawForm>({
    index,
    initialFormValues: {
      governedAccount,
    },
    schema,
    buildInstruction: async function ({
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
        throw new Error('Pool info is required');
      }

      const baseDecimals = deltafiConfiguration.getBaseOrQuoteMintDecimals(
        poolInfo.mintBase,
      );
      const quoteDecimals = deltafiConfiguration.getBaseOrQuoteMintDecimals(
        poolInfo.mintQuote,
      );

      return withdraw({
        deltafiProgram,
        authority: governedAccountPubkey,
        poolInfo,

        baseShare: uiAmountToNativeBN(form.uiBaseShare!, baseDecimals),
        quoteShare: uiAmountToNativeBN(form.uiQuoteShare!, quoteDecimals),
        minBaseAmount: uiAmountToNativeBN(form.uiMinBaseAmount!, baseDecimals),
        minQuoteAmount: uiAmountToNativeBN(
          form.uiMinQuoteAmount!,
          quoteDecimals,
        ),
      });
    },
  });

  useEffect(() => {
    (async () => {
      if (
        !poolInfo ||
        !governedAccountPubkey ||
        !wallet ||
        !deltafiProgram ||
        !connection
      ) {
        setUserStakeInfo(null);
        return;
      }

      setUserStakeInfo(
        await deltafiConfiguration.getUserStakeInfo({
          poolInfo,
          authority: governedAccountPubkey,
          deltafiProgram,
        }),
      );
    })();
  }, [poolInfo, connection, governedAccountPubkey, deltafiProgram]);

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

      <Input
        min={0}
        label="Base Share"
        value={form.uiBaseShare}
        type="number"
        onChange={(evt) => {
          handleSetForm({
            value: evt.target.value,
            propertyName: 'uiBaseShare',
          });
        }}
        error={formErrors['uiBaseShare']}
      />

      {userStakeInfo ? (
        <div
          className="text-xs pointer text-fgd-3 hover:text-white"
          onClick={() => {
            handleSetForm({
              value: userStakeInfo.inPool.uiBase,
              propertyName: 'uiBaseShare',
            });
          }}
        >
          max: {userStakeInfo.inPool.uiBase}
        </div>
      ) : null}

      <Input
        min={0}
        label="Quote Share"
        value={form.uiQuoteShare}
        type="number"
        onChange={(evt) => {
          handleSetForm({
            value: evt.target.value,
            propertyName: 'uiQuoteShare',
          });
        }}
        error={formErrors['uiQuoteShare']}
      />

      {userStakeInfo ? (
        <div
          className="text-xs pointer text-fgd-3 hover:text-white"
          onClick={() => {
            handleSetForm({
              value: userStakeInfo.inPool.uiQuote,
              propertyName: 'uiQuoteShare',
            });
          }}
        >
          max: {userStakeInfo.inPool.uiQuote}
        </div>
      ) : null}

      <Input
        min={0}
        label="Min Base Amount"
        value={form.uiMinBaseAmount}
        type="number"
        onChange={(evt) =>
          handleSetForm({
            value: evt.target.value,
            propertyName: 'uiMinBaseAmount',
          })
        }
        error={formErrors['uiMinBaseAmount']}
      />

      <Input
        min={0}
        label="Min Quote Amount"
        value={form.uiMinQuoteAmount}
        type="number"
        onChange={(evt) => {
          handleSetForm({
            value: evt.target.value,
            propertyName: 'uiMinQuoteAmount',
          });
        }}
        error={formErrors['uiMinQuoteAmount']}
      />
    </>
  );
};

export default DeltafiPoolWithdraw;
