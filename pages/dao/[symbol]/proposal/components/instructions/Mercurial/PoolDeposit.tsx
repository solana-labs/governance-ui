import React, { useEffect, useState } from 'react';
import * as yup from 'yup';
import Input from '@components/inputs/Input';
import Select from '@components/inputs/Select';
import useInstructionFormBuilder from '@hooks/useInstructionFormBuilder';
import { GovernedMultiTypeAccount } from '@utils/tokens';
import { MercurialPoolDepositForm } from '@utils/uiTypes/proposalCreationTypes';
import useWalletStore from 'stores/useWalletStore';
import mercurialConfiguration, {
  PoolDescription,
} from '@tools/sdk/mercurial/configuration';
import { getSplTokenNameByMint } from '@utils/splTokens';
import AmmImpl from '@mercurial-finance/dynamic-amm-sdk';
import { findMultipleATAAddSync } from '@uxd-protocol/uxd-client';
import { PublicKey } from '@solana/web3.js';
import deposit from '@tools/sdk/mercurial/poolDeposit';

const schema = yup.object().shape({
  governedAccount: yup
    .object()
    .nullable()
    .required('Governed account is required'),
  uiTokenAmountA: yup.number().required('Amount for Token A is required'),
  uiTokenAmountB: yup.number().required('Amount for Token B is required'),
  slippage: yup.number().required('Slippage is required'),
});

const Deposit = ({
  index,
  governedAccount,
}: {
  index: number;
  governedAccount?: GovernedMultiTypeAccount;
}) => {
  const connection = useWalletStore((s) => s.connection);
  const [ammPool, setAmmPool] = useState<AmmImpl | null>(null);

  const [
    associatedTokenAccounts,
    setAssociatedTokenAccounts,
  ] = useState<null | {
    A: {
      account: PublicKey;
      uiBalance: string;
    };
    B: {
      account: PublicKey;
      uiBalance: string;
    };
  }>(null);

  const {
    form,
    handleSetForm,
    formErrors,
    governedAccountPubkey,
  } = useInstructionFormBuilder<MercurialPoolDepositForm>({
    index,
    initialFormValues: {
      governedAccount,
    },
    shouldSplitIntoSeparateTxs: true,
    schema,
    buildInstruction: async function ({ form, governedAccountPubkey }) {
      if (!ammPool) {
        throw new Error('Mercurial Pool not found');
      }

      return deposit({
        connection: connection.current,
        authority: governedAccountPubkey,
        uiTokenAInAmount: form.uiTokenAmountA!,
        uiTokenBInAmount: form.uiTokenAmountB!,
        slippage: form.slippage!,
        ammPool,
      });
    },
  });

  useEffect(() => {
    (async () => {
      if (!governedAccountPubkey) {
        return;
      }

      if (!form.poolName) {
        setAmmPool(null);
        return;
      }

      const poolInfo: PoolDescription =
        mercurialConfiguration.pools[form.poolName];

      try {
        const ammPool = await mercurialConfiguration.loadAmmPool({
          connection: connection.current,
          pool: poolInfo.publicKey,
        });

        setAmmPool(ammPool);
      } catch (e) {
        console.log('Cannot load pool info', e);
      }
    })();
  }, [form.poolName, connection]);

  useEffect(() => {
    if (!ammPool || !ammPool.poolState || !governedAccountPubkey) {
      setAssociatedTokenAccounts(null);
      return;
    }

    (async () => {
      const [
        [sourceA],
        [sourceB],
      ] = findMultipleATAAddSync(governedAccountPubkey, [
        ammPool.poolState.tokenAMint,
        ammPool.poolState.tokenBMint,
      ]);

      const [amountA, amountB] = await Promise.all([
        connection.current.getTokenAccountBalance(sourceA),
        connection.current.getTokenAccountBalance(sourceB),
      ]);

      setAssociatedTokenAccounts({
        A: {
          account: sourceA,
          uiBalance: amountA.value.uiAmountString ?? '',
        },
        B: {
          account: sourceB,
          uiBalance: amountB.value.uiAmountString ?? '',
        },
      });
    })();
  }, [ammPool, governedAccountPubkey]);

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
        }}
        error={formErrors['poolName']}
      >
        {Object.keys(mercurialConfiguration.pools).map((name) => (
          <Select.Option key={name} value={name}>
            {name}
          </Select.Option>
        ))}
      </Select>

      {ammPool && ammPool.poolState && (
        <>
          <Input
            label={`${getSplTokenNameByMint(
              ammPool.poolState.tokenAMint,
            )} Amount`}
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

          {associatedTokenAccounts ? (
            <div className="text-xs text-fgd-3 mt-0 flex flex-col">
              <span>
                ATA: {associatedTokenAccounts.A.account.toBase58() ?? '-'}
              </span>

              <span
                className="hover:text-white cursor-pointer"
                onClick={() =>
                  handleSetForm({
                    value: associatedTokenAccounts.A.uiBalance,
                    propertyName: 'uiTokenAmountA',
                  })
                }
              >
                max: {associatedTokenAccounts.A.uiBalance}
              </span>
            </div>
          ) : null}

          <Input
            label={`${getSplTokenNameByMint(
              ammPool.poolState.tokenBMint,
            )} Amount`}
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

          {associatedTokenAccounts ? (
            <div className="text-xs text-fgd-3 mt-0 flex flex-col">
              <span>
                ATA: {associatedTokenAccounts.B.account.toBase58() ?? '-'}
              </span>

              <span
                className="hover:text-white cursor-pointer"
                onClick={() =>
                  handleSetForm({
                    value: associatedTokenAccounts.B.uiBalance,
                    propertyName: 'uiTokenAmountB',
                  })
                }
              >
                max: {associatedTokenAccounts.B.uiBalance}
              </span>
            </div>
          ) : null}

          <Input
            label="Slippage from 0 to 100, max 2 decimals"
            value={form.slippage}
            type="number"
            min="0"
            onChange={(evt) =>
              handleSetForm({
                value: evt.target.value,
                propertyName: 'slippage',
              })
            }
            error={formErrors['slippage']}
          />

          {ammPool && ammPool.poolState.lpMint ? (
            <div className="flex flex-col text-xs text-fgd-3">
              <span>Lp mint</span>
              <span>{ammPool.poolState.lpMint.toBase58()}</span>
            </div>
          ) : null}
        </>
      )}
    </>
  );
};

export default Deposit;
