import React, { useState } from 'react';
import * as yup from 'yup';
import { PublicKey } from '@solana/web3.js';
import Input from '@components/inputs/Input';
import Select from '@components/inputs/Select';
import useInstructionFormBuilder from '@hooks/useInstructionFormBuilder';
import saberPoolsConfiguration, {
  Pool,
} from '@tools/sdk/saberPools/configuration';
import { withdrawOne } from '@tools/sdk/saberPools/withdrawOne';
import { GovernedMultiTypeAccount } from '@utils/tokens';
import { SaberPoolsWithdrawOneForm } from '@utils/uiTypes/proposalCreationTypes';

import useWalletStore from 'stores/useWalletStore';
import { uiAmountToNativeBN } from '@tools/sdk/units';

const schema = yup.object().shape({
  governedAccount: yup
    .object()
    .nullable()
    .required('Governed account is required'),
  destinationAccount: yup.string().required('Destination Account is required'),
  baseTokenName: yup.string().required('Base Token Name is required'),
  uiPoolTokenAmount: yup
    .number()
    .moreThan(0, 'Pool Token Amount needs to be more than 0')
    .required('Pool Token Amount is required'),
  uiMinimumTokenAmount: yup
    .number()
    .moreThan(0, 'Minimum Token Amount needs to be more than 0')
    .required('Minimum Token Amount is required'),
});

const WithdrawOne = ({
  index,
  governedAccount,
}: {
  index: number;
  governedAccount?: GovernedMultiTypeAccount;
}) => {
  const connection = useWalletStore((s) => s.connection);
  const [pool, setPool] = useState<Pool | null>(null);

  const {
    form,
    handleSetForm,
    formErrors,
  } = useInstructionFormBuilder<SaberPoolsWithdrawOneForm>({
    index,
    initialFormValues: {
      governedAccount,
    },
    schema,
    buildInstruction: async function ({ form, governedAccountPubkey }) {
      if (!pool) throw new Error('Saber pool not found');
      return withdrawOne({
        authority: governedAccountPubkey,
        pool,
        destinationAccount: new PublicKey(form.destinationAccount!),
        baseTokenName: form.baseTokenName!,
        poolTokenAmount: uiAmountToNativeBN(
          form.uiMinimumTokenAmount!.toString(),
          pool.poolToken.decimals,
        ),
        minimumTokenAmount: uiAmountToNativeBN(
          form.uiMinimumTokenAmount!.toString(),
          form.baseTokenName === pool.tokenAccountA.name
            ? pool.tokenAccountA.decimals
            : pool.tokenAccountB.decimals,
        ),
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

      {pool && (
        <>
          <Select
            label="Token to Withdraw"
            value={form.baseTokenName}
            placeholder="Please select..."
            onChange={(value) => {
              handleSetForm({
                value,
                propertyName: 'baseTokenName',
              });
            }}
            error={formErrors['baseTokenName']}
          >
            <Select.Option value={pool.tokenAccountA.name}>
              {pool.tokenAccountA.name}
            </Select.Option>

            <Select.Option value={pool.tokenAccountB.name}>
              {pool.tokenAccountB.name}
            </Select.Option>
          </Select>

          <Input
            label={`${
              form.baseTokenName ? `${form.baseTokenName} ` : ''
            }Destination Account`}
            value={form.destinationAccount}
            type="string"
            onChange={(evt) =>
              handleSetForm({
                value: evt.target.value,
                propertyName: 'destinationAccount',
              })
            }
            error={formErrors['destinationAccount']}
          />

          <Input
            label={`${pool.poolToken.name} Amount To Withdraw`}
            value={form.uiPoolTokenAmount}
            type="number"
            min="0"
            onChange={(evt) =>
              handleSetForm({
                value: evt.target.value,
                propertyName: 'uiPoolTokenAmount',
              })
            }
            error={formErrors['uiPoolTokenAmount']}
          />

          <Input
            label={`Minimum ${
              form.baseTokenName ? `${form.baseTokenName} ` : ''
            }Amount To Withdraw`}
            value={form.uiMinimumTokenAmount}
            type="number"
            min="0"
            onChange={(evt) =>
              handleSetForm({
                value: evt.target.value,
                propertyName: 'uiMinimumTokenAmount',
              })
            }
            error={formErrors['uiMinimumTokenAmount']}
          />
        </>
      )}
    </>
  );
};

export default WithdrawOne;
