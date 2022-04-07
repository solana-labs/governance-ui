import { Connection } from '@solana/web3.js';
import { struct, u8, u48 } from 'buffer-layout';
import { AccountMetaData } from '@solana/spl-governance';
import { u128, u64 } from '@project-serum/borsh';
import { INSURANCE_MINTS } from '@tools/sdk/uxdProtocol/uxdClient';
import { UXD_DECIMALS } from '@uxdprotocol/uxd-client';
import { nativeAmountToFormattedUiAmount } from '@tools/sdk/units';
import { BN } from '@project-serum/anchor';

export const UXD_PROGRAM_INSTRUCTIONS = {
  UXD8m9cvwk4RcSxnX2HZ9VudQCEeDH6fRnB4CAP57Dr: {
    137: {
      name: 'UXD - Initialize Controller',
      accounts: [
        'authority',
        'payer',
        'controller',
        'redeemableMint',
        'systemProgram',
        'tokenProgram',
        'rent',
      ],
      getDataUI: (
        _connection: Connection,
        data: Uint8Array,
        _accounts: AccountMetaData[],
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
          u8('redeemableBump'),
          u8('redeemableMintDecimals'),
        ]);

        const args = dataLayout.decode(Buffer.from(data)) as any;
        console.log('args', args);
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
      accounts: ['authority', 'controller'],
      getDataUI: (
        _connection: Connection,
        data: Uint8Array,
        _accounts: AccountMetaData[],
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
      accounts: ['authority', 'controller'],
      getDataUI: (
        _connection: Connection,
        data: Uint8Array,
        _accounts: AccountMetaData[],
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
          u128('softCap'),
        ]);
        const args = dataLayout.decode(Buffer.from(data)) as any;
        console.log('args', args);
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
        'authority',
        'payer',
        'controller',
        'depository',
        'collateralMint', // BTC/ WSOL.....
        'insuranceMint', // USDC
        'depositoryCollateralPassthroughAccount',
        'depositoryInsurancePassthroughAccount',
        'depositoryMangoAccount',
        'mangoGroup',
        'rent',
        'systemProgram',
        'tokenProgram',
        'mangoProgram',
      ],
      getDataUI: (
        _connection: Connection,
        data: Uint8Array,
        _accounts: AccountMetaData[],
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
          u8('collateralPassthroughBump'),
          u8('insurancePassthroughBump'),
          u8('mangoAccountBump'),
        ]);
        const args = dataLayout.decode(Buffer.from(data)) as any;
        console.log('args', args);
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
        'authority',
        'controller',
        'depository',
        'insuranceMint',
        'authorityInsurance',
        'depositoryInsurancePassthroughAccount',
        'depositoryMangoAccount',
        // mango accounts for CPI
        'mangoGroup',
        'mangoCache',
        'mangoRootBank',
        'mangoNodeBank',
        'mangoVault',
        //
        'tokenProgram',
        'mangoProgram',
      ],
      getDataUI: async (
        _connection: Connection,
        data: Uint8Array,
        _accounts: AccountMetaData[],
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
          u64('insuranceAmount'),
        ]);

        const args = dataLayout.decode(Buffer.from(data)) as any;
        console.log('args', args);
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
        'authority',
        'controller',
        'depository',
        'insuranceMint',
        'authorityInsurance',
        'depositoryInsurancePassthroughAccount',
        'depositoryMangoAccount',
        // mango accounts for CPI
        'mangoGroup',
        'mangoCache',
        'mangoSigner',
        'mangoRootBank',
        'mangoNodeBank',
        'mangoVault',
        //
        'tokenProgram',
        'mangoProgram',
      ],
      getDataUI: (
        _connection: Connection,
        data: Uint8Array,
        _accounts: AccountMetaData[],
      ) => {
        const dataLayout = struct([u48('redeemable_global_supply_cap')]);

        const args = dataLayout.decode(Buffer.from(data)) as any;
        console.log('args', args);
        return (
          <>
            <p>{args}</p>
          </>
        );
      },
    },
  },
};
