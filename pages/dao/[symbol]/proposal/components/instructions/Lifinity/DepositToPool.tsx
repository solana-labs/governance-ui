import React, { useEffect } from 'react';
import * as yup from 'yup';
import useInstructionFormBuilder from '@hooks/useInstructionFormBuilder';
import { GovernedMultiTypeAccount } from '@utils/tokens';
import { LifinityDepositToPoolForm } from '@utils/uiTypes/proposalCreationTypes';
import depositToPool from '@tools/sdk/lifinity/depositToPool';
import Select from '@components/inputs/Select';
import SelectOptionList from '../../SelectOptionList';
import Input from '@components/inputs/Input';
import {
  calculateDepositAmounts,
  poolLabels,
} from '@tools/sdk/lifinity/lifinity';
import { debounce } from '@utils/debounce';

const SLIPPAGE_OPTIONS = [0.5, 1, 2];

const schema = yup.object().shape({
  governedAccount: yup
    .object()
    .nullable()
    .required('Governed account is required'),
  poolName: yup.string().required('Liquidity Pool is required'),
  uiAmountTokenA: yup
    .number()
    .moreThan(0, 'Token A Amount to deposit must be more than 0')
    .required('Token A Amount to deposit value is required'),
  uiAmountTokenB: yup
    .number()
    .moreThan(0, 'Token B Amount to deposit must be more than 0')
    .required('Token B Amount to deposit value is required'),
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
      uiAmountTokenA: 0,
      uiAmountTokenB: 0,
      slippage: 0.5,
    },
    schema,
    buildInstruction: async function ({
      connection,
      wallet,
      form,
      governedAccountPubkey,
    }) {
      // let's recalculate at the last moment to get the LP amount.
      const {
        maximumAmountTokenA,
        maximumAmountTokenB,
        amountLpToken,
      } = await calculateDepositAmounts({
        connection: connection,
        wallet,
        uiAmountTokenA: form.uiAmountTokenA!,
        slippage: form.slippage,
        poolName: form.poolName!,
      });

      return depositToPool({
        connection,
        wallet,
        userTransferAuthority: governedAccountPubkey,
        poolName: form.poolName!,
        maximumAmountTokenA,
        maximumAmountTokenB,
        amountLpToken,
        slippage: form.slippage,
      });
    },
  });

  useEffect(() => {
    debounce.debounceFcn(async () => {
      if (!form.uiAmountTokenA || !form.poolName || !wallet) return;
      const { maximumUiAmountTokenB } = await calculateDepositAmounts({
        connection: connection.current,
        wallet,
        uiAmountTokenA: form.uiAmountTokenA,
        slippage: form.slippage,
        poolName: form.poolName,
      });

      handleSetForm({
        value: maximumUiAmountTokenB,
        propertyName: 'uiAmountTokenB',
      });
    });
  }, [form.uiAmountTokenA, form.slippage]);

  // Hardcoded gate used to be clear about what cluster is supported for now
  if (connection.cluster !== 'mainnet') {
    return <>This instruction does not support {connection.cluster}</>;
  }

  return (
    <>
      <Select
        label="Lifinity Liquidity Pool"
        value={form.poolName}
        placeholder="Please select..."
        onChange={(value) => handleSetForm({ value, propertyName: 'poolName' })}
        error={formErrors['poolName']}
      >
        <SelectOptionList list={poolLabels} />
      </Select>

      {form.poolName && (
        <>
          <Input
            label="Amount of Token A to deposit"
            value={form.uiAmountTokenA}
            type="number"
            min="0"
            onChange={(evt) =>
              handleSetForm({
                value: evt.target.value,
                propertyName: 'uiAmountTokenA',
              })
            }
            error={formErrors['uiAmountTokenA']}
          />

          <Input
            label="Maximum Amount of Token B to deposit"
            value={form.uiAmountTokenB}
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
