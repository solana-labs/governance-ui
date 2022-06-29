import { Connection } from '@solana/web3.js';
import { nu64, struct, u8 } from 'buffer-layout';
import { AccountMetaData } from '@solana/spl-governance';
import {
  AMM_PROGRAM_ADDR,
  getPoolNameByPoolTokenMint,
  InstructionsCodes,
} from '@tools/sdk/lifinity/lifinity';
import { tryGetMint, tryGetTokenMint } from '@utils/tokens';
import { ANCHOR_DISCRIMINATOR_LAYOUT } from '@utils/helpers';
import { nativeAmountToFormattedUiAmount } from '@tools/sdk/units';

export const LIFINITY_PROGRAM_INSTRUCTIONS = {
  [AMM_PROGRAM_ADDR.toBase58()]: {
    [InstructionsCodes.DepositAllTokenTypes]: {
      name: 'Lifinity - Deposit All Token Types',
      accounts: [
        'Amm',
        'Authority',
        'User Transfer Authority',
        'Source A Info',
        'Source B Info',
        'Token A',
        'Token B',
        'Pool Mint',
        'Destination',
        'Token Program',
        'Config Account',
        'Holder Account Info',
        'Lifinity Nft Account',
        'Lifinity Nft MetaAccount',
      ],
      getDataUI: async (
        connection: Connection,
        data: Uint8Array,
        accounts: AccountMetaData[],
      ) => {
        const dataLayout = struct([
          u8('instruction'),
          ...ANCHOR_DISCRIMINATOR_LAYOUT,
          nu64('poolTokenAmount'),
          nu64('maximumTokenAAmount'),
          nu64('maximumTokenBAmount'),
        ]);

        const tokenAccountTokenA = accounts[5].pubkey;
        const tokenAccountTokenB = accounts[6].pubkey;
        const lpMint = accounts[7].pubkey;

        const [mintInfoTokenA, mintInfoTokenB, lpMintInfo] = await Promise.all([
          tryGetTokenMint(connection, tokenAccountTokenA),
          tryGetTokenMint(connection, tokenAccountTokenB),
          tryGetMint(connection, lpMint),
        ]);

        if (!mintInfoTokenA || !mintInfoTokenB || !lpMintInfo) {
          throw new Error('could not load token infos');
        }

        const {
          maximumTokenAAmount,
          maximumTokenBAmount,
          poolTokenAmount,
        } = dataLayout.decode(Buffer.from(data)) as any;

        const uiAmountTokenA = nativeAmountToFormattedUiAmount(
          maximumTokenAAmount,
          mintInfoTokenA.account.decimals,
        );

        const uiAmountTokenB = nativeAmountToFormattedUiAmount(
          maximumTokenBAmount,
          mintInfoTokenB.account.decimals,
        );

        const uiAmountTokenLP = nativeAmountToFormattedUiAmount(
          poolTokenAmount,
          lpMintInfo.account.decimals,
        );

        const poolLabel = getPoolNameByPoolTokenMint(lpMint);

        return (
          <>
            <p>{`Liquidity Pool: ${poolLabel}`}</p>
            <p>{`Amount of Token A to deposit: ${uiAmountTokenA}`}</p>
            <p>{`Max Amount of Token B to deposit: ${uiAmountTokenB}`}</p>
            <p>{`LP Token to be minted: ${uiAmountTokenLP}`}</p>
          </>
        );
      },
    },
    [InstructionsCodes.WithdrawAllTokenTypes]: {
      name: 'Lifinity - Withdraw All Token Types',
      accounts: [
        'Amm',
        'Authority',
        'User Transfer Authority',
        'Source',
        'Token A',
        'Token B',
        'Pool Mint',
        'Dest Token A Info',
        'Dest Token B Info',
        'Fee Account',
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
          nu64('poolTokenAmount'),
          nu64('minimumTokenAAmount'),
          nu64('minimumTokenBAmount'),
        ]);

        const tokenAccountTokenA = accounts[4].pubkey;
        const tokenAccountTokenB = accounts[5].pubkey;
        const lpMint = accounts[6].pubkey;

        const [mintInfoTokenA, mintInfoTokenB, lpMintInfo] = await Promise.all([
          tryGetTokenMint(connection, tokenAccountTokenA),
          tryGetTokenMint(connection, tokenAccountTokenB),
          tryGetMint(connection, lpMint),
        ]);

        if (!mintInfoTokenA || !mintInfoTokenB || !lpMintInfo) {
          throw new Error('could not load token infos');
        }

        const {
          minimumTokenAAmount,
          minimumTokenBAmount,
          poolTokenAmount,
        } = dataLayout.decode(Buffer.from(data)) as any;

        const uiAmountTokenA = nativeAmountToFormattedUiAmount(
          minimumTokenAAmount,
          mintInfoTokenA.account.decimals,
        );

        const uiAmountTokenB = nativeAmountToFormattedUiAmount(
          minimumTokenBAmount,
          mintInfoTokenB.account.decimals,
        );

        const uiAmountTokenLP = nativeAmountToFormattedUiAmount(
          poolTokenAmount,
          lpMintInfo.account.decimals,
        );

        return (
          <>
            <p>{`Min Amount of Token A to withdraw: ${uiAmountTokenA}`}</p>
            <p>{`Min Amount of Token B to withdraw: ${uiAmountTokenB}`}</p>
            <p>{`LP Token to be redeemed: ${uiAmountTokenLP}`}</p>
          </>
        );
      },
    },
  },
};
