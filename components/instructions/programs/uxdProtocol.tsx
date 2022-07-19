import { Connection } from '@solana/web3.js';
import { struct, u8, nu64 } from 'buffer-layout';
import { AccountMetaData } from '@solana/spl-governance';
import { bool, u128, u64 } from '@project-serum/borsh';
import { INSURANCE_MINTS } from '@tools/sdk/uxdProtocol/uxdClient';
import { UXD_DECIMALS } from '@uxd-protocol/uxd-client';
import { nativeAmountToFormattedUiAmount } from '@tools/sdk/units';
import { BN } from '@project-serum/anchor';
import { tryGetTokenMint } from '@utils/tokens';
import { ANCHOR_DISCRIMINATOR_LAYOUT } from '@utils/helpers';

export const UXD_PROGRAM_INSTRUCTIONS = {
  UXD8m9cvwk4RcSxnX2HZ9VudQCEeDH6fRnB4CAP57Dr: {
    216: {
      name: 'UXD - Set Mango Depository Quote Mint and Redeem Soft Cap',
      accounts: ['Authority', 'Controller'],
      getDataUI: (
        _connection: Connection,
        data: Uint8Array,
        _accounts: AccountMetaData[],
      ) => {
        const dataLayout = struct([
          u8('instruction'),
          ...ANCHOR_DISCRIMINATOR_LAYOUT,
          nu64('quoteMintAndRedeemSoftCap'),
        ]);

        const { quoteMintAndRedeemSoftCap } = dataLayout.decode(
          Buffer.from(data),
        ) as any;

        return (
          <>
            <p>{`native quote mint and redeem soft cap: ${quoteMintAndRedeemSoftCap.toLocaleString()}`}</p>
          </>
        );
      },
    },
    136: {
      name: 'UXD - Disable Depository Regular Minting',
      accounts: ['Authority', 'Controller', 'Depository'],
      getDataUI: (
        _connection: Connection,
        data: Uint8Array,
        _accounts: AccountMetaData[],
      ) => {
        const dataLayout = struct([
          u8('instruction'),
          ...ANCHOR_DISCRIMINATOR_LAYOUT,
          bool('disable'),
        ]);

        const { disable } = dataLayout.decode(Buffer.from(data)) as any;

        return (
          <>
            <p>{`disable: ${disable}`}</p>
          </>
        );
      },
    },
    174: {
      name: 'UXD - Set Mango Depository Quote Mint and Redeem Fee',
      accounts: ['Authority', 'Controller', 'Depository'],
      getDataUI: (
        _connection: Connection,
        data: Uint8Array,
        _accounts: AccountMetaData[],
      ) => {
        const dataLayout = struct([
          u8('instruction'),
          ...ANCHOR_DISCRIMINATOR_LAYOUT,
          u8('quoteFee'),
        ]);

        const { quoteFee } = dataLayout.decode(Buffer.from(data)) as any;

        return (
          <>
            <p>{`quote Fee: ${quoteFee} bps`}</p>
          </>
        );
      },
    },
    137: {
      name: 'UXD - Initialize Controller',
      accounts: [
        'Authority',
        'Payer',
        'Controller',
        'Redeemable Mint',
        'System Program',
        'Token Program',
        'Rent',
      ],
      getDataUI: (
        _connection: Connection,
        data: Uint8Array,
        _accounts: AccountMetaData[],
      ) => {
        const dataLayout = struct([
          u8('instruction'),
          ...ANCHOR_DISCRIMINATOR_LAYOUT,
          u8('bump'),
          u8('redeemableBump'),
          u8('redeemableMintDecimals'),
        ]);

        const args = dataLayout.decode(Buffer.from(data)) as any;

        return (
          <>
            <p>{`bump: ${args.bump}`}</p>
            <p>{`redeemable bump: ${args.redeemableBump}`}</p>
            <p>{`redeemable mint decimals: ${args.redeemableMintDecimals.toString()}`}</p>
          </>
        );
      },
    },
    45: {
      name: 'UXD - Set Redeemable Global Supply Cap',
      accounts: ['Authority', 'Controller'],
      getDataUI: (
        _connection: Connection,
        data: Uint8Array,
        _accounts: AccountMetaData[],
      ) => {
        const dataLayout = struct([
          u8('instruction'),
          ...ANCHOR_DISCRIMINATOR_LAYOUT,
          u128('redeemableGlobalSupplyCap'),
        ]);

        const args = dataLayout.decode(Buffer.from(data)) as any;

        return (
          <>
            <p>{`Redeemable Global Supply Cap: ${nativeAmountToFormattedUiAmount(
              new BN(args.redeemableGlobalSupplyCap.toString()),
              UXD_DECIMALS,
            )}`}</p>
          </>
        );
      },
    },
    213: {
      name: 'UXD - Set Mango Depositories Redeemable Supply Soft Cap',
      accounts: ['Authority', 'Controller'],
      getDataUI: (
        _connection: Connection,
        data: Uint8Array,
        _accounts: AccountMetaData[],
      ) => {
        const dataLayout = struct([
          u8('instruction'),
          ...ANCHOR_DISCRIMINATOR_LAYOUT,
          u128('softCap'),
        ]);
        const args = dataLayout.decode(Buffer.from(data)) as any;

        return (
          <>
            <p>{`Redeemable Supply Soft Cap: ${nativeAmountToFormattedUiAmount(
              new BN(args.softCap.toString()),
              UXD_DECIMALS,
            )}`}</p>
          </>
        );
      },
    },
    133: {
      name: 'UXD - Register Mango Depository',
      accounts: [
        'Authority',
        'Payer',
        'Controller',
        'Depository',
        'Collateral Mint', // BTC/ WSOL.....
        'Insurance Mint', // USDC
        'Depository Collateral Passthrough Account',
        'Depository Insurance Passthrough Account',
        'Depository Mango Account',
        'Mango Group',
        'Rent',
        'System Program',
        'Token Program',
        'Mango Program',
      ],
      getDataUI: (
        _connection: Connection,
        data: Uint8Array,
        _accounts: AccountMetaData[],
      ) => {
        const dataLayout = struct([
          u8('instruction'),
          ...ANCHOR_DISCRIMINATOR_LAYOUT,
          u8('bump'),
          u8('collateralPassthroughBump'),
          u8('insurancePassthroughBump'),
          u8('mangoAccountBump'),
        ]);
        const args = dataLayout.decode(Buffer.from(data)) as any;

        return (
          <>
            <p>{`bump: ${args.bump.toString()}`}</p>
            <p>{`collateralPassthroughBump: ${args.collateralPassthroughBump.toString()}`}</p>
            <p>{`insurancePassthroughBump: ${args.insurancePassthroughBump.toString()}`}</p>
            <p>{`mangoAccountBump: ${args.mangoAccountBump.toString()}`}</p>
          </>
        );
      },
    },
    198: {
      name: 'UXD - Deposit Insurance To Mango Depository',
      accounts: [
        'Authority',
        'Controller',
        'Depository',
        'Insurance Mint',
        'Authority Insurance',
        'Depository Insurance Passthrough Account',
        'Depository Mango Account',
        // mango accounts for CPI
        'Mango Group',
        'Mango Cache',
        'Mango Root Bank',
        'Mango Node Bank',
        'Mango Vault',
        //
        'Token Program',
        'Mango Program',
      ],
      getDataUI: async (
        _connection: Connection,
        data: Uint8Array,
        _accounts: AccountMetaData[],
      ) => {
        const dataLayout = struct([
          u8('instruction'),
          ...ANCHOR_DISCRIMINATOR_LAYOUT,
          u64('insuranceAmount'),
        ]);

        const args = dataLayout.decode(Buffer.from(data)) as any;

        return (
          <>
            <p>{`Insurance Amount to deposit: ${nativeAmountToFormattedUiAmount(
              new BN(args.insuranceAmount.toString()),
              INSURANCE_MINTS.mainnet.USDC.decimals,
            )}`}</p>
          </>
        );
      },
    },
    227: {
      name: 'UXD - Withdraw Insurance From Mango Depository',
      accounts: [
        'Authority',
        'Controller',
        'Depository',
        'Collateral Mint',
        'Quote Mint',
        'Authority Quote',
        'Depository Mango Account',
        'Mango Group',
        'Mango Cache',
        'Mango Signer',
        'Mango Root Bank',
        'Mango Node Bank',
        'Mango Vault',
        'System Program',
        'Token Program',
        'Mango Program',
      ],
      getDataUI: async (
        connection: Connection,
        data: Uint8Array,
        accounts: AccountMetaData[],
      ) => {
        const dataLayout = struct([
          u8('instruction'),
          ...ANCHOR_DISCRIMINATOR_LAYOUT,
          nu64('insuranceAmount'),
        ]);

        const collateralMint = accounts[3].pubkey;

        const args = dataLayout.decode(Buffer.from(data)) as any;

        const mintInfo = await tryGetTokenMint(connection, collateralMint);

        if (!mintInfo) {
          return (
            <>
              <span>Native amount</span>
              <span className="ml-2">
                {Number(args.insuranceAmount).toLocaleString()}
              </span>
            </>
          );
        }

        const uiInsuranceAmount = nativeAmountToFormattedUiAmount(
          new BN(args.insuranceAmount.toString()),
          mintInfo.account.decimals,
        );

        return (
          <>
            <span>UI amount</span>
            <span className="ml-2">{uiInsuranceAmount}</span>
          </>
        );
      },
    },
  },
};
