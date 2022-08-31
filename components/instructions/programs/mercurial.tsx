import { AccountMetaData } from '@solana/spl-governance';
import { Connection } from '@solana/web3.js';
import { ANCHOR_DISCRIMINATOR_LAYOUT } from '@utils/helpers';
import { struct, u8, nu64 } from 'buffer-layout';
import { MercurialConfiguration } from '@tools/sdk/mercurial/configuration';
import { tryGetMint, tryGetTokenMint } from '@utils/tokens';
import { getSplTokenNameByMint } from '@utils/splTokens';
import { nativeBNToUiAmount } from '@tools/sdk/units';
import { BN } from '@blockworks-foundation/mango-client';

export const MERCURIAL_PROGRAM_INSTRUCTIONS = {
  [MercurialConfiguration.poolProgram.toBase58()]: {
    [MercurialConfiguration.instructionsCode.addImbalanceLiquidity]: {
      name: 'Mercurial - Add Imbalance Liquidity',
      accounts: [
        'Pool',
        'LP Mint',
        'User Pool LP',
        'A Vault LP',
        'B Vault LP',
        'A Vault',
        'B Vault',
        'A Vault LP Mint',
        'B Vault LP Mint',
        'A Token Vault',
        'B Token Vault',
        'User A Token',
        'User B Token',
        'User',
        'Vault Program',
        'Token Program',
      ],
      getDataUI: async (
        connection: Connection,
        data: Uint8Array,
        accounts: AccountMetaData[],
      ) => {
        const lpMint = accounts[1].pubkey;
        const userAToken = accounts[11].pubkey;
        const userBToken = accounts[12].pubkey;

        const dataLayout = struct([
          u8('instruction'),
          ...ANCHOR_DISCRIMINATOR_LAYOUT,
          nu64('minimumPoolTokenAmount'),
          nu64('tokenAAmount'),
          nu64('tokenBAmount'),
        ]);

        const {
          minimumPoolTokenAmount,
          tokenAAmount,
          tokenBAmount,
        } = dataLayout.decode(Buffer.from(data)) as any;

        const [lpTokenInfo, tokenAInfo, tokenBInfo] = await Promise.all([
          tryGetMint(connection, lpMint),
          tryGetTokenMint(connection, userAToken),
          tryGetTokenMint(connection, userBToken),
        ]);

        if (!lpTokenInfo || !tokenAInfo || !tokenBInfo) {
          throw new Error('Cannot load mint info');
        }

        const tokenAName = getSplTokenNameByMint(tokenAInfo.publicKey);
        const tokenBName = getSplTokenNameByMint(tokenBInfo.publicKey);

        const uiMinimumPoolTokenAmount = nativeBNToUiAmount(
          new BN(minimumPoolTokenAmount),
          lpTokenInfo.account.decimals,
        );
        const uiTokenAAmount = nativeBNToUiAmount(
          new BN(tokenAAmount),
          tokenAInfo.account.decimals,
        );
        const uiTokenBAmount = nativeBNToUiAmount(
          new BN(tokenBAmount),
          tokenBInfo.account.decimals,
        );

        return (
          <>
            <p>
              Pool {tokenAName} - {tokenBName}
            </p>
            <p>
              {`Minimum Pool Token Amount: ${Number(
                uiMinimumPoolTokenAmount.toString(),
              ).toLocaleString()}`}
            </p>
            <p>
              {`Token A Amount: ${Number(
                uiTokenAAmount.toString(),
              ).toLocaleString()}`}
            </p>
            <p>
              {`Token B Amount: ${Number(
                uiTokenBAmount.toString(),
              ).toLocaleString()}`}
            </p>
          </>
        );
      },
    },
    [MercurialConfiguration.instructionsCode.removeBalanceLiquidity]: {
      name: 'Mercurial - Remove Balance Liquidity',
      accounts: [
        'Pool',
        'LP Mint',
        'User Pool LP',
        'A Vault LP',
        'B Vault LP',
        'A Vault',
        'B Vault',
        'A Vault LP Mint',
        'B Vault LP Mint',
        'A Token Vault',
        'B Token Vault',
        'User A Token',
        'User B Token',
        'User',
        'Vault Program',
        'Token Program',
      ],
      getDataUI: async (
        connection: Connection,
        data: Uint8Array,
        accounts: AccountMetaData[],
      ) => {
        const lpMint = accounts[1].pubkey;
        const userAToken = accounts[11].pubkey;
        const userBToken = accounts[12].pubkey;

        const dataLayout = struct([
          u8('instruction'),
          ...ANCHOR_DISCRIMINATOR_LAYOUT,
          nu64('poolTokenAmount'),
          nu64('minimumATokenOut'),
          nu64('minimumBTokenOut'),
        ]);

        const {
          poolTokenAmount,
          minimumATokenOut,
          minimumBTokenOut,
        } = dataLayout.decode(Buffer.from(data)) as any;

        const [lpTokenInfo, tokenAInfo, tokenBInfo] = await Promise.all([
          tryGetMint(connection, lpMint),
          tryGetTokenMint(connection, userAToken),
          tryGetTokenMint(connection, userBToken),
        ]);

        if (!lpTokenInfo || !tokenAInfo || !tokenBInfo) {
          throw new Error('Cannot load mint info');
        }

        const tokenAName = getSplTokenNameByMint(tokenAInfo.publicKey);
        const tokenBName = getSplTokenNameByMint(tokenBInfo.publicKey);

        const uiPoolTokenAmount = nativeBNToUiAmount(
          new BN(poolTokenAmount),
          lpTokenInfo.account.decimals,
        );
        const uiMinimumATokenOut = nativeBNToUiAmount(
          new BN(minimumATokenOut),
          tokenAInfo.account.decimals,
        );
        const uiMinimumBTokenOut = nativeBNToUiAmount(
          new BN(minimumBTokenOut),
          tokenBInfo.account.decimals,
        );

        return (
          <>
            <p>
              Pool {tokenAName} - {tokenBName}
            </p>
            <p>
              {`Pool Token Amount: ${Number(
                uiPoolTokenAmount.toString(),
              ).toLocaleString()}`}
            </p>
            <p>
              {`Minimum Token A Amount Out: ${Number(
                uiMinimumATokenOut.toString(),
              ).toLocaleString()}`}
            </p>
            <p>
              {`Minimum Token B Amount Out: ${Number(
                uiMinimumBTokenOut.toString(),
              ).toLocaleString()}`}
            </p>
          </>
        );
      },
    },
  },
};
