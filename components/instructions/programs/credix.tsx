import { struct, u8, nu64 } from 'buffer-layout';
import { AccountMetaData } from '@solana/spl-governance';
import { Connection } from '@solana/web3.js';
import { CredixConfiguration } from '@tools/sdk/credix/configuration';
import { ANCHOR_DISCRIMINATOR_LAYOUT } from '@utils/helpers';
import { nativeBNToUiAmount } from '@tools/sdk/units';
import { USDC_DECIMALS } from '@uxd-protocol/uxd-client';
import { BN } from '@project-serum/anchor';

export const CREDIX_PROGRAM_INSTRUCTIONS = {
  [CredixConfiguration.credixProgramId.toBase58()]: {
    [CredixConfiguration.instructionsCode.deposit]: {
      name: 'Credix - Deposit USDC',
      accounts: [
        'Investor',
        'Gateway Token',
        'Global Market State',
        'Signing Authority',
        'Investor Token Account',
        'Liquidity Pool Token Account',
        'LP Token Mint',
        'Investor Lp Token Account',
        'Credix Pass',
        'Base Token Mint',
        'Associated Token Program',
        'Rent',
        'Token Program',
        'System Program',
      ],
      getDataUI: async (
        _connection: Connection,
        data: Uint8Array,
        _accounts: AccountMetaData[],
      ) => {
        const dataLayout = struct([
          u8('instruction'),
          ...ANCHOR_DISCRIMINATOR_LAYOUT,
          nu64('amount'),
        ]);

        const { amount } = dataLayout.decode(Buffer.from(data)) as any;

        const uiAmount = nativeBNToUiAmount(new BN(amount), USDC_DECIMALS);

        return <p>{`USDC Amount: ${uiAmount.toString()}`}</p>;
      },
    },
    [CredixConfiguration.instructionsCode.withdraw]: {
      name: 'Credix - Withdraw USDC',
      accounts: [
        'Investor',
        'Gateway Token',
        'Global Market State',
        'Signing Authority',
        'Investor Lp Token Account',
        'Investor Token Account',
        'Liquidity Pool Token Account',
        'Treasury Pool Token Account',
        'LP TokenMint',
        'Credix Pass',
        'Base Token Mint',
        'Associated Token Program',
        'Token Program',
      ],
      getDataUI: async (
        _connection: Connection,
        data: Uint8Array,
        _accounts: AccountMetaData[],
      ) => {
        const dataLayout = struct([
          u8('instruction'),
          ...ANCHOR_DISCRIMINATOR_LAYOUT,
          nu64('baseWithdrawalAmount'),
        ]);

        const { baseWithdrawalAmount } = dataLayout.decode(
          Buffer.from(data),
        ) as any;

        const uiBaseWithdrawalAmount = nativeBNToUiAmount(
          new BN(baseWithdrawalAmount),
          USDC_DECIMALS,
        );

        return (
          <p>{`Base USDC Withdrawal Amount: ${uiBaseWithdrawalAmount.toString()}`}</p>
        );
      },
    },
  },
};
