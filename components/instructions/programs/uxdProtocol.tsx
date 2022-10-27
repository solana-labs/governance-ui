import { Connection } from '@solana/web3.js';
import { struct, u8, nu64, Layout } from 'buffer-layout';
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
          <p>{`Redeemable Supply Soft Cap: ${nativeAmountToFormattedUiAmount(
            new BN(args.softCap.toString()),
            UXD_DECIMALS,
          )}`}</p>
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
        'Quote Mint', // USDC
        'Mango Account',
        'Mango Group',
        'System Program',
        'Token Program',
        'Mango Program',
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
          u128('redeemableDepositorySupplyCap'),
        ]);
        const { redeemableDepositorySupplyCap } = dataLayout.decode(
          Buffer.from(data),
        ) as any;

        return (
          <p>{`Native redeemable depository supply cap: ${redeemableDepositorySupplyCap.toString()}`}</p>
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
        let redeemableDepositorySupplyCapOption = false;
        let mintingFeeInBpsOption = false;
        let redeemingFeeInBpsOption = false;

        // Check if options are used or not
        if (data[8] == 1) {
          redeemableDepositorySupplyCapOption = true;
        }

        console.log('data', data);

        if (data[9 + (redeemableDepositorySupplyCapOption ? 16 : 0)] == 1) {
          mintingFeeInBpsOption = true;
        }

        if (
          data[
            10 +
              (redeemableDepositorySupplyCapOption ? 16 : 0) +
              (mintingFeeInBpsOption ? 1 : 0)
          ] == 1
        ) {
          redeemingFeeInBpsOption = true;
        }

        const layout: Layout<any>[] = [
          u8('instruction'),
          ...ANCHOR_DISCRIMINATOR_LAYOUT,
        ];

        layout.push(u8('redeemableDepositorySupplyCapOption'));
        if (redeemableDepositorySupplyCapOption) {
          layout.push(u128('redeemableDepositorySupplyCap'));
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
          redeemableDepositorySupplyCap,
          mintingFeeInBps,
          redeemingFeeInBps,
        } = dataLayout.decode(Buffer.from(data)) as any;

        return (
          <>
            <p>{`Native redeemable depository supply cap: ${
              redeemableDepositorySupplyCapOption
                ? redeemableDepositorySupplyCap.toString()
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
    7: {
      name: 'UXD - Edit Mango Depository',
      accounts: ['Authority', 'Controller', 'Depository'],
      getDataUI: (
        _connection: Connection,
        data: Uint8Array,
        _accounts: AccountMetaData[],
      ) => {
        let quoteMintAndRedeemFeeOption = false;
        let redeemableDepositorySupplyCapOption = false;

        // Check if options are used or not
        if (data[8] == 1) {
          quoteMintAndRedeemFeeOption = true;
        }

        if (data[9 + (quoteMintAndRedeemFeeOption ? 1 : 0)] == 1) {
          redeemableDepositorySupplyCapOption = true;
        }

        const layout: Layout<any>[] = [
          u8('instruction'),
          ...ANCHOR_DISCRIMINATOR_LAYOUT,
        ];

        layout.push(u8('quoteMintAndRedeemFeeOption'));
        if (quoteMintAndRedeemFeeOption) {
          layout.push(u8('quoteMintAndRedeemFee'));
        }

        layout.push(u8('redeemableDepositorySupplyCapOption'));
        if (redeemableDepositorySupplyCapOption) {
          layout.push(u128('redeemableDepositorySupplyCap'));
        }

        const dataLayout = struct(layout);

        const {
          quoteMintAndRedeemFee,
          redeemableDepositorySupplyCap,
        } = dataLayout.decode(Buffer.from(data)) as any;

        return (
          <>
            <p>{`Quote mint and redeem fee: ${
              quoteMintAndRedeemFeeOption
                ? quoteMintAndRedeemFee.toString()
                : 'Not used'
            }`}</p>
            <p>{`native redeemable depository supply cap: ${
              redeemableDepositorySupplyCapOption
                ? redeemableDepositorySupplyCap.toString()
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
