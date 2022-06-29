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
import { ANCHOR_DISCRIMINATOR_LAYOUT } from '@utils/helpers';

export const FRIKTION_PROGRAM_INSTRUCTIONS = {
  [FRIKTION_VOLT_PROGRAM]: {
    138: {
      name: 'Friktion - Deposit With Claim',
      accounts: [
        'Authority',
        'Dao Authority',
        'Sol Transfer Authority',
        'Authority Check',
        'Vault Mint',
        'Volt Vault',
        'Vault Authority',
        'Extra Volt Data',
        'Deposit Pool',
        'Writer Token Pool',
        'Vault Token Destination',
        'Underlying Token Source',
        'Round Info',
        'Round Underlying Tokens',
        'Pending Deposit Info',
        'Pending Deposit Round Info',
        'Pending Deposit Round Volt Tokens',
        'Pending Deposit Round Underlying Tokens',
        'Epoch Info',
        'System Program',
        'Token Program',
      ],
      getDataUI: async (
        _connection: Connection,
        data: Uint8Array,
        accounts: AccountMetaData[],
      ) => {
        const dataLayout = struct([
          u8('instruction'),
          ...ANCHOR_DISCRIMINATOR_LAYOUT,
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
        'Authority',
        'Dao Authority',
        'Authority Check',
        'Vault Mint',
        'Volt Vault',
        'Vault Authority',
        'Extra Volt Data',
        'Deposit Pool',
        'Underlying Token Destination',
        'Vault Token Source',
        'Round Info',
        'Round Underlying Tokens',
        'Pending Withdrawal Info',
        'Pending Withdrawal Round Info',
        'Pending Withdrawal Round Underlying Tokens For Pws',
        'Epoch Info',
        'Fee Acct',
        'System Program',
        'Token Program',
        'Rent',
      ],
      getDataUI: async (
        _connection: Connection,
        data: Uint8Array,
        accounts: AccountMetaData[],
      ) => {
        const dataLayout = struct([
          u8('instruction'),
          ...ANCHOR_DISCRIMINATOR_LAYOUT,
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
