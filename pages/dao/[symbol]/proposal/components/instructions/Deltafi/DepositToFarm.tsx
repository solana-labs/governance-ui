import * as yup from 'yup';
import useInstructionFormBuilder from '@hooks/useInstructionFormBuilder';
import deltafiConfiguration, {
  DeltafiDexV2,
  PoolInfo,
  UserStakeInfo,
} from '@tools/sdk/deltafi/configuration';
import { GovernedMultiTypeAccount } from '@utils/tokens';
import { DeltafiFarmDepositForm } from '@utils/uiTypes/proposalCreationTypes';
import Input from '@components/inputs/Input';
import SelectDeltafiPool, { PoolName } from '@components/SelectDeltafiPool';
import { uiAmountToNativeBN } from '@tools/sdk/units';
import { useEffect, useState } from 'react';
import depositToFarm from '@tools/sdk/deltafi/instructions/depositToFarm';
import useDeltafiProgram from '@hooks/useDeltafiProgram';

const schema = yup.object().shape({
  governedAccount: yup
    .object()
    .nullable()
    .required('Governed account is required'),
  poolName: yup.string().required('Pool name is required'),
  uiBaseAmount: yup
    .number()
    .typeError('Base Amount has to be a number')
    .required('Base Amount is required'),
  uiQuoteAmount: yup
    .number()
    .typeError('Quote Amount has to be a number')
    .required('Quote Amount is required'),
});

const DeltafiFarmDeposit = ({
  index,
  governedAccount,
}: {
  index: number;
  governedAccount?: GovernedMultiTypeAccount;
}) => {
  const { poolInfoList } = DeltafiDexV2.configuration;

  const deltafiProgram = useDeltafiProgram();

  const [poolInfo, setPoolInfo] = useState<PoolInfo | null>(null);

  const [userStakeInfo, setUserStakeInfo] = useState<UserStakeInfo | null>(
    null,
  );

  const {
    form,
    handleSetForm,
    formErrors,
    connection,
    governedAccountPubkey,
    wallet,
  } = useInstructionFormBuilder<DeltafiFarmDepositForm>({
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

      if (!poolInfo) {
        throw new Error('Pool info is required');
      }

      if (!poolInfo.farmInfo) {
        throw new Error('Farm info is required');
      }

      const baseDecimals = deltafiConfiguration.getBaseOrQuoteMintDecimals(
        poolInfo.mintBase,
      );
      const quoteDecimals = deltafiConfiguration.getBaseOrQuoteMintDecimals(
        poolInfo.mintQuote,
      );

      return depositToFarm({
        deltafiProgram,
        authority: governedAccountPubkey,
        poolInfo,
        farmInfo: poolInfo.farmInfo,
        baseAmount: uiAmountToNativeBN(form.uiBaseAmount!, baseDecimals),
        quoteAmount: uiAmountToNativeBN(form.uiQuoteAmount!, quoteDecimals),
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

      {poolInfo && !poolInfo.farmInfo ? (
        <div className="mt-2 text-sm">This pool does not contains a farm</div>
      ) : null}

      {poolInfo && poolInfo.farmInfo ? (
        <>
          <Input
            min={0}
            label="Base Amount"
            value={form.uiBaseAmount}
            type="number"
            onChange={(evt) =>
              handleSetForm({
                value: evt.target.value,
                propertyName: 'uiBaseAmount',
              })
            }
            error={formErrors['uiBaseAmount']}
          />

          {userStakeInfo ? (
            <div
              className="text-xs mt-0 text-fgd-3 hover:text-white cursor"
              onClick={() =>
                handleSetForm({
                  value: userStakeInfo.availableToDepositToFarm.uiBase,
                  propertyName: 'uiBaseAmount',
                })
              }
            >
              Max {userStakeInfo.availableToDepositToFarm.uiBase}
            </div>
          ) : null}

          <Input
            min={0}
            label="Quote Amount"
            value={form.uiQuoteAmount}
            type="number"
            onChange={(evt) => {
              handleSetForm({
                value: evt.target.value,
                propertyName: 'uiQuoteAmount',
              });
            }}
            error={formErrors['uiQuoteAmount']}
          />

          {userStakeInfo ? (
            <div
              className="text-xs mt-0 text-fgd-3 hover:text-white cursor"
              onClick={() =>
                handleSetForm({
                  value: userStakeInfo.availableToDepositToFarm.uiQuote,
                  propertyName: 'uiQuoteAmount',
                })
              }
            >
              Max {userStakeInfo.availableToDepositToFarm.uiQuote}
            </div>
          ) : null}
        </>
      ) : null}
    </>
  );
};

export default DeltafiFarmDeposit;
