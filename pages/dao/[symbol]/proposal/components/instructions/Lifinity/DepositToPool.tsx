import React, { useEffect } from 'react';
import * as yup from 'yup';
import useInstructionFormBuilder from '@hooks/useInstructionFormBuilder';
import { GovernedMultiTypeAccount } from '@utils/tokens';
import { LifinityDepositToPoolForm } from '@utils/uiTypes/proposalCreationTypes';
import depositToPool from '@tools/sdk/lifinity/depositToPool';
import Select from '@components/inputs/Select';
import SelectOptionList from '../../SelectOptionList';
import Input from '@components/inputs/Input';
import { getDepositOut, poolLabels } from '@tools/sdk/lifinity/lifinity';
import { debounce } from '@utils/debounce';

const SLIPPAGE_OPTIONS = [0.5, 1, 2];

const schema = yup.object().shape({
  governedAccount: yup
    .object()
    .nullable()
    .required('Governed account is required'),
  liquidityPool: yup.string().required('Liquidity Pool is required'),
  amountTokenA: yup
    .number()
    .moreThan(0, 'Token A Amount to deposit must be more than 0')
    .required('Token A Amount to deposit value is required'),
  amountTokenB: yup
    .number()
    .moreThan(0, 'Token B Amount to deposit must be more than 0')
    .required('Token B Amount to deposit value is required'),
  amountTokenLP: yup
    .number()
    .moreThan(0, 'Token LP Amount to deposit must be more than 0')
    .required('Token LP Amount to deposit value is required'),
  slippage: yup.number().required('Slippage value is required'),
});

const DepositToPool = ({
  index,
  governedAccount,
}: {
  index: number;
  governedAccount?: GovernedMultiTypeAccount;
}) => {
  const {
    connection,
    wallet,
    form,
    handleSetForm,
    formErrors,
  } = useInstructionFormBuilder<LifinityDepositToPoolForm>({
    index,
    initialFormValues: {
      governedAccount,
      amountTokenA: 0,
      amountTokenB: 0,
      slippage: 0.5,
    },
    schema,
    buildInstruction: async function ({
      connection,
      wallet,
      form,
      governedAccountPubkey,
    }) {
      return depositToPool({
        connection,
        authority: governedAccountPubkey,
        wallet,
        liquidityPool: form.liquidityPool!,
        amountTokenA: form.amountTokenA!,
        amountTokenB: form.amountTokenB!,
        amountTokenLP: form.amountTokenLP!,
        slippage: form.slippage,
      });
    },
  });

  useEffect(() => {
    debounce.debounceFcn(async () => {
      if (!form.amountTokenA || !form.liquidityPool || !wallet) return;
      const depositAmountOut = await getDepositOut({
        connection: connection.current,
        wallet,
        amountTokenA: form.amountTokenA,
        slippage: form.slippage,
      });
      handleSetForm({
        value: depositAmountOut.amountOut,
        propertyName: 'amountTokenB',
      });
    });
  }, [form.amountTokenA, form.slippage]);

  useEffect(() => {
    debounce.debounceFcn(async () => {
      if (
        !form.amountTokenA ||
        !form.amountTokenB ||
        !form.liquidityPool ||
        !wallet
      )
        return;
      const depositAmountOut = await getDepositOut({
        connection: connection.current,
        wallet,
        amountTokenA: form.amountTokenA,
        slippage: form.slippage,
      });
      console.log('depositAmountOut', depositAmountOut);
      handleSetForm({
        value: depositAmountOut.lpRecive,
        propertyName: 'amountTokenLP',
      });
    });
  }, [form.amountTokenB]);

  // Hardcoded gate used to be clear about what cluster is supported for now
  if (connection.cluster !== 'mainnet') {
    return <>This instruction does not support {connection.cluster}</>;
  }

  return (
    <>
      <Select
        label="Lifinity Liquidity Pool"
        value={form.liquidityPool}
        placeholder="Please select..."
        onChange={(value) =>
          handleSetForm({ value, propertyName: 'liquidityPool' })
        }
        error={formErrors['liquidityPool']}
      >
        <SelectOptionList list={poolLabels} />
      </Select>
      {form.liquidityPool && (
        <>
          <Input
            label="Amount of Token A to deposit"
            value={form.amountTokenA}
            type="number"
            min="0"
            onChange={(evt) =>
              handleSetForm({
                value: evt.target.value,
                propertyName: 'amountTokenA',
              })
            }
            error={formErrors['amountTokenA']}
          />
          <Input
            label="Amount of Token B to deposit"
            value={form.amountTokenB}
            type="number"
            min={0}
            disabled={true}
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
        </>
      )}
    </>
  );
};

export default DepositToPool;
