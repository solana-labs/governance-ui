import { nu64, struct, u8 } from 'buffer-layout';
import { BN } from '@project-serum/anchor';
import { AccountMetaData } from '@solana/spl-governance';
import { Connection } from '@solana/web3.js';
import {
  createLabel,
  fetchVoltList,
  FRIKTION_VOLT_PROGRAM,
} from '@tools/sdk/friktion/friktion';
import { nativeAmountToFormattedUiAmount } from '@tools/sdk/units';

export const FRIKTION_PROGRAM_INSTRUCTIONS = {
  [FRIKTION_VOLT_PROGRAM]: {
    138: {
      name: 'Friktion - Deposit With Claim',
      accounts: [
        'authority',
        'daoAuthority',
        'solTransferAuthority',
        'authorityCheck',
        'vaultMint',
        'voltVault',
        'vaultAuthority',
        'extraVoltData',
        'depositPool',
        'writerTokenPool',
        'vaultTokenDestination',
        'underlyingTokenSource',
        'roundInfo',
        'roundUnderlyingTokens',
        'pendingDepositInfo',
        'pendingDepositRoundInfo',
        'pendingDepositRoundVoltTokens',
        'pendingDepositRoundUnderlyingTokens',
        'epochInfo',
        'systemProgram',
        'tokenProgram',
      ],
      getDataUI: async (
        _connection: Connection,
        data: Uint8Array,
        accounts: AccountMetaData[],
      ) => {
        const dataLayout = struct([
          u8('instruction'),
          u8('SIGHASH_1'),
          u8('SIGHASH_2'),
          u8('SIGHASH_3'),
          u8('SIGHASH_4'),
          u8('SIGHASH_5'),
          u8('SIGHASH_6'),
          u8('SIGHASH_7'),
          nu64('depositAmount'),
          u8('doTransfer'),
        ]);

        const { depositAmount } = dataLayout.decode(Buffer.from(data)) as any;
        const vaultId = accounts[5].pubkey;
        const volt = (await fetchVoltList()).find(
          (v) => v.voltVaultId === vaultId.toBase58(),
        );
        if (!volt) {
          console.warn('volt not found with vaultId ', vaultId);
          return;
        }

        return (
          <>
            <p>{`Volt: ${createLabel(
              volt.voltType,
              volt.depositTokenSymbol,
              volt.underlyingTokenSymbol,
            )}`}</p>
            <p>{`Deposit Token: ${volt.depositTokenSymbol}`}</p>
            <p>{`Underlying Token: ${volt.underlyingTokenSymbol}`}</p>
            <p>{`Amount to deposit: ${nativeAmountToFormattedUiAmount(
              new BN(depositAmount),
              volt.shareTokenDecimals,
            )} ${volt.depositTokenSymbol}`}</p>
          </>
        );
      },
    },
    239: {
      name: 'Friktion - Withdraw With Claim',
      accounts: [
        'authority',
        'daoAuthority',
        'authorityCheck',
        'vaultMint',
        'voltVault',
        'vaultAuthority',
        'extraVoltData',
        'depositPool',
        'underlyingTokenDestination',
        'vaultTokenSource',
        'roundInfo',
        'roundUnderlyingTokens',
        'pendingWithdrawalInfo',
        'pendingWithdrawalRoundInfo',
        'pendingWithdrawalRoundUnderlyingTokensForPws',
        'epochInfo',
        'feeAcct',
        'systemProgram',
        'tokenProgram',
        'rent',
      ],
      getDataUI: async (
        _connection: Connection,
        data: Uint8Array,
        accounts: AccountMetaData[],
      ) => {
        const dataLayout = struct([
          u8('instruction'),
          u8('SIGHASH_1'),
          u8('SIGHASH_2'),
          u8('SIGHASH_3'),
          u8('SIGHASH_4'),
          u8('SIGHASH_5'),
          u8('SIGHASH_6'),
          u8('SIGHASH_7'),
          nu64('withdrawAmount'),
        ]);

        const { withdrawAmount } = dataLayout.decode(Buffer.from(data)) as any;
        const vaultId = accounts[4].pubkey;
        const volt = (await fetchVoltList()).find(
          (v) => v.voltVaultId === vaultId.toBase58(),
        );
        if (!volt) {
          console.warn('volt not found with vaultId ', vaultId);
          return;
        }

        return (
          <>
            <p>{`Volt: ${createLabel(
              volt.voltType,
              volt.depositTokenSymbol,
              volt.underlyingTokenSymbol,
            )}`}</p>
            <p>{`Withdraw Token: ${volt.depositTokenSymbol}`}</p>
            <p>{`Underlying Token: ${volt.underlyingTokenSymbol}`}</p>
            <p>{`Amount to Withdraw: ${nativeAmountToFormattedUiAmount(
              new BN(withdrawAmount),
              volt.shareTokenDecimals,
            )} ${volt.shareTokenSymbol}`}</p>
          </>
        );
      },
    },
  },
};
