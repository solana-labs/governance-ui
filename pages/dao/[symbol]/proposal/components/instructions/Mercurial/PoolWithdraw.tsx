import React, { useEffect, useState } from 'react';
import * as yup from 'yup';
import Input from '@components/inputs/Input';
import Select from '@components/inputs/Select';
import useInstructionFormBuilder from '@hooks/useInstructionFormBuilder';
import { GovernedMultiTypeAccount } from '@utils/tokens';
import { MercurialPoolWithdrawForm } from '@utils/uiTypes/proposalCreationTypes';
import useWalletStore from 'stores/useWalletStore';
import mercurialConfiguration, {
  PoolDescription,
} from '@tools/sdk/mercurial/configuration';
import AmmImpl from '@mercurial-finance/dynamic-amm-sdk';
import { PublicKey } from '@solana/web3.js';
import withdraw from '@tools/sdk/mercurial/poolWithdraw';
import { findATAAddrSync } from '@utils/ataTools';

const schema = yup.object().shape({
  governedAccount: yup
    .object()
    .nullable()
    .required('Governed account is required'),
  uiLpTokenAmount: yup.number().required('Amount for LP Token is required'),
  slippage: yup.number().required('Slippage is required'),
});

const Withdraw = ({
  index,
  governedAccount,
}: {
  index: number;
  governedAccount?: GovernedMultiTypeAccount;
}) => {
  const connection = useWalletStore((s) => s.connection);
  const [ammPool, setAmmPool] = useState<AmmImpl | null>(null);

  const [authorityLpATA, setAuthorityLpATA] = useState<null | {
    account: PublicKey;
    uiBalance: string;
  }>(null);

  const {
    form,
    handleSetForm,
    formErrors,
    governedAccountPubkey,
  } = useInstructionFormBuilder<MercurialPoolWithdrawForm>({
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

      return withdraw({
        connection: connection.current,
        authority: governedAccountPubkey,
        uiLpTokenAmount: form.uiLpTokenAmount!,
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
      setAuthorityLpATA(null);
      return;
    }

    (async () => {
      const [ata] = findATAAddrSync(
        governedAccountPubkey,
        ammPool.poolState.lpMint,
      );

      const amount = await connection.current.getTokenAccountBalance(ata);

      setAuthorityLpATA({
        account: ata,
        uiBalance: amount.value.uiAmountString ?? '',
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
            label="LP Token Amount"
            value={form.uiLpTokenAmount}
            type="number"
            min="0"
            onChange={(evt) =>
              handleSetForm({
                value: evt.target.value,
                propertyName: 'uiLpTokenAmount',
              })
            }
            error={formErrors['uiLpTokenAmount']}
          />

          {authorityLpATA ? (
            <div className="text-xs text-fgd-3 mt-0 flex flex-col">
              <span>ATA: {authorityLpATA.account.toBase58() ?? '-'}</span>

              <span
                className="hover:text-white cursor-pointer"
                onClick={() =>
                  handleSetForm({
                    value: authorityLpATA.uiBalance,
                    propertyName: 'uiLpTokenAmount',
                  })
                }
              >
                max: {authorityLpATA.uiBalance}
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
        </>
      )}
    </>
  );
};

export default Withdraw;
