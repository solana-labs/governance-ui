import React, { useEffect, useState } from 'react';
import * as yup from 'yup';
import { PublicKey } from '@solana/web3.js';
import Input from '@components/inputs/Input';
import Select from '@components/inputs/Select';
import useInstructionFormBuilder from '@hooks/useInstructionFormBuilder';
import saberPoolsConfiguration, {
  Pool,
} from '@tools/sdk/saberPools/configuration';
import { deposit } from '@tools/sdk/saberPools/deposit';
import { GovernedMultiTypeAccount } from '@utils/tokens';
import { SaberPoolsDepositForm } from '@utils/uiTypes/proposalCreationTypes';

import useWalletStore from 'stores/useWalletStore';
import { uiAmountToNativeBN } from '@tools/sdk/units';
import { findATAAddrSync } from '@utils/ataTools';

const schema = yup.object().shape({
  governedAccount: yup
    .object()
    .nullable()
    .required('Governed account is required'),
  uiTokenAmountA: yup.number().required('Amount for Token A is required'),
  uiTokenAmountB: yup.number().required('Amount for Token B is required'),
  uiMinimumPoolTokenAmount: yup
    .number()
    .moreThan(0, 'Minimum Pool Token Amount should be more than 0')
    .required('Minimum Pool Token Amount is required'),
});

const Deposit = ({
  index,
  governedAccount,
}: {
  index: number;
  governedAccount?: GovernedMultiTypeAccount;
}) => {
  const connection = useWalletStore((s) => s.connection);
  const [pool, setPool] = useState<Pool | null>(null);
  const [
    associatedTokenAccounts,
    setAssociatedTokenAccounts,
  ] = useState<null | {
    A: PublicKey;
    B: PublicKey;
  }>(null);

  const {
    form,
    handleSetForm,
    formErrors,
    governedAccountPubkey,
  } = useInstructionFormBuilder<SaberPoolsDepositForm>({
    index,
    initialFormValues: {
      governedAccount,
    },
    schema,
    buildInstruction: async function ({ form, governedAccountPubkey }) {
      if (!pool) {
        throw new Error('Saber Pool not found');
      }

      if (!associatedTokenAccounts) {
        throw new Error('Associated token accounts not found');
      }

      return deposit({
        authority: governedAccountPubkey,
        pool,
        sourceA: associatedTokenAccounts.A,
        sourceB: associatedTokenAccounts.B,

        tokenAmountA: uiAmountToNativeBN(
          form.uiTokenAmountA!.toString(),
          pool.tokenAccountA.decimals,
        ),
        tokenAmountB: uiAmountToNativeBN(
          form.uiTokenAmountB!.toString(),
          pool.tokenAccountB.decimals,
        ),
        minimumPoolTokenAmount: uiAmountToNativeBN(
          form.uiMinimumPoolTokenAmount!.toString(),
          pool.poolToken.decimals,
        ),
      });
    },
  });

  useEffect(() => {
    if (!governedAccountPubkey) {
      return;
    }

    if (!pool) {
      setAssociatedTokenAccounts(null);
      return;
    }

    console.log('governedAccountPubkey', governedAccountPubkey.toBase58());
    console.log(
      'pool.tokenAccountA.mint',
      pool.tokenAccountA.name,
      pool.tokenAccountA.tokenMint.toBase58(),
    );
    console.log(
      'pool.tokenAccountB.mint',
      pool.tokenAccountB.name,
      pool.tokenAccountB.tokenMint.toBase58(),
    );

    setAssociatedTokenAccounts({
      A: findATAAddrSync(
        governedAccountPubkey,
        pool.tokenAccountA.tokenMint,
      )[0],
      B: findATAAddrSync(
        governedAccountPubkey,
        pool.tokenAccountB.tokenMint,
      )[0],
    });
  }, [pool, governedAccountPubkey]);

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
          <div className="flex flex-col">
            <span>{pool.tokenAccountA.name} ATA</span>
            <span className="text-fgd-3 text-sm">
              {associatedTokenAccounts?.A.toBase58() ?? '-'}
            </span>
          </div>

          <div className="flex flex-col">
            <span>{pool.tokenAccountB.name} ATA</span>
            <span className="text-fgd-3 text-sm">
              {associatedTokenAccounts?.B.toBase58() ?? '-'}
            </span>
          </div>

          <Input
            label={`${pool.tokenAccountA.name} Amount`}
            value={form.uiTokenAmountA}
            type="number"
            min="0"
            onChange={(evt) =>
              handleSetForm({
                value: evt.target.value,
                propertyName: 'uiTokenAmountA',
              })
            }
            error={formErrors['uiTokenAmountA']}
          />

          <Input
            label={`${pool.tokenAccountB.name} Amount`}
            value={form.uiTokenAmountB}
            type="number"
            min="0"
            onChange={(evt) =>
              handleSetForm({
                value: evt.target.value,
                propertyName: 'uiTokenAmountB',
              })
            }
            error={formErrors['uiTokenAmountB']}
          />

          <Input
            label={`${pool.poolToken.name} Minimum Amount`}
            value={form.uiMinimumPoolTokenAmount}
            type="number"
            min="0"
            onChange={(evt) =>
              handleSetForm({
                value: evt.target.value,
                propertyName: 'uiMinimumPoolTokenAmount',
              })
            }
            error={formErrors['uiMinimumPoolTokenAmount']}
          />
        </>
      )}
    </>
  );
};

export default Deposit;
