import { Connection } from '@solana/web3.js';
import { struct, u8, nu64, Layout } from 'buffer-layout';
import { AccountMetaData } from '@solana/spl-governance';
import { bool, u128, u64 } from '@project-serum/borsh';
import { nativeToUi, UXD_DECIMALS } from '@uxd-protocol/uxd-client';
import { nativeAmountToFormattedUiAmount } from '@tools/sdk/units';
import { BN } from '@project-serum/anchor';
import { ANCHOR_DISCRIMINATOR_LAYOUT } from '@utils/helpers';
import { getSplTokenNameByMint } from '@utils/splTokens';

export const UXD_PROGRAM_INSTRUCTIONS = {
  UXD8m9cvwk4RcSxnX2HZ9VudQCEeDH6fRnB4CAP57Dr: {
    // HtBAjXoadvKg8KBAtcUL1BjgxM55itScsZYe9LHt3NiP: {
    122: {
      name: 'UXD - Edit Identity Depository',
      accounts: ['Authority', 'Controller', 'Depository'],
      getDataUI: (
        _connection: Connection,
        data: Uint8Array,
        _accounts: AccountMetaData[],
      ) => {
        let redeemableAmountUnderManagementCapOption = false;
        let mintingDisabledOption = false;

        // Check if options are used or not
        if (data[8] == 1) {
          redeemableAmountUnderManagementCapOption = true;
        }

        if (
          data[9 + (redeemableAmountUnderManagementCapOption ? 16 : 0)] == 1
        ) {
          mintingDisabledOption = true;
        }

        const layout: Layout<any>[] = [
          u8('instruction'),
          ...ANCHOR_DISCRIMINATOR_LAYOUT,
        ];

        layout.push(u8('redeemableAmountUnderManagementCapOption'));
        if (redeemableAmountUnderManagementCapOption) {
          layout.push(u128('redeemableAmountUnderManagementCap'));
        }

        layout.push(u8('mintingDisabledOption'));
        if (mintingDisabledOption) {
          layout.push(u8('mintingDisabled'));
        }

        const dataLayout = struct(layout);

        const {
          redeemableAmountUnderManagementCap,
          mintingDisabled,
        } = dataLayout.decode(Buffer.from(data)) as any;

        return (
          <>
            <p>{`Native redeemable amount under management supply cap: ${
              redeemableAmountUnderManagementCapOption
                ? redeemableAmountUnderManagementCap.toString()
                : 'Not used'
            }`}</p>
            <p>{`Minting disabled: ${
              mintingDisabledOption
                ? mintingDisabled
                  ? 'Minting is disabled'
                  : 'Minting is enabled'
                : 'Not used'
            }`}</p>
          </>
        );
      },
    },
    98: {
      name: 'UXD - Mint with Identity Depository',
      accounts: [
        'User',
        'Payer',
        'Controller',
        'Depository',
        'Collateral Vault',
        'Redeemable Mint',
        'User Collateral',
        'User Redeemable',
        'System Program',
        'Token Program',
      ],
      getDataUI: (
        _connection: Connection,
        data: Uint8Array,
        _accounts: AccountMetaData[],
      ) => {
        const dataLayout = struct([
          u8('instruction'),
          ...ANCHOR_DISCRIMINATOR_LAYOUT,
          nu64('collateralAmount'),
        ]);

        const { collateralAmount } = dataLayout.decode(
          Buffer.from(data),
        ) as any;

        return (
          <>
            <p>{`Collateral amount: ${nativeToUi(
              collateralAmount,
              6,
            ).toLocaleString()}`}</p>
            <p>Collateral mint: USDC</p>
          </>
        );
      },
    },
    42: {
      name: 'UXD - Redeem with Identity Depository',
      accounts: [
        'User',
        'Payer',
        'Controller',
        'Depository',
        'Collateral Vault',
        'Redeemable Mint',
        'User Collateral',
        'User Redeemable',
        'System Program',
        'Token Program',
      ],
      getDataUI: (
        _connection: Connection,
        data: Uint8Array,
        _accounts: AccountMetaData[],
      ) => {
        const dataLayout = struct([
          u8('instruction'),
          ...ANCHOR_DISCRIMINATOR_LAYOUT,
          nu64('redeemableAmount'),
        ]);

        const { redeemableAmount } = dataLayout.decode(
          Buffer.from(data),
        ) as any;

        return (
          <>
            <p>{`Redeemable amount: ${nativeToUi(
              redeemableAmount,
              6,
            ).toLocaleString()}`}</p>
            <p>Collateral mint: USDC</p>
          </>
        );
      },
    },
    228: {
      name: 'UXD - Mint with Mercurial Vault Depository',
      accounts: [
        'User',
        'Payer',
        'Controller',
        'Depository',
        'Redeemable mint',
        'User redeemable',
        'Collateral mint',
        'User collateral',
        'Depository LP token vault',
        'Mercurial vault',
        'Mercurial vault lp mint',
        'Mercurial vault collateral token_safe',
        'Mercurial vault program',
        'System program',
        'Token program',
      ],
      getDataUI: (
        _connection: Connection,
        data: Uint8Array,
        accounts: AccountMetaData[],
      ) => {
        const dataLayout = struct([
          u8('instruction'),
          ...ANCHOR_DISCRIMINATOR_LAYOUT,
          nu64('collateralAmount'),
        ]);

        const { collateralAmount } = dataLayout.decode(
          Buffer.from(data),
        ) as any;

        const collateralMintName = getSplTokenNameByMint(accounts[6].pubkey);

        return (
          <>
            <p>{`Collateral amount: ${nativeToUi(
              collateralAmount,
              6,
            ).toLocaleString()}`}</p>
            <p>Collateral mint: {collateralMintName}</p>
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
        console.log('data', data);

        const dataLayout = struct([
          u8('instruction'),
          ...ANCHOR_DISCRIMINATOR_LAYOUT,
          u8('redeemableMintDecimals'),
        ]);

        const { redeemableMintDecimals } = dataLayout.decode(
          Buffer.from(data),
        ) as any;

        return (
          <p>{`redeemable mint decimals: ${redeemableMintDecimals.toString()}`}</p>
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
          <p>{`Redeemable Global Supply Cap: ${nativeAmountToFormattedUiAmount(
            new BN(args.redeemableGlobalSupplyCap.toString()),
            UXD_DECIMALS,
          )}`}</p>
        );
      },
    },
    21: {
      name: 'UXD - Register Mercurial Vault Depository',
      accounts: [
        'Authority',
        'Payer',
        'Controller',
        'Depository',
        'Collateral Mint',
        'Mercurial Vault',
        'Mercurial Vault LP Mint',
        'Depository LP Token Vault',
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
          u8('mintingFeeInBps'),
          u8('redeemingFeeInBps'),
          u128('redeemableAmountUnderManagementCap'),
        ]);
        const {
          mintingFeeInBps,
          redeemingFeeInBps,
          redeemableAmountUnderManagementCap,
        } = dataLayout.decode(Buffer.from(data)) as any;

        return (
          <>
            <p>{`Minting fee in bps: ${mintingFeeInBps.toString()}`}</p>
            <p>{`Redeeming fee in bps: ${redeemingFeeInBps.toString()}`}</p>
            <p>{`Native redeemable amount under management cap: ${redeemableAmountUnderManagementCap.toString()}`}</p>
          </>
        );
      },
    },
    29: {
      name: 'UXD - Edit Mercurial Vault Depository',
      accounts: ['Authority', 'Controller', 'Depository'],
      getDataUI: (
        _connection: Connection,
        data: Uint8Array,
        _accounts: AccountMetaData[],
      ) => {
        let redeemableAmountUnderManagementCapOption = false;
        let mintingFeeInBpsOption = false;
        let redeemingFeeInBpsOption = false;

        // Check if options are used or not
        if (data[8] == 1) {
          redeemableAmountUnderManagementCapOption = true;
        }

        if (data[9 + (redeemableAmountUnderManagementCapOption ? 16 : 0)] == 1) {
          mintingFeeInBpsOption = true;
        }

        if (
          data[
            10 +
              (redeemableAmountUnderManagementCapOption ? 16 : 0) +
              (mintingFeeInBpsOption ? 1 : 0)
          ] == 1
        ) {
          redeemingFeeInBpsOption = true;
        }

        const layout: Layout<any>[] = [
          u8('instruction'),
          ...ANCHOR_DISCRIMINATOR_LAYOUT,
        ];

        layout.push(u8('redeemableAmountUnderManagementCapOption'));
        if (redeemableAmountUnderManagementCapOption) {
          layout.push(u128('redeemableAmountUnderManagementCap'));
        }

        layout.push(u8('mintingFeeInBpsOption'));
        if (mintingFeeInBpsOption) {
          layout.push(u8('mintingFeeInBps'));
        }

        layout.push(u8('redeemingFeeInBpsOption'));
        if (redeemingFeeInBpsOption) {
          layout.push(u8('redeemingFeeInBps'));
        }

        const dataLayout = struct(layout);

        const {
          redeemableAmountUnderManagementCap,
          mintingFeeInBps,
          redeemingFeeInBps,
        } = dataLayout.decode(Buffer.from(data)) as any;

        return (
          <>
            <p>{`Native redeemable depository supply cap: ${
              redeemableAmountUnderManagementCapOption
                ? redeemableAmountUnderManagementCap.toString()
                : 'Not used'
            }`}</p>
            <p>{`Minting fee in bps: ${
              mintingFeeInBpsOption ? mintingFeeInBps.toString() : 'Not used'
            }`}</p>
            <p>{`Redeeming fee in bps: ${
              redeemingFeeInBpsOption
                ? redeemingFeeInBps.toString()
                : 'Not used'
            }`}</p>
          </>
        );
      },
    },
    132: {
      name: 'UXD - Edit Controller',
      accounts: ['Authority', 'Controller'],
      getDataUI: (
        _connection: Connection,
        data: Uint8Array,
        _accounts: AccountMetaData[],
      ) => {
        let quoteMintAndRedeemSoftCapOption = false;
        let redeemableSoftCapOption = false;
        let redeemableGlobalSupplyCapOption = false;

        // Check if options are used or not
        if (data[8] == 1) {
          quoteMintAndRedeemSoftCapOption = true;
        }

        if (data[9 + (quoteMintAndRedeemSoftCapOption ? 8 : 0)] == 1) {
          redeemableSoftCapOption = true;
        }

        if (
          data[
            10 +
              (quoteMintAndRedeemSoftCapOption ? 8 : 0) +
              (redeemableSoftCapOption ? 8 : 0)
          ] == 1
        ) {
          redeemableGlobalSupplyCapOption = true;
        }

        const layout: Layout<any>[] = [
          u8('instruction'),
          ...ANCHOR_DISCRIMINATOR_LAYOUT,
        ];

        layout.push(u8('quoteMintAndRedeemSoftCapOption'));
        if (quoteMintAndRedeemSoftCapOption) {
          layout.push(u64('quoteMintAndRedeemSoftCap'));
        }

        layout.push(u8('redeemableSoftCapOption'));
        if (redeemableSoftCapOption) {
          layout.push(u64('redeemableSoftCap'));
        }

        layout.push(u8('redeemableGlobalSupplyCapOption'));
        if (redeemableGlobalSupplyCapOption) {
          layout.push(u128('redeemableGlobalSupplyCap'));
        }

        const dataLayout = struct(layout);

        const {
          quoteMintAndRedeemSoftCap,
          redeemableSoftCap,
          redeemableGlobalSupplyCap,
        } = dataLayout.decode(Buffer.from(data)) as any;

        return (
          <>
            <p>{`Native quote mint and redeem soft cap: ${
              quoteMintAndRedeemSoftCap
                ? quoteMintAndRedeemSoftCap.toString()
                : 'Not used'
            }`}</p>
            <p>{`Native redeemable soft cap: ${
              redeemableSoftCap ? redeemableSoftCap.toString() : 'Not used'
            }`}</p>
            <p>{`Native redeemable global supply cap: ${
              redeemableGlobalSupplyCap
                ? redeemableGlobalSupplyCap.toString()
                : 'Not used'
            }`}</p>
          </>
        );
      },
    },

    179: {
      name: 'UXD - Register Credix Lp Depository',
      accounts: [
        'Authority',
        'Payer',
        'Controller',
        'Depository',
        'Collateral Mint',
        'Depository Collateral',
        'Depository Shares',
        'Credix Program State',
        'Credix Global Market State',
        'Credix Signing Authority',
        'Credix Liquidity Collateral',
        'Credix Shares Mint',
        'System Program',
        'Token Program',
        'Associated Token Program',
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
          u8('mintingFeeInBps'),
          u8('redeemingFeeInBps'),
          u128('redeemableAmountUnderManagementCap'),
        ]);
        const {
          mintingFeeInBps,
          redeemingFeeInBps,
          redeemableAmountUnderManagementCap,
        } = dataLayout.decode(Buffer.from(data)) as any;
        return (
          <>
            <p>{`Minting fee in bps: ${mintingFeeInBps.toString()}`}</p>
            <p>{`Redeeming fee in bps: ${redeemingFeeInBps.toString()}`}</p>
            <p>{`Native redeemable amount under management cap: ${redeemableAmountUnderManagementCap.toString()}`}</p>
          </>
        );
      },
    },

    153: {
      name: 'UXD - Mint with Credix Lp Depository',
      accounts: [
        'User',
        'Payer',
        'Controller',
        'Depository',
        'Redeemable Mint',
        'Collateral Mint',
        'User Redeemable',
        'User Collateral',
        'Depository Collateral',
        'Depository Shares',
        'Credix Global Market State',
        'Credix Signing Authority',
        'Credix Liquidity Collateral',
        'Credix Shares Mint',
        'Credix Pass',
        'System Program',
        'Token Program',
        'Associated Token Program',
        'Credix Program',
        'Rent',
      ],
      getDataUI: (
        _connection: Connection,
        data: Uint8Array,
        accounts: AccountMetaData[],
      ) => {
        const dataLayout = struct([
          u8('instruction'),
          ...ANCHOR_DISCRIMINATOR_LAYOUT,
          nu64('collateralAmount'),
        ]);
        const { collateralAmount } = dataLayout.decode(
          Buffer.from(data),
        ) as any;
        const collateralMintName = getSplTokenNameByMint(accounts[5].pubkey);
        return (
          <>
            <p>{`Collateral amount: ${nativeToUi(
              collateralAmount,
              6,
            ).toLocaleString()}`}</p>
            <p>Collateral mint: {collateralMintName}</p>
          </>
        );
      },
    },

    1000002: {
      name: 'UXD - Redeem from Credix Lp Depository',
      accounts: [
        'User',
        'Payer',
        'Controller',
        'Depository',
        'Redeemable Mint',
        'Collateral Mint',
        'User Redeemable',
        'User Collateral',
        'Depository Collateral',
        'Depository Shares',
        'Credix Program State',
        'Credix Global Market State',
        'Credix Signing Authority',
        'Credix Liquidity Collateral',
        'Credix Shares Mint',
        'Credix Pass',
        'Credix Treasury Collateral',
        'Credix Multisig Key',
        'Credix Multisig Collateral',
        'System Program',
        'Token Program',
        'Associated Token Program',
        'Credix Program',
        'Rent',
      ],
      getDataUI: (
        _connection: Connection,
        data: Uint8Array,
        accounts: AccountMetaData[],
      ) => {
        const dataLayout = struct([
          u8('instruction'),
          ...ANCHOR_DISCRIMINATOR_LAYOUT,
          nu64('redeemableAmount'),
        ]);
        const { redeemableAmount } = dataLayout.decode(
          Buffer.from(data),
        ) as any;
        const redeemableMintName = getSplTokenNameByMint(accounts[4].pubkey);
        return (
          <>
            <p>{`Redeemable amount: ${nativeToUi(
              redeemableAmount,
              6,
            ).toLocaleString()}`}</p>
            <p>Redeemable mint: {redeemableMintName}</p>
          </>
        );
      },
    },
    1000003: {
      name: 'UXD - Collect Profit of Credix Lp Depository',
      accounts: [
        'Authority',
        'Payer',
        'Controller',
        'Depository',
        'Collateral Mint',
        'Depository Collateral',
        'Depository Shares',
        'Credix Program State',
        'Credix Global Market State',
        'Credix Signing Authority',
        'Credix Liquidity Collateral',
        'Credix Shares Mint',
        'Credix Pass',
        'Credix Treasury Collateral',
        'Credix Multisig Key',
        'Credix Multisig Collateral',
        'Authority Collateral',
        'System Program',
        'Token Program',
        'Associated Token Program',
        'Credix Program',
        'Rent',
      ],
      getDataUI: (
        _connection: Connection,
        _data: Uint8Array,
        accounts: AccountMetaData[],
      ) => {
        return (
          <>
            <p>Profit collected into token account: {accounts[16].pubkey}</p>
          </>
        );
      },
    },
    100004: {
      name: 'UXD - Edit Credix Lp Depository',
      accounts: ['Authority', 'Controller', 'Depository'],
      getDataUI: (
        _connection: Connection,
        data: Uint8Array,
        _accounts: AccountMetaData[],
      ) => {
        let redeemableAmountUnderManagementCapOption = false;
        let mintingFeeInBpsOption = false;
        let redeemingFeeInBpsOption = false;

        // Check if options are used or not
        if (data[8] == 1) {
          redeemableAmountUnderManagementCapOption = true;
        }

        if (data[9 + (redeemableAmountUnderManagementCapOption ? 16 : 0)] == 1) {
          mintingFeeInBpsOption = true;
        }

        if (
          data[
            10 +
              (redeemableAmountUnderManagementCapOption ? 16 : 0) +
              (mintingFeeInBpsOption ? 1 : 0)
          ] == 1
        ) {
          redeemingFeeInBpsOption = true;
        }

        const layout: Layout<any>[] = [
          u8('instruction'),
          ...ANCHOR_DISCRIMINATOR_LAYOUT,
        ];

        layout.push(u8('redeemableAmountUnderManagementCapOption'));
        if (redeemableAmountUnderManagementCapOption) {
          layout.push(u128('redeemableAmountUnderManagementCap'));
        }

        layout.push(u8('mintingFeeInBpsOption'));
        if (mintingFeeInBpsOption) {
          layout.push(u8('mintingFeeInBps'));
        }

        layout.push(u8('redeemingFeeInBpsOption'));
        if (redeemingFeeInBpsOption) {
          layout.push(u8('redeemingFeeInBps'));
        }

        const dataLayout = struct(layout);

        const {
          redeemableAmountUnderManagementCap,
          mintingFeeInBps,
          redeemingFeeInBps,
        } = dataLayout.decode(Buffer.from(data)) as any;

        return (
          <>
            <p>{`Native redeemable depository supply cap: ${
              redeemableAmountUnderManagementCapOption
                ? redeemableAmountUnderManagementCap.toString()
                : 'Not used'
            }`}</p>
            <p>{`Minting fee in bps: ${
              mintingFeeInBpsOption ? mintingFeeInBps.toString() : 'Not used'
            }`}</p>
            <p>{`Redeeming fee in bps: ${
              redeemingFeeInBpsOption
                ? redeemingFeeInBps.toString()
                : 'Not used'
            }`}</p>
          </>
        );
      },
    },
  },
};
