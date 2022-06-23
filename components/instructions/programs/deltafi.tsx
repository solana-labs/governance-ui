import { struct, u8, nu64 } from 'buffer-layout';
import { AccountMetaData } from '@solana/spl-governance';
import { Connection } from '@solana/web3.js';
import { DeltafiDexV2 } from '@tools/sdk/deltafi/configuration';
import { tryGetTokenMint } from '@utils/tokens';
import { BN } from '@blockworks-foundation/mango-client';
import { nativeAmountToFormattedUiAmount } from '@tools/sdk/units';

export const DELTAFI_PROGRAM_INSTRUCTIONS = {
  [DeltafiDexV2.DeltafiProgramId.toBase58()]: {
    [DeltafiDexV2.instructionsCode.CreateLiquidityProviderV2]: {
      name: 'Deltafi - Create Liquidity Provider V2',
      accounts: [
        'marketConfig',
        'swapInfo',
        'liquidityProvider',
        'owner',
        'payer',
        'systemProgram',
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
          u8('bump'),
        ]);

        const { bump } = dataLayout.decode(Buffer.from(data)) as any;

        const marketConfig = accounts[0].pubkey;
        const liquidityProvider = accounts[2].pubkey;
        const owner = accounts[3].pubkey;
        const payer = accounts[4].pubkey;

        return (
          <>
            <p>{`Bump: ${bump.toString()}`}</p>
            <p>{`Market Config: ${marketConfig.toBase58()}`}</p>
            <p>{`Liquidity Provider: ${liquidityProvider.toBase58()}`}</p>
            <p>{`Owner: ${owner.toBase58()}`}</p>
            <p>{`Payer: ${payer.toBase58()}`}</p>
          </>
        );
      },
    },

    [DeltafiDexV2.instructionsCode.WithdrawFromStableSwap]: {
      name: 'Deltafi - Withdraw from Stable Swap',
      accounts: [
        'swapInfo',
        'userTokenBase',
        'userTokenQuote',
        'liquidityProvider',
        'tokenBase',
        'tokenQuote',
        'pythPriceBase',
        'pythPriceQuote',
        'adminFeeTokenBase',
        'adminFeeTokenQuote',
        'userAuthority',
        'tokenProgram',
      ],
      getDataUI: async (
        connection: Connection,
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
            <p>{`UI Base Share: ${uiBaseShare.toLocaleString()}`}</p>
            <p>{`UI Quote Share: ${uiQuoteShare.toLocaleString()}`}</p>
            <p>{`UI Min Base Amount: ${uiMinBaseAmount.toLocaleString()}`}</p>
            <p>{`UI Min Quote Amount: ${uiMinQuoteAmount.toLocaleString()}`}</p>
          </>
        );
      },
    },

    [DeltafiDexV2.instructionsCode.DepositToStableSwap]: {
      name: 'Deltafi - Deposit from Stable Swap',
      accounts: [
        'swapInfo',
        'userTokenBase',
        'userTokenQuote',
        'liquidityProvider',
        'tokenBase',
        'tokenQuote',
        'pythPriceBase',
        'pythPriceQuote',
        'adminFeeTokenBase',
        'adminFeeTokenQuote',
        'userAuthority',
        'tokenProgram',
      ],
      getDataUI: async (
        connection: Connection,
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

        console.log('BLABLA', {
          baseAmount,
          quoteAmount,
          minBaseShare,
          minQuoteShare,
          tokenBase: tokenBase.toBase58(),
          tokenQuote: tokenQuote.toBase58(),
          baseDecimals: baseMint.account.decimals,
          quoteDecimals: quoteMint.account.decimals,
        });

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
            <p>{`UI Base Amount: ${uiBaseAmount.toLocaleString()}`}</p>
            <p>{`UI Quote Amount: ${uiQuoteAmount.toLocaleString()}`}</p>
            <p>{`UI Min Base Share: ${uiMinBaseShare.toLocaleString()}`}</p>
            <p>{`UI Min Quote Share: ${uiMinQuoteShare.toLocaleString()}`}</p>
          </>
        );
      },
    },
  },
};
