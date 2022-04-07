import React, { useEffect } from 'react';
import * as yup from 'yup';
import Input from '@components/inputs/Input';
import Select from '@components/inputs/Select';
import useInstructionFormBuilder from '@hooks/useInstructionFormBuilder';
import { createAddLiquidityInstruction } from '@tools/sdk/raydium/createAddLiquidityInstruction';
import {
  getAmountOut,
  getLiquidityPoolKeysByLabel,
} from '@tools/sdk/raydium/helpers';
import { liquidityPoolKeysList } from '@tools/sdk/raydium/poolKeys';
import { uiAmountToNativeBN } from '@tools/sdk/units';
import { debounce } from '@utils/debounce';
import { GovernedMultiTypeAccount } from '@utils/tokens';
import { AddLiquidityRaydiumForm } from '@utils/uiTypes/proposalCreationTypes';
import SelectOptionList from '../../SelectOptionList';

const SLIPPAGE_OPTIONS = [0.5, 1, 2];
const FIXED_SIDE_LIST = ['base', 'quote'];

const schema = yup.object().shape({
  governedAccount: yup
    .object()
    .nullable()
    .required('Program governed account is required'),
  liquidityPool: yup.string().required('Liquidity Pool is required'),
  baseAmountIn: yup
    .number()
    .moreThan(0, 'Amount for Base token should be more than 0')
    .required('Amount for Base token is required'),
  quoteAmountIn: yup
    .number()
    .moreThan(0, 'Amount for Quote token should be more than 0')
    .required('Amount for Quote token is required'),
  fixedSide: yup
    .string()
    .equals(['base', 'quote'])
    .required('Fixed Side is required'),
  slippage: yup.number().required('Slippage value is required'),
});

const RaydiumAddLiquidityToPool = ({
  index,
  governedAccount,
}: {
  index: number;
  governedAccount?: GovernedMultiTypeAccount;
}) => {
  const {
    form,
    connection,
    formErrors,
    handleSetForm,
  } = useInstructionFormBuilder<AddLiquidityRaydiumForm>({
    index,
    initialFormValues: {
      governedAccount,
      fixedSide: 'base',
      slippage: 0.5,
    },
    schema,
    buildInstruction: async function ({ form, governedAccountPubkey }) {
      const poolKeys = getLiquidityPoolKeysByLabel(form.liquidityPool!);
      const [base, quote] = await Promise.all([
        connection.current.getTokenSupply(poolKeys.baseMint),
        connection.current.getTokenSupply(poolKeys.quoteMint),
      ]);
      return createAddLiquidityInstruction(
        poolKeys,
        uiAmountToNativeBN(form.baseAmountIn!, base.value.decimals),
        uiAmountToNativeBN(form.quoteAmountIn!, quote.value.decimals),
        form.fixedSide,
        governedAccountPubkey,
      );
    },
  });

  useEffect(() => {
    debounce.debounceFcn(async () => {
      if (!form.baseAmountIn || !form.liquidityPool) return;

      handleSetForm({
        value: await getAmountOut(
          form.liquidityPool,
          form.baseAmountIn,
          connection.current,
          form.slippage,
        ),
        propertyName: 'quoteAmountIn',
      });
    });
  }, [form.baseAmountIn, form.slippage]);

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
        <SelectOptionList list={Object.keys(liquidityPoolKeysList)} />
      </Select>

      {form.liquidityPool && (
        <>
          <Input
            label="Base Token Amount to deposit"
            value={form.baseAmountIn}
            type="number"
            min={0}
            onChange={(evt) =>
              handleSetForm({
                value: evt.target.value,
                propertyName: 'baseAmountIn',
              })
            }
            error={formErrors['baseAmountIn']}
          />

          <Select
            label="Slippage (%)"
            value={form.slippage}
            onChange={(value) =>
              handleSetForm({ value, propertyName: 'slippage' })
            }
            error={formErrors['slippage']}
          >
            <SelectOptionList list={SLIPPAGE_OPTIONS} />
          </Select>

          <Input
            label="Quote Token Amount to deposit"
            value={form.quoteAmountIn}
            type="number"
            min={0}
            disabled={true}
            error={formErrors['quoteAmountIn']}
          />
          <Select
            label="Fixed Side"
            value={form.fixedSide}
            placeholder="Please select..."
            onChange={(value) =>
              handleSetForm({ value, propertyName: 'fixedSide' })
            }
            error={formErrors['fixedSide']}
          >
            <SelectOptionList list={FIXED_SIDE_LIST} />
          </Select>
        </>
      )}
    </>
  );
};

export default RaydiumAddLiquidityToPool;
