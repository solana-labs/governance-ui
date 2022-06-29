import { struct, u8, nu64 } from 'buffer-layout';
import { AccountMetaData } from '@solana/spl-governance';
import { Connection } from '@solana/web3.js';
import { DeltafiDexV2 } from '@tools/sdk/deltafi/configuration';
import { tryGetTokenMint } from '@utils/tokens';
import { BN } from '@blockworks-foundation/mango-client';
import { nativeAmountToFormattedUiAmount } from '@tools/sdk/units';
import { ANCHOR_DISCRIMINATOR_LAYOUT } from '@utils/helpers';

export const DELTAFI_PROGRAM_INSTRUCTIONS = {
  [DeltafiDexV2.DeltafiProgramId.toBase58()]: {
    [DeltafiDexV2.instructionsCode.WithdrawFromFarm]: {
      name: 'Deltafi - Withdraw from Farm',
      accounts: [
        'Market Config',
        'Swap Info',
        'Farm Info',
        'Liquidity Provider',
        'Farm User',
        'Owner',
      ],
      getDataUI: async (
        _connection: Connection,
        data: Uint8Array,
        _accounts: AccountMetaData[],
      ) => {
        const dataLayout = struct([
          u8('instruction'),
          ...ANCHOR_DISCRIMINATOR_LAYOUT,
          nu64('baseAmount'),
          nu64('quoteAmount'),
        ]);

        const { baseAmount, quoteAmount } = dataLayout.decode(
          Buffer.from(data),
        ) as any;

        return (
          <>
            <p>{`Native Base Amount: ${baseAmount.toString()}`}</p>
            <p>{`Native Quote Amount: ${quoteAmount.toString()}`}</p>
          </>
        );
      },
    },
    [DeltafiDexV2.instructionsCode.DepositToFarm]: {
      name: 'Deltafi - Deposit to Farm',
      accounts: [
        'Market Config',
        'Swap Info',
        'Farm Info',
        'Liquidity Provider',
        'Farm User',
        'Owner',
      ],
      getDataUI: async (
        _connection: Connection,
        data: Uint8Array,
        _accounts: AccountMetaData[],
      ) => {
        const dataLayout = struct([
          u8('instruction'),
          ...ANCHOR_DISCRIMINATOR_LAYOUT,
          nu64('baseAmount'),
          nu64('quoteAmount'),
        ]);

        const { baseAmount, quoteAmount } = dataLayout.decode(
          Buffer.from(data),
        ) as any;

        return (
          <>
            <p>{`Native Base Amount: ${baseAmount.toString()}`}</p>
            <p>{`Native Quote Amount: ${quoteAmount.toString()}`}</p>
          </>
        );
      },
    },

    [DeltafiDexV2.instructionsCode.CreateLiquidityProviderV2]: {
      name: 'Deltafi - Create Liquidity Provider V2',
      accounts: [
        'Market Config',
        'Swap Info',
        'Liquidity Provider',
        'Owner',
        'Payer',
        'System Program',
        'Rent',
      ],
      getDataUI: async (
        _connection: Connection,
        data: Uint8Array,
        _accounts: AccountMetaData[],
      ) => {
        const dataLayout = struct([
          u8('instruction'),
          ...ANCHOR_DISCRIMINATOR_LAYOUT,
          u8('bump'),
        ]);

        const { bump } = dataLayout.decode(Buffer.from(data)) as any;

        return <p>{`Bump: ${bump.toString()}`}</p>;
      },
    },

    [DeltafiDexV2.instructionsCode.CreateFarmUser]: {
      name: 'Deltafi - Create Farm User V2',
      accounts: [
        'Market Config',
        'Farm Info',
        'Farm User',
        'Owner',
        'Payer',
        'System Program',
        'Rent',
      ],
      getDataUI: async (
        _connection: Connection,
        _data: Uint8Array,
        _accounts: AccountMetaData[],
      ) => {
        return null;
      },
    },

    [DeltafiDexV2.instructionsCode.CreateLiquidityProviderV2]: {
      name: 'Deltafi - Create Liquidity Provider V2',
      accounts: [
        'Market Config',
        'Swap Info',
        'Liquidity Provider',
        'Owner',
        'Payer',
        'System Program',
        'Rent',
      ],
      getDataUI: async (
        _connection: Connection,
        data: Uint8Array,
        _accounts: AccountMetaData[],
      ) => {
        const dataLayout = struct([
          u8('instruction'),
          ...ANCHOR_DISCRIMINATOR_LAYOUT,
          u8('bump'),
        ]);

        const { bump } = dataLayout.decode(Buffer.from(data)) as any;

        return <p>{`Bump: ${bump.toString()}`}</p>;
      },
    },

    [DeltafiDexV2.instructionsCode.WithdrawFromStableSwap]: {
      name: 'Deltafi - Withdraw from Stable Swap',
      accounts: [
        'Swap Info',
        'User Token Base',
        'User Token Quote',
        'Liquidity Provider',
        'Token Base',
        'Token Quote',
        'Pyth Price Base',
        'Pyth Price Quote',
        'Admin Fee Token Base',
        'Admin Fee Token Quote',
        'User Authority',
        'Token Program',
      ],
      getDataUI: async (
        connection: Connection,
        data: Uint8Array,
        accounts: AccountMetaData[],
      ) => {
        const dataLayout = struct([
          u8('instruction'),
          ...ANCHOR_DISCRIMINATOR_LAYOUT,
          nu64('baseShare'),
          nu64('quoteShare'),
          nu64('minBaseAmount'),
          nu64('minQuoteAmount'),
        ]);

        const {
          baseShare,
          quoteShare,
          minBaseAmount,
          minQuoteAmount,
        } = dataLayout.decode(Buffer.from(data)) as any;

        const tokenBase = accounts[4].pubkey;
        const tokenQuote = accounts[5].pubkey;

        const [baseMint, quoteMint] = await Promise.all([
          tryGetTokenMint(connection, tokenBase),
          tryGetTokenMint(connection, tokenQuote),
        ]);

        if (!baseMint || !quoteMint) {
          throw new Error('Mint not found');
        }

        const uiBaseShare = nativeAmountToFormattedUiAmount(
          new BN(baseShare),
          baseMint.account.decimals,
        );

        const uiQuoteShare = nativeAmountToFormattedUiAmount(
          new BN(quoteShare),
          quoteMint.account.decimals,
        );

        const uiMinBaseAmount = nativeAmountToFormattedUiAmount(
          new BN(minBaseAmount),
          baseMint.account.decimals,
        );

        const uiMinQuoteAmount = nativeAmountToFormattedUiAmount(
          new BN(minQuoteAmount),
          quoteMint.account.decimals,
        );

        return (
          <>
            <p>{`UI Base Share: ${uiBaseShare}`}</p>
            <p>{`UI Quote Share: ${uiQuoteShare}`}</p>
            <p>{`UI Min Base Amount: ${uiMinBaseAmount}`}</p>
            <p>{`UI Min Quote Amount: ${uiMinQuoteAmount}`}</p>
          </>
        );
      },
    },

    [DeltafiDexV2.instructionsCode.DepositToStableSwap]: {
      name: 'Deltafi - Deposit from Stable Swap',
      accounts: [
        'Swap Info',
        'User Token Base',
        'User Token Quote',
        'Liquidity Provider',
        'Token Base',
        'Token Quote',
        'Pyth Price Base',
        'Pyth Price Quote',
        'Admin Fee Token Base',
        'Admin Fee Token Quote',
        'User Authority',
        'Token Program',
      ],
      getDataUI: async (
        connection: Connection,
        data: Uint8Array,
        accounts: AccountMetaData[],
      ) => {
        const dataLayout = struct([
          u8('instruction'),
          ...ANCHOR_DISCRIMINATOR_LAYOUT,
          nu64('baseAmount'),
          nu64('quoteAmount'),
          nu64('minBaseShare'),
          nu64('minQuoteShare'),
        ]);

        const {
          baseAmount,
          quoteAmount,
          minBaseShare,
          minQuoteShare,
        } = dataLayout.decode(Buffer.from(data)) as any;

        const tokenBase = accounts[4].pubkey;
        const tokenQuote = accounts[5].pubkey;

        const [baseMint, quoteMint] = await Promise.all([
          tryGetTokenMint(connection, tokenBase),
          tryGetTokenMint(connection, tokenQuote),
        ]);

        if (!baseMint || !quoteMint) {
          throw new Error('Mint not found');
        }

        const uiBaseAmount = nativeAmountToFormattedUiAmount(
          new BN(baseAmount),
          baseMint.account.decimals,
        );

        const uiQuoteAmount = nativeAmountToFormattedUiAmount(
          new BN(quoteAmount),
          quoteMint.account.decimals,
        );

        const uiMinBaseShare = nativeAmountToFormattedUiAmount(
          new BN(minBaseShare),
          baseMint.account.decimals,
        );

        const uiMinQuoteShare = nativeAmountToFormattedUiAmount(
          new BN(minQuoteShare),
          quoteMint.account.decimals,
        );

        return (
          <>
            <p>{`UI Base Amount: ${uiBaseAmount}`}</p>
            <p>{`UI Quote Amount: ${uiQuoteAmount}`}</p>
            <p>{`UI Min Base Share: ${uiMinBaseShare}`}</p>
            <p>{`UI Min Quote Share: ${uiMinQuoteShare}`}</p>
          </>
        );
      },
    },
  },
};
