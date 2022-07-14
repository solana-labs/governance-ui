import React, { useState } from 'react';
import * as yup from 'yup';
import Input from '@components/inputs/Input';
import Select from '@components/inputs/Select';
import useInstructionFormBuilder from '@hooks/useInstructionFormBuilder';
import saberPoolsConfiguration, {
  Pool,
} from '@tools/sdk/saberPools/configuration';
import { GovernedMultiTypeAccount } from '@utils/tokens';
import { SaberPoolsSwapForm } from '@utils/uiTypes/proposalCreationTypes';

import useWalletStore from 'stores/useWalletStore';
import { uiAmountToNativeBN } from '@tools/sdk/units';
import { swap, SwapSide } from '@tools/sdk/saberPools/swap';
import Switch from '@components/Switch';

const schema = yup.object().shape({
  governedAccount: yup
    .object()
    .nullable()
    .required('Governed account is required'),
  uiAmountIn: yup.number().required('Amount In is required'),
  uiMinimumAmountOut: yup
    .number()
    .moreThan(0, 'Minimum Amount Out should be more than 0')
    .required('Minimum Amount Out is required'),
});

const Swap = ({
  index,
  governedAccount,
}: {
  index: number;
  governedAccount?: GovernedMultiTypeAccount;
}) => {
  const connection = useWalletStore((s) => s.connection);
  const [pool, setPool] = useState<Pool | null>(null);
  const [swapSide, setSwapSide] = useState<SwapSide>('swapAforB');

  const {
    form,
    handleSetForm,
    formErrors,
  } = useInstructionFormBuilder<SaberPoolsSwapForm>({
    index,
    initialFormValues: {
      governedAccount,
    },
    schema,
    buildInstruction: async function ({ form, governedAccountPubkey }) {
      if (!pool) {
        throw new Error('Saber Pool not found');
      }

      return swap({
        authority: governedAccountPubkey,
        pool,
        amountIn: uiAmountToNativeBN(
          form.uiAmountIn!.toString(),
          pool.tokenAccountA.decimals,
        ),
        minimumAmountOut: uiAmountToNativeBN(
          form.uiMinimumAmountOut!.toString(),
          pool.poolToken.decimals,
        ),
        side: swapSide,
      });
    },
  });

  // Hardcoded gate used to be clear about what cluster is supported for now
  if (connection.cluster !== 'mainnet') {
    return <>This instruction does not support {connection.cluster}</>;
  }

  return (
    <>
      <Select
        label="Pool"
        value={form.poolName}
        placeholder="Please select..."
        onChange={(value) => {
          handleSetForm({
            value,
            propertyName: 'poolName',
          });

          setPool(saberPoolsConfiguration.pools[value] ?? null);
        }}
        error={formErrors['poolName']}
      >
        {Object.keys(saberPoolsConfiguration.pools).map((name) => (
          <Select.Option key={name} value={name}>
            {name}
          </Select.Option>
        ))}
      </Select>

      {pool ? (
        <div className="flex mb-2">
          <span className="text-sm">
            Swap {pool.tokenAccountA.name} for {pool.tokenAccountB.name}
          </span>

          <Switch
            className="ml-2"
            checked={swapSide === 'swapBforA'}
            onChange={(b) => {
              setSwapSide(b ? 'swapBforA' : 'swapAforB');
            }}
          />

          <span className="text-sm ml-2">
            Swap {pool.tokenAccountB.name} for {pool.tokenAccountA.name}
          </span>
        </div>
      ) : null}

      {pool ? (
        <>
          <Input
            label={`${
              swapSide === 'swapAforB'
                ? pool.tokenAccountA.name
                : pool.tokenAccountB.name
            } Amount`}
            value={form.uiAmountIn}
            type="number"
            min="0"
            onChange={(evt) =>
              handleSetForm({
                value: evt.target.value,
                propertyName: 'uiAmountIn',
              })
            }
            error={formErrors['uiAmountIn']}
          />

          <Input
            label={`${
              swapSide === 'swapAforB'
                ? pool.tokenAccountB.name
                : pool.tokenAccountA.name
            } Minimum Amount`}
            value={form.uiMinimumAmountOut}
            type="number"
            min="0"
            onChange={(evt) =>
              handleSetForm({
                value: evt.target.value,
                propertyName: 'uiMinimumAmountOut',
              })
            }
            error={formErrors['uiMinimumAmountOut']}
          />
        </>
      ) : null}
    </>
  );
};

export default Swap;
