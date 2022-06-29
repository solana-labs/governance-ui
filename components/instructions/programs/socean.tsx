import { nu64, struct, u8 } from 'buffer-layout';
import { AccountMetaData } from '@solana/spl-governance';
import { Connection } from '@solana/web3.js';
import soceanConfiguration from '@tools/sdk/socean/configuration';
import { tryGetMint, tryGetTokenMint } from '@utils/tokens';
import { ANCHOR_DISCRIMINATOR_LAYOUT } from '@utils/helpers';
import {
  nativeAmountToFormattedUiAmount,
  nativeBNToUiAmount,
} from '@tools/sdk/units';

export const SOCEAN_PROGRAM_INSTRUCTIONS = {
  [soceanConfiguration.bondingProgramId.mainnet.toBase58()]: {
    [soceanConfiguration.bondingProgramInstructions.mintBondedTokens]: {
      name: 'Socean - Mint Bonded Tokens',
      accounts: [
        'Owner',
        'Deposit From',
        'Mint To',
        'Vault',
        'Bonded Mint',
        'Bond Mint Authority',
        'Bond Pool',
        'Token Program Id',
      ],
      getDataUI: async (
        connection: Connection,
        data: Uint8Array,
        accounts: AccountMetaData[],
      ) => {
        const owner = accounts[0].pubkey.toString();
        const depositFrom = accounts[1].pubkey.toString();
        const mintTo = accounts[2].pubkey.toString();
        const bondedMint = accounts[4].pubkey;

        const dataLayout = struct([
          u8('instruction'),
          ...ANCHOR_DISCRIMINATOR_LAYOUT,
          nu64('amount'),
        ]);

        const { amount } = dataLayout.decode(Buffer.from(data)) as any;

        const bondedMintInfo = await tryGetMint(connection, bondedMint);

        if (!bondedMintInfo) throw new Error('Cannot load bonded mint info');

        const uiAmount = nativeAmountToFormattedUiAmount(
          amount,
          bondedMintInfo.account.decimals,
        );

        owner;
        return (
          <div className="flex flex-col">
            <div className="flex">
              <span>Owner:</span>
              <span>{owner}</span>
            </div>

            <div className="flex">
              <span>Bonded Token Amount:</span>
              <span>{uiAmount}</span>
            </div>

            <div className="flex">
              <span>Deposit From (Sale Mint TA/ATA):</span>
              <span>{depositFrom}</span>
            </div>

            <div className="flex">
              <span>Mint To (Bonded Mint TA/ATA):</span>
              <span>{mintTo}</span>
            </div>
          </div>
        );
      },
    },
  },

  [soceanConfiguration.descendingAuctionProgramId.mainnet.toBase58()]: {
    [soceanConfiguration.descendingAuctionProgramInstructions
      .depositToAuctionPool]: {
      name: 'Socean - Deposit to Auction Pool',
      accounts: [
        'Auction',
        'Auction Pool',
        'Auction Authority',
        'Authority',
        'Source Account',
        'Token Program Id',
      ],
      getDataUI: async (
        connection: Connection,
        data: Uint8Array,
        accounts: AccountMetaData[],
      ) => {
        const owner = accounts[3].pubkey.toString();
        const sourceAccount = accounts[4].pubkey;

        const dataLayout = struct([
          u8('instruction'),
          ...ANCHOR_DISCRIMINATOR_LAYOUT,
          nu64('depositAmount'),
        ]);

        const { depositAmount } = dataLayout.decode(Buffer.from(data)) as any;

        const bondedMintInfo = await tryGetTokenMint(connection, sourceAccount);

        if (!bondedMintInfo) throw new Error('Cannot load source account info');

        const uiDepositAmount = nativeAmountToFormattedUiAmount(
          depositAmount,
          bondedMintInfo.account.decimals,
        );

        return (
          <div className="flex flex-col">
            <div className="flex">
              <span>Owner:</span>
              <span>{owner}</span>
            </div>

            <div className="flex">
              <span>Amount of bonded token to Deposit:</span>
              <span>{uiDepositAmount}</span>
            </div>

            <div className="flex">
              <span>Deposit From (Bonded Mint TA/ATA):</span>
              <span>{sourceAccount.toString()}</span>
            </div>
          </div>
        );
      },
    },

    [soceanConfiguration.descendingAuctionProgramInstructions.purchase]: {
      name: 'Socean - Purchase',
      accounts: [
        'Auction',
        'Auction Authority',
        'Sale Mint',
        'Auction Pool',
        'Payment Destination',
        'Buyer',
        'Payment Source',
        'Sale Destination',
        'Token Program Id',
      ],
      getDataUI: async (
        connection: Connection,
        data: Uint8Array,
        accounts: AccountMetaData[],
      ) => {
        const auction = accounts[0].pubkey.toString();
        const saleMint = accounts[2].pubkey;
        const buyer = accounts[5].pubkey.toString();
        const paymentSource = accounts[6].pubkey;

        const dataLayout = struct([
          u8('instruction'),
          ...ANCHOR_DISCRIMINATOR_LAYOUT,
          nu64('purchaseAmount'),
          nu64('expectedPayment'),
          nu64('slippageTolerance'),
        ]);

        const {
          purchaseAmount,
          expectedPayment,
          slippageTolerance,
        } = dataLayout.decode(Buffer.from(data)) as any;

        const [sourceMintInfo, bondedMintInfo] = await Promise.all([
          tryGetTokenMint(connection, paymentSource),
          tryGetMint(connection, saleMint),
        ]);

        if (!sourceMintInfo)
          throw new Error('Cannot load payment source account info');
        if (!bondedMintInfo)
          throw new Error('Cannot load sale destination info');

        const uiPurchaseAmount = nativeAmountToFormattedUiAmount(
          purchaseAmount,
          bondedMintInfo.account.decimals,
        );

        const uiExpectedPayment = nativeAmountToFormattedUiAmount(
          expectedPayment,
          sourceMintInfo.account.decimals,
        );

        const uiSlippageTolerance = (slippageTolerance / 10).toLocaleString();

        const uiPurchaseRatio = (
          nativeBNToUiAmount(expectedPayment, sourceMintInfo.account.decimals) /
          nativeBNToUiAmount(purchaseAmount, bondedMintInfo.account.decimals)
        ).toLocaleString();

        return (
          <div className="flex flex-col">
            <div className="flex">
              <span>Buyer:</span>
              <span>{buyer}</span>
            </div>

            <div className="flex">
              <span>Amount of bonded token to Purchase:</span>
              <span>{uiPurchaseAmount}</span>
            </div>

            <div className="flex">
              <span>Expected Payment:</span>
              <span>{uiExpectedPayment}</span>
            </div>

            <div className="flex">
              <span>Slippage Tolerance:</span>
              <span>{uiSlippageTolerance}%</span>
            </div>

            <div className="flex">
              <span>Purchase Ratio (X Payment Mint = 1 Bonded Token):</span>
              <span>{uiPurchaseRatio}</span>
            </div>

            <div className="flex">
              <span>Auction:</span>
              <span>{auction}</span>
            </div>
          </div>
        );
      },
    },
  },
};
