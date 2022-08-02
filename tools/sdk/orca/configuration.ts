import { PDAUtil, PriceMath } from '@orca-so/whirlpools-sdk';
import { WhirlpoolImpl } from '@orca-so/whirlpools-sdk/dist/impl/whirlpool-impl';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { Connection, PublicKey } from '@solana/web3.js';
import { getSplTokenNameByMint } from '@utils/splTokens';
import { parseMintAccountData } from '@utils/tokens';

export type WhirlpoolName =
  | 'UXD_USDC'
  | 'SOL_UXD'
  | 'SOL_USDC'
  | 'stSOL_USDC'
  | 'SOL_stSOL'
  | 'mSOL_USDC'
  | 'SOL_mSOL';

export type Whirlpool = {
  displayName: string;
  publicKey: PublicKey;
};

export type Whirlpools = {
  [key in WhirlpoolName]: Whirlpool;
};

export type WhirlpoolPositionInfo = {
  publicKey: PublicKey;
  liquidity: number;
  positionMint: PublicKey;
  uiLowerPrice: number;
  uiUpperPrice: number;
  tokenAName: string;
  tokenBName: string;
};

export class OrcaConfiguration {
  public static readonly WhirlpoolProgramId = new PublicKey(
    'whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc',
  );

  public static readonly instructionsCode = {
    WhirlpoolOpenPositionWithMetadata: 242,
    WhirlpoolIncreaseLiquidity: 46,
    WhirlpoolUpdateFeesAndRewards: 154,
    WhirlpoolCollectFees: 164,
    WhirlpoolDecreaseLiquidity: 160,
    WhirlpoolClosePosition: 123,
    WhirlpoolSwap: 248,
  };

  /*
    public Pools = {
        SOL_USDC: {
            name: 'SOL-USDC',
            publicKey: new PublicKey(OrcaPoolConfig.SOL_USDC),
        },
        SOL_USDT: {
            name: 'SOL-USDC',
            publicKey: new PublicKey(OrcaPoolConfig.SOL_USDC),
        },
        USDC_USDT: {
            name: 'USDC-USDT',
            publicKey: new PublicKey(OrcaPoolConfig.USDC_USDT),
        },
        SBR_USDC: {
            name: 'SBR_USDC',
            publicKey: new PublicKey(OrcaPoolConfig.SBR_USDC),
        },
    };
    */

  public readonly Whirlpools: Whirlpools = {
    UXD_USDC: {
      displayName: 'UXD-USDC',
      publicKey: new PublicKey('GLNvG5Ly4cK512oQeJqnwLftwfoPZ4skyDwZWzxorYQ9'),
    },
    SOL_UXD: {
      displayName: 'SOL-UXD',
      // How to find it?
      // #1 of increaseLiquidity ix
      publicKey: new PublicKey('2HtfXbKo531ghGgFYzcnJQJ9GNKAdeEJBbMgfF2zagQK'),
    },
    SOL_USDC: {
      displayName: 'SOL-USDC',
      publicKey: new PublicKey('HJPjoWUrhoZzkNfRpHuieeFk9WcZWjwy6PBjZ81ngndJ'),
    },
    stSOL_USDC: {
      displayName: 'stSOL-USDC',
      publicKey: new PublicKey('AXtdSZ2mpagmtM5aipN5kV9CyGBA8dxhSBnqMRp7UpdN'),
    },
    SOL_stSOL: {
      displayName: 'SOL-stSOL',
      publicKey: new PublicKey('2AEWSvUds1wsufnsDPCXjFsJCMJH5SNNm7fSF4kxys9a'),
    },
    mSOL_USDC: {
      displayName: 'mSOL-USDC',
      publicKey: new PublicKey('AiMZS5U3JMvpdvsr1KeaMiS354Z1DeSg5XjA4yYRxtFf'),
    },
    SOL_mSOL: {
      displayName: 'SOL_mSOL',
      publicKey: new PublicKey('HQcY5n2zP6rW74fyFEhWeBd3LnJpBcZechkvJpmdb8cx'),
    },
  };

  protected async getAuthorityTokenAccounts({
    connection,
    authority,
  }: {
    connection: Connection;
    authority: PublicKey;
  }): Promise<
    {
      mint: PublicKey;
      amount: number;
    }[]
  > {
    const authorityTokenAccounts = await connection.getParsedTokenAccountsByOwner(
      authority,
      {
        programId: TOKEN_PROGRAM_ID,
      },
    );

    return authorityTokenAccounts.value.map((tokenAccountInfo) => {
      const {
        account: {
          data: {
            parsed: {
              info: {
                mint,
                tokenAmount: { amount },
              },
            },
          },
        },
      } = tokenAccountInfo;

      return {
        mint,
        amount,
      };
    });
  }

  public async getAuthorityWhirlpoolPositions({
    connection,
    whirlpool,
    authority,
  }: {
    connection: Connection;
    whirlpool: WhirlpoolImpl;
    authority: PublicKey;
  }): Promise<WhirlpoolPositionInfo[]> {
    // Load every token accounts of the authority
    const tokenAccounts = await this.getAuthorityTokenAccounts({
      connection,
      authority,
    });

    // Filter token accounts to keep only the ones having 1 token
    // Due to how the Orca positionMint system works
    const filteredTokenAccounts = tokenAccounts.filter(
      (tokenAccount) => tokenAccount.amount !== 1,
    );

    // Load the infos about the underlying mints
    const mintInfos = await connection.getMultipleAccountsInfo(
      filteredTokenAccounts.map(
        (tokenAccount) => new PublicKey(tokenAccount.mint),
      ),
    );

    // Parse the mint infos
    const parsedMintInfos = mintInfos.map(
      (mintInfo) =>
        mintInfo?.data && parseMintAccountData(Buffer.from(mintInfo.data)),
    );

    // Check the mint infos to see which one matches positionMint characteristics
    // 0 decimal / initialized / no mint authority / no freeze authority / 1 supply
    const potentialPositionMints: PublicKey[] = parsedMintInfos.reduce(
      (positionMints, mintInfo, index) => {
        if (
          !mintInfo.isInitialized ||
          mintInfo.mintAuthority !== null ||
          mintInfo.freezeAuthority !== null ||
          mintInfo.supply.toString() !== '1' ||
          mintInfo.decimals !== 0
        ) {
          return positionMints;
        }

        return [...positionMints, new PublicKey(tokenAccounts[index].mint)];
      },
      [],
    );

    // Build positions PDA based on the positionMint
    const potentialPositionsPda = potentialPositionMints.map(
      (potentialPositionMint) =>
        PDAUtil.getPosition(
          OrcaConfiguration.WhirlpoolProgramId,
          potentialPositionMint,
        ),
    );

    // Get all the positions. If a position doesn't exist, return null.
    const positions = await Promise.all(
      potentialPositionsPda.map((potentialPositionPda) =>
        whirlpool.fetcher.getPosition(potentialPositionPda.publicKey),
      ),
    );

    // Turn the positionsData into WhirlpoolPositionInfo
    return positions.reduce((positionsInfo, positionData, index) => {
      if (positionData === null) {
        return positionsInfo;
      }

      if (!positionData.whirlpool.equals(whirlpool.address)) {
        return positionsInfo;
      }

      positionsInfo.push({
        publicKey: potentialPositionsPda[index].publicKey,
        liquidity: positionData.liquidity.toNumber(),
        positionMint: positionData.positionMint,
        uiLowerPrice: Number(
          PriceMath.tickIndexToPrice(
            positionData.tickLowerIndex,
            whirlpool.tokenAInfo.decimals,
            whirlpool.tokenBInfo.decimals,
          ).toFixed(whirlpool.tokenAInfo.decimals),
        ),
        uiUpperPrice: Number(
          PriceMath.tickIndexToPrice(
            positionData.tickUpperIndex,
            whirlpool.tokenAInfo.decimals,
            whirlpool.tokenBInfo.decimals,
          ).toFixed(whirlpool.tokenAInfo.decimals),
        ),
        tokenAName: getSplTokenNameByMint(whirlpool.getTokenAInfo().mint),
        tokenBName: getSplTokenNameByMint(whirlpool.getTokenBInfo().mint),
      });

      return positionsInfo;
    }, [] as WhirlpoolPositionInfo[]);
  }
}

export default new OrcaConfiguration();
