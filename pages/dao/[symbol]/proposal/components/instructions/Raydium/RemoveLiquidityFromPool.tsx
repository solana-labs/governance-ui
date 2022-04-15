import React, { useEffect, useState } from 'react';
import * as yup from 'yup';
import { jsonInfo2PoolKeys } from '@raydium-io/raydium-sdk';
import Input from '@components/inputs/Input';
import Select from '@components/inputs/Select';
import useInstructionFormBuilder from '@hooks/useInstructionFormBuilder';
import { createRemoveLiquidityInstruction } from '@tools/sdk/raydium/createRemoveLiquidityInstruction';
import { fetchLiquidityPoolData } from '@tools/sdk/raydium/helpers';
import { liquidityPoolKeysList } from '@tools/sdk/raydium/poolKeys';
import { uiAmountToNativeBN } from '@tools/sdk/units';
import { notify } from '@utils/notifications';
import { GovernedMultiTypeAccount } from '@utils/tokens';
import { RemoveLiquidityRaydiumForm } from '@utils/uiTypes/proposalCreationTypes';
import SelectOptionList from '../../SelectOptionList';

const POOL_KEYS_OPTIONS = Object.keys(liquidityPoolKeysList);

const schema = yup.object().shape({
  governedAccount: yup
    .object()
    .nullable()
    .required('Program governed account is required'),
  liquidityPool: yup.string().required('Liquidity Pool is required'),
  amountIn: yup
    .number()
    .moreThan(0, 'Amount for LP token should be more than 0')
    .required('Amount for LP token is required'),
});

const RaydiumRemoveLiquidityFromPool = ({
  index,
  governedAccount,
}: {
  index: number;
  governedAccount?: GovernedMultiTypeAccount;
}) => {
  const [lpMintInfo, setLpMintInfo] = useState<{
    balance: number;
    decimals: number;
  } | null>(null);

  const {
    form,
    connection,
    formErrors,
    handleSetForm,
  } = useInstructionFormBuilder<RemoveLiquidityRaydiumForm>({
    index,
    initialFormValues: {
      governedAccount,
      liquidityPool: '',
      amountIn: 0,
    },
    schema,
    buildInstruction: async function ({ form, governedAccountPubkey }) {
      if (!lpMintInfo) {
        throw new Error('missing parameter Liquidity Pool Mint Info');
      }

      return createRemoveLiquidityInstruction(
        governedAccountPubkey,
        jsonInfo2PoolKeys(liquidityPoolKeysList[form.liquidityPool]),
        uiAmountToNativeBN(form.amountIn, lpMintInfo.decimals),
      );
    },
  });

  useEffect(() => {
    async function fetchLpMintInfo() {
      try {
        const { maxBalance, decimals } = await fetchLiquidityPoolData({
          governanceKey: governedAccount?.governance?.pubkey,
          lp: form.liquidityPool,
          connection: connection.current,
        });
        setLpMintInfo({ balance: maxBalance, decimals });
      } catch (e) {
        notify({
          type: 'error',
          message: 'Could not fetch LP Account',
          description: `${form.liquidityPool} LP Token Account could not be found for the selected Governance`,
        });
      }
    }
    fetchLpMintInfo();
  }, [governedAccount?.governance?.pubkey, form.liquidityPool]);

  return (
    <>
      <Select
        label="Raydium Liquidity Pool"
        value={form.liquidityPool}
        placeholder="Please select..."
        onChange={(value) =>
          handleSetForm({ value, propertyName: 'liquidityPool' })
        }
        error={formErrors['liquidityPool']}
      >
        <SelectOptionList list={POOL_KEYS_OPTIONS} />
      </Select>

      <Input
        label={`LP Token Amount to withdraw - max: ${
          lpMintInfo ? lpMintInfo.balance : '-'
        }`}
        value={form.amountIn}
        type="number"
        min={0}
        onChange={(evt) =>
          handleSetForm({
            value: evt.target.value,
            propertyName: 'amountIn',
          })
        }
        error={formErrors['amountIn']}
      />
    </>
  );
};

export default RaydiumRemoveLiquidityFromPool;
