import * as yup from 'yup';
import useInstructionFormBuilder from '@hooks/useInstructionFormBuilder';
import deltafiConfiguration, {
  DeltafiDexV2,
} from '@tools/sdk/deltafi/configuration';
import { GovernedMultiTypeAccount } from '@utils/tokens';
import { DeltafiPoolWithdrawForm } from '@utils/uiTypes/proposalCreationTypes';
import Input from '@components/inputs/Input';
import SelectDeltafiPool, { PoolName } from '@components/SelectDeltafiPool';
import { nativeBNToUiAmount, uiAmountToNativeBN } from '@tools/sdk/units';
import withdraw from '@tools/sdk/deltafi/instructions/withdraw';
import { useEffect, useState } from 'react';

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
  const [selectedPoolName, setSelectedPoolName] = useState<PoolName | null>(
    null,
  );

  const [lpProviderInfo, setLpProviderInfo] = useState<{
    uiBaseShare: number;
    uiQuoteShare: number;
  } | null>(null);

  const { poolInfoList, tokenInfoList } = DeltafiDexV2.configuration[
    'mainnet-prod'
  ];

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

      const { decimals: baseDecimals } = tokenInfoList.find((token) =>
        token.mint.equals(poolInfo.mintBase),
      )!;

      const { decimals: quoteDecimals } = tokenInfoList.find((token) =>
        token.mint.equals(poolInfo.mintQuote),
      )!;

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

  // Load User Liquidity Pool Shares
  useEffect(() => {
    (async () => {
      if (
        !selectedPoolName ||
        !governedAccountPubkey ||
        !connection ||
        !wallet
      ) {
        setLpProviderInfo(null);
        return;
      }

      const poolInfo = poolInfoList.find(({ name }) => name === form.poolName!);

      if (!poolInfo) {
        throw new Error('Pool info is required');
      }

      const deltafiProgram = deltafiConfiguration.getDeltafiProgram({
        connection: connection.current,
        wallet,
      });

      const [
        lpProvider,
      ] = await deltafiConfiguration.findLiquidityProviderAddress({
        poolInfo,
        authority: governedAccountPubkey,
      });

      const lpProviderInfo = await deltafiProgram.account.liquidityProvider.fetchNullable(
        lpProvider,
      );

      if (!lpProviderInfo) {
        setLpProviderInfo(null);
        return;
      }

      const { decimals: baseDecimals } = tokenInfoList.find((token) =>
        token.mint.equals(poolInfo.mintBase),
      )!;

      const { decimals: quoteDecimals } = tokenInfoList.find((token) =>
        token.mint.equals(poolInfo.mintQuote),
      )!;

      console.log('LP INFOS', lpProviderInfo);
      console.log('LP INFOS -->', {
        baseShare: lpProviderInfo.baseShare.toString(),
        quoteShare: lpProviderInfo.quoteShare.toString(),
        stakedBaseShare: lpProviderInfo.stakedBaseShare.toString(),
        stakedQuoteShare: lpProviderInfo.stakedQuoteShare.toString(),
        a: nativeBNToUiAmount(lpProviderInfo.baseShare, baseDecimals),
        b: nativeBNToUiAmount(lpProviderInfo.quoteShare, quoteDecimals),
      });

      setLpProviderInfo({
        uiBaseShare: nativeBNToUiAmount(lpProviderInfo.baseShare, baseDecimals),
        uiQuoteShare: nativeBNToUiAmount(
          lpProviderInfo.quoteShare,
          quoteDecimals,
        ),
      });
    })();
  }, [selectedPoolName, governedAccountPubkey, connection, wallet]);

  return (
    <>
      <SelectDeltafiPool
        title="Pool"
        poolInfoList={poolInfoList}
        selectedValue={form.poolName}
        onSelect={(poolName: PoolName) => {
          handleSetForm({
            value: poolName,
            propertyName: 'poolName',
          });

          setSelectedPoolName(poolName);
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

      {lpProviderInfo ? (
        <div
          className="text-xs pointer text-fgd-3 hover:text-white"
          onClick={() => {
            handleSetForm({
              value: lpProviderInfo.uiBaseShare,
              propertyName: 'uiBaseShare',
            });
          }}
        >
          max: {lpProviderInfo.uiBaseShare}
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

      {lpProviderInfo ? (
        <div
          className="text-xs pointer text-fgd-3 hover:text-white"
          onClick={() => {
            handleSetForm({
              value: lpProviderInfo.uiQuoteShare,
              propertyName: 'uiQuoteShare',
            });
          }}
        >
          max: {lpProviderInfo.uiQuoteShare}
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
