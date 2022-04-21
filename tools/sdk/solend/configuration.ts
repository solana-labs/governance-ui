import { PublicKey } from '@solana/web3.js';

// Describe what information should be provided for Solend
abstract class ASolendConfiguration {
  abstract get programID(): PublicKey;
  abstract get createObligationConfiguration(): {
    lamports: number;
    space: number;
  };

  abstract getSupportedCollateralMintsInformation(): SupportedCollateralMintsInformation;
  abstract getSupportedLendingMarketInformation(
    lendingMarket: SupportedLendingMarketName,
  ): SupportedLendingMarketInformation;
  abstract getSupportedLendingMarketNames(): SupportedLendingMarketName[];
  abstract retroEngineerTokenNameUsingReserve(
    reserveToFind: PublicKey,
  ): string | undefined;
}

export type SupportedLendingMarketName =
  | 'MainPool'
  | 'StablePool'
  | 'Coin98Pool';

// There must be one SupportedCollateralMintName per SupportedTokenName
export type SupportedTokenName = 'USDC' | 'UXD';
export type SupportedCollateralMintName =
  | 'cUSDC - main pool'
  | 'cUSDC - stable pool'
  | 'cUXD - stable pool'
  | 'cUXD - coin98 pool';

type SupportedCollateralMintInformation = {
  name: string;
  mint: PublicKey;
  decimals: number;
};

type SupportedCollateralMintsInformation = {
  [key in SupportedCollateralMintName]: SupportedCollateralMintInformation;
};

type SupportedLendingMarketInformation = {
  lendingMarket: PublicKey;
  lendingMarketAuthority: PublicKey;

  supportedTokens: {
    // Not every lending Market support every token
    [key in SupportedTokenName]?: {
      mint: PublicKey;
      relatedCollateralMint: SupportedCollateralMintInformation;
      decimals: number;
      reserve: PublicKey;
      reserveLiquiditySupply: PublicKey;
      pythOracle: PublicKey;
      switchboardFeedAddress: PublicKey;
      reserveCollateralSupplySplTokenAccount: PublicKey;
    };
  };

  seed: string;
};

type SupportedLendingMarketsInformation = {
  [key in SupportedLendingMarketName]: SupportedLendingMarketInformation;
};

class SolendConfiguration implements ASolendConfiguration {
  protected supportedCollateralMintsInformation: SupportedCollateralMintsInformation = {
    'cUSDC - main pool': {
      name: 'Solend Protocol: cUSDC - main pool',
      mint: new PublicKey('993dVFL2uXWYeoXuEBFXR4BijeXdTv4s6BzsCjJZuwqk'),
      decimals: 6,
    },

    'cUSDC - stable pool': {
      name: 'Solend Protocol: cUSDC - stable pool',
      mint: new PublicKey('4JZ6PXqRDp8jQxXUYX9cbAzHi6uzZk856aoAqPGdV5Da'),
      decimals: 6,
    },

    'cUXD - stable pool': {
      name: 'Solend Protocol: cUXD - stable pool',
      mint: new PublicKey('3R3mzc8o9oXCsBX2dKG7Bzc3ov1m7t4UHtb81ktAeCxY'),
      decimals: 6,
    },

    'cUXD - coin98 pool': {
      name: 'Solend Protocol: cUXD - coin98 pool',
      mint: new PublicKey('ErJswCkk3oRS9poFdRxJHt6j9yQisTB8YQAqJkE7iC5U'),
      decimals: 6,
    },
  };

  protected supportedLendingMarketsInformation: SupportedLendingMarketsInformation = {
    MainPool: {
      lendingMarket: new PublicKey(
        '4UpD2fh7xH3VP9QQaXtsS1YY3bxzWhtfpks7FatyKvdY',
      ),
      lendingMarketAuthority: new PublicKey(
        'DdZR6zRFiUt4S5mg7AV1uKB2z1f1WzcNYCaTEEWPAuby',
      ),

      // First 32 bytes of lending Market
      seed: '4UpD2fh7xH3VP9QQaXtsS1YY3bxzWhtfpks7FatyKvdY'.slice(0, 32),

      supportedTokens: {
        USDC: {
          relatedCollateralMint: this.supportedCollateralMintsInformation[
            'cUSDC - main pool'
          ],
          mint: new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'),
          decimals: 6,
          reserve: new PublicKey(
            'BgxfHJDzm44T7XG68MYKx7YisTjZu73tVovyZSjJMpmw',
          ),
          reserveLiquiditySupply: new PublicKey(
            '8SheGtsopRUDzdiD6v6BR9a6bqZ9QwywYQY99Fp5meNf',
          ),
          pythOracle: new PublicKey(
            'Gnt27xtC473ZT2Mw5u8wZ68Z3gULkSTb5DuxJy7eJotD',
          ),
          switchboardFeedAddress: new PublicKey(
            'CZx29wKMUxaJDq6aLVQTdViPL754tTR64NAgQBUGxxHb',
          ),
          reserveCollateralSupplySplTokenAccount: new PublicKey(
            'UtRy8gcEu9fCkDuUrU8EmC7Uc6FZy5NCwttzG7i6nkw',
          ),
        },
      },
    },

    StablePool: {
      lendingMarket: new PublicKey(
        'GktVYgkstojYd8nVXGXKJHi7SstvgZ6pkQqQhUPD7y7Q',
      ),
      lendingMarketAuthority: new PublicKey(
        'Ej4KxxUz73edQzjfsPVWvYxT5eyhQoWoXpo7BYm2Ejhj',
      ),

      // First 32 bytes of lending Market
      seed: 'GktVYgkstojYd8nVXGXKJHi7SstvgZ6pkQqQhUPD7y7Q'.slice(0, 32),

      supportedTokens: {
        UXD: {
          relatedCollateralMint: this.supportedCollateralMintsInformation[
            'cUXD - stable pool'
          ],
          mint: new PublicKey('7kbnvuGBxxj8AG9qp8Scn56muWGaRaFqxg1FsRp3PaFT'),
          decimals: 6,
          reserve: new PublicKey(
            '27YJsVpHWvjS8BKaz7Gd8unSFJAMrh6gPEFjqhYxn9AE',
          ),
          reserveLiquiditySupply: new PublicKey(
            '9v6c1QVoyQxX6hWKGCYLwcunc3JfMWQLcMS3KWR5Kqhf',
          ),
          pythOracle: new PublicKey(
            'nu11111111111111111111111111111111111111111',
          ),
          switchboardFeedAddress: new PublicKey(
            'Lj3y2beRYhCaQQH9SYjmMJv3uuTcqpCJjQYe4829FAL',
          ),
          reserveCollateralSupplySplTokenAccount: new PublicKey(
            '6RTTJkwZ7NuK4JaJnnaUgqU78gaW3A8McDTfiGsBBbLX',
          ),
        },

        USDC: {
          relatedCollateralMint: this.supportedCollateralMintsInformation[
            'cUSDC - stable pool'
          ],
          mint: new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'),
          decimals: 6,
          reserve: new PublicKey(
            'JCRDg9T5mUUxazdJ2nGWDN2pdcXVQc5VM8XDp1DW6Aoa',
          ),
          reserveLiquiditySupply: new PublicKey(
            'z7yTesDCUkvheHnULMjS6dggiiVczpX5JjfTx5atRgQ',
          ),
          pythOracle: new PublicKey(
            'Gnt27xtC473ZT2Mw5u8wZ68Z3gULkSTb5DuxJy7eJotD',
          ),
          switchboardFeedAddress: new PublicKey(
            'CZx29wKMUxaJDq6aLVQTdViPL754tTR64NAgQBUGxxHb',
          ),
          reserveCollateralSupplySplTokenAccount: new PublicKey(
            '7JF8e93t52SGFUHzMt5cD7vte4b8gWZHY99GLziAUeiP',
          ),
        },
      },
    },

    Coin98Pool: {
      lendingMarket: new PublicKey(
        '7tiNvRHSjYDfc6usrWnSNPyuN68xQfKs1ZG2oqtR5F46',
      ),
      lendingMarketAuthority: new PublicKey(
        '8web9hJK4TQJBV23WQpBw9jMvn3YE1EV3PEcnXJvgwQa',
      ),

      // First 32 bytes of lending Market
      seed: '7tiNvRHSjYDfc6usrWnSNPyuN68xQfKs1ZG2oqtR5F46'.slice(0, 32),

      supportedTokens: {
        UXD: {
          relatedCollateralMint: this.supportedCollateralMintsInformation[
            'cUXD - coin98 pool'
          ],
          mint: new PublicKey('7kbnvuGBxxj8AG9qp8Scn56muWGaRaFqxg1FsRp3PaFT'),
          decimals: 6,
          reserve: new PublicKey(
            '46Lh1P2XmTNG8Gnt4zkTdG1BXi2V18NggfYTbXpSzAYy',
          ),
          reserveLiquiditySupply: new PublicKey(
            'Fr3A2agcj8G8jEVPhE1rYUQsGF85meEN5fDQ4etFp5Wi',
          ),
          pythOracle: new PublicKey(
            'nu11111111111111111111111111111111111111111',
          ),
          switchboardFeedAddress: new PublicKey(
            'Lj3y2beRYhCaQQH9SYjmMJv3uuTcqpCJjQYe4829FAL',
          ),
          reserveCollateralSupplySplTokenAccount: new PublicKey(
            'BdjGeJQNEZhCLyW89RNWgxkn3hwRMsAxncc29QNuHvRf',
          ),
        },
      },
    },
  };

  public readonly programID = new PublicKey(
    'So1endDq2YkqhipRh3WViPa8hdiSpxWy6z3Z6tMCpAo',
  );

  // All of theses numbers are magic numbers we got by looking at Solend documentation & transactions
  public readonly createObligationConfiguration = {
    lamports: 9938880,
    space: 1300,
  };

  public getSupportedCollateralMintsInformation(): SupportedCollateralMintsInformation {
    return this.supportedCollateralMintsInformation;
  }

  public getSupportedLendingMarketInformation(
    lendingMarketName: SupportedLendingMarketName,
  ): SupportedLendingMarketInformation {
    return this.supportedLendingMarketsInformation[lendingMarketName];
  }

  public getSupportedLendingMarketNames(): SupportedLendingMarketName[] {
    return Object.keys(
      this.supportedLendingMarketsInformation,
    ) as SupportedLendingMarketName[];
  }

  public retroEngineerTokenNameUsingReserve(
    reserveToFind: PublicKey,
  ): string | undefined {
    return Object.values(this.supportedLendingMarketsInformation).reduce(
      (tmp, { supportedTokens }) => {
        const token = Object.entries(supportedTokens).find(
          ([, { reserve }]) => reserveToFind.toString() === reserve.toString(),
        );

        if (token) {
          return token[0];
        }

        return tmp;
      },
      undefined,
    );
  }
}

export default new SolendConfiguration();
