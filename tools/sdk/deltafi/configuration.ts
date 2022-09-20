import { Connection, PublicKey } from '@solana/web3.js';
import { deltafiDexV2 } from './idl/deltafi';
import { newProgram } from '@saberhq/anchor-contrib';
import { SolanaAugmentedProvider } from '@saberhq/solana-contrib';
import { DeltafiProgram } from './program/deltafi';
import { SignerWalletAdapter } from '@solana/wallet-adapter-base';
import { augmentedProvider } from '../augmentedProvider';
import { nativeBNToUiAmount } from '../units';

export type FarmInfo = {
  name: string;
  address: PublicKey;
};

export type PoolInfo = {
  name: string;
  base: string;
  quote: string;
  mintBase: PublicKey;
  mintQuote: PublicKey;
  swapInfo: PublicKey;
  farmInfo?: FarmInfo;
};

export type TokenInfo = {
  name: string;
  mint: PublicKey;
  symbol: string;
  decimals: number;
  logoURI: string;
  pyth: {
    mockPrice?: number;
    price: PublicKey;
    product: PublicKey;
    productName: string;
  };
};

export type DeltafiConfiguration = {
  deltafiMint: PublicKey;
  deltafiToken: PublicKey;
  pythProgramId: PublicKey;
  programId: PublicKey;
  marketConfig: PublicKey;
  poolInfoList: PoolInfo[];
  tokenInfoList: TokenInfo[];
};

export type UserStakeInfo = {
  inPool: {
    uiBase: number;
    uiQuote: number;
  };
  inFarm: {
    uiBase: number;
    uiQuote: number;
  };
  availableToDepositToFarm: {
    uiBase: number;
    uiQuote: number;
  };
};

export class DeltafiDexV2 {
  public static readonly DeltafiProgramId = new PublicKey(
    'GNExJhNUhc9LN2DauuQAUJnXoy6DJ6zey3t9kT9A2PF3',
  );

  public static readonly deltafiMint = new PublicKey(
    'de1QJkP1qDCk5JYCCXCeq27bQQUdCaiv7xVKFrhPSzF',
  );

  public static readonly deltafiToken = new PublicKey(
    '7Xay86NUjUp8Lzv7kAYp8TqVG8eoWf8qzwbYt6tYoPCP',
  );

  public static readonly instructionsCode = {
    CreateLiquidityProviderV2: 173,
    DepositToStableSwap: 54,
    DepositToNormalSwap: 0, // ??
    WithdrawFromStableSwap: 136,
    WithdrawFromNormalSwap: 0, // ??
    CreateFarmUser: 144,
    DepositToFarm: 75,
    WithdrawFromFarm: 119,
  };

  public loadProgram(provider: SolanaAugmentedProvider): DeltafiProgram {
    return newProgram<DeltafiProgram>(
      deltafiDexV2,
      DeltafiDexV2.DeltafiProgramId,
      provider,
    );
  }

  public getDeltafiProgram({
    connection,
    wallet,
  }: {
    connection: Connection;
    wallet: SignerWalletAdapter;
  }): DeltafiProgram {
    const program = this.loadProgram(augmentedProvider(connection, wallet));

    if (!program) {
      throw new Error('Deltafi Configuration error: no program');
    }

    return program;
  }

  public async getUserStakeInfo({
    authority,
    poolInfo,
    deltafiProgram,
  }: {
    authority: PublicKey;
    poolInfo: PoolInfo;
    deltafiProgram: DeltafiProgram;
  }): Promise<UserStakeInfo> {
    const [liquidityProvider] = await this.findLiquidityProviderAddress({
      poolInfo,
      authority,
    });

    const info = await deltafiProgram.account.liquidityProvider.fetchNullable(
      liquidityProvider,
    );

    if (!info) {
      return {
        inPool: {
          uiBase: 0,
          uiQuote: 0,
        },
        inFarm: {
          uiBase: 0,
          uiQuote: 0,
        },
        availableToDepositToFarm: {
          uiBase: 0,
          uiQuote: 0,
        },
      };
    }

    const { baseShare, quoteShare, stakedBaseShare, stakedQuoteShare } = info;

    const baseDecimals = this.getBaseOrQuoteMintDecimals(poolInfo.mintBase);
    const quoteDecimals = this.getBaseOrQuoteMintDecimals(poolInfo.mintQuote);

    return {
      inPool: {
        uiBase: nativeBNToUiAmount(baseShare, baseDecimals),
        uiQuote: nativeBNToUiAmount(quoteShare, quoteDecimals),
      },

      inFarm: {
        uiBase: nativeBNToUiAmount(stakedBaseShare, baseDecimals),
        uiQuote: nativeBNToUiAmount(stakedQuoteShare, baseDecimals),
      },

      availableToDepositToFarm: {
        uiBase: nativeBNToUiAmount(
          baseShare.sub(stakedBaseShare),
          baseDecimals,
        ),
        uiQuote: nativeBNToUiAmount(
          quoteShare.sub(stakedQuoteShare),
          quoteDecimals,
        ),
      },
    };
  }

  public getPoolInfoByPoolName(poolName: string): PoolInfo | undefined {
    return DeltafiDexV2.configuration.poolInfoList.find(
      ({ name }) => name === poolName,
    );
  }

  public getBaseOrQuoteMintDecimals(mint: PublicKey): number {
    const info = DeltafiDexV2.configuration.tokenInfoList.find((token) =>
      token.mint.equals(mint),
    );

    if (!info) {
      throw new Error(
        `Mint ${mint.toBase58()} does not exist in Deltafi tokenInfoList`,
      );
    }

    return info.decimals;
  }

  public findLiquidityProviderAddress({
    poolInfo,
    authority,
  }: {
    poolInfo: PoolInfo;
    authority: PublicKey;
  }): Promise<[PublicKey, number]> {
    return PublicKey.findProgramAddress(
      [
        Buffer.from('LiquidityProvider'),
        poolInfo.swapInfo.toBuffer(),
        authority.toBuffer(),
      ],
      DeltafiDexV2.DeltafiProgramId,
    );
  }

  public findFarmUserAddress({
    farmAddress,
    authority,
  }: {
    farmAddress: PublicKey;
    authority: PublicKey;
  }): Promise<[PublicKey, number]> {
    return PublicKey.findProgramAddress(
      [Buffer.from('FarmUser'), farmAddress.toBuffer(), authority.toBuffer()],
      DeltafiDexV2.DeltafiProgramId,
    );
  }

  // Mainnet
  public static readonly configuration: DeltafiConfiguration = {
    deltafiMint: new PublicKey('de1QJkP1qDCk5JYCCXCeq27bQQUdCaiv7xVKFrhPSzF'),
    deltafiToken: new PublicKey('7Xay86NUjUp8Lzv7kAYp8TqVG8eoWf8qzwbYt6tYoPCP'),
    pythProgramId: new PublicKey(
      'FsJ3A3u2vn5cTVofAjvy6y5kwABJAqYWpe4975bi2epH',
    ),
    programId: new PublicKey('GNExJhNUhc9LN2DauuQAUJnXoy6DJ6zey3t9kT9A2PF3'),
    marketConfig: new PublicKey('2mKnx3JawxMVrt8QcZLSQkcuJFBT7TUfL2usrShhaadJ'),
    poolInfoList: [
      {
        name: 'USDC-USDT',
        base: 'USDC',
        quote: 'USDT',
        mintBase: new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'),
        mintQuote: new PublicKey(
          'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
        ),
        swapInfo: new PublicKey('CjCwyW6Vpxu6srdzVP7NyV6DBwxPmyD2PXVAYcJXVqtG'),
      },
      {
        name: 'SOL-USDC',
        base: 'SOL',
        quote: 'USDC',
        mintBase: new PublicKey('So11111111111111111111111111111111111111112'),
        mintQuote: new PublicKey(
          'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
        ),
        swapInfo: new PublicKey('H28JgPAZLywdezp9kZmy1jo2RdxVkZhoVbxKn3PwCAqs'),
      },
      {
        name: 'GMT-USDC',
        base: 'GMT',
        quote: 'USDC',
        mintBase: new PublicKey('7i5KKsX2weiTkry7jA4ZwSuXGhs5eJBEjY8vVxR4pfRx'),
        mintQuote: new PublicKey(
          'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
        ),
        swapInfo: new PublicKey('4vx4UNSGEzfL9NWDuFhnPxLfmqB8hjCHLBeuALzmzn19'),
      },
      {
        name: 'UXD-USDC',
        base: 'UXD',
        quote: 'USDC',
        mintBase: new PublicKey('7kbnvuGBxxj8AG9qp8Scn56muWGaRaFqxg1FsRp3PaFT'),
        mintQuote: new PublicKey(
          'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
        ),
        swapInfo: new PublicKey('DkwiQyA2JfD8ARfvMbMqu2DD4XKRkewRZVDE94SZNxSS'),
        farmInfo: {
          name: 'default',
          address: new PublicKey(
            '2H3PPDwkvMoo536Lk66YDodr4nqFNnFjfRR7s9LZh85F',
          ),
        },
      },
      {
        name: 'cUSDC-cUSDT',
        base: 'cUSDC',
        quote: 'cUSDT',
        mintBase: new PublicKey('993dVFL2uXWYeoXuEBFXR4BijeXdTv4s6BzsCjJZuwqk'),
        mintQuote: new PublicKey(
          'BTsbZDV7aCMRJ3VNy9ygV4Q2UeEo9GpR8D6VvmMZzNr8',
        ),
        swapInfo: new PublicKey('DzFzJyDTXG5YCWXN6DeVXbLGmpYbkX6PPHs1RNLX9fKk'),
      },
    ],

    tokenInfoList: [
      {
        name: 'USD Coin',
        mint: new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'),
        symbol: 'USDC',
        decimals: 6,
        logoURI:
          'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png',
        pyth: {
          price: new PublicKey('Gnt27xtC473ZT2Mw5u8wZ68Z3gULkSTb5DuxJy7eJotD'),
          product: new PublicKey(
            '8GWTTbNiXdmyZREXbjsZBmCRuzdPrW55dnZGDkTRjWvb',
          ),
          productName: 'Crypto.USDC/USD',
        },
      },
      {
        name: 'Solana',
        mint: new PublicKey('So11111111111111111111111111111111111111112'),
        symbol: 'SOL',
        decimals: 9,
        logoURI:
          ' https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png',
        pyth: {
          price: new PublicKey('H6ARHf6YXhGYeQfUzQNGk6rDNnLBQKrenN712K4AQJEG'),
          product: new PublicKey(
            'ALP8SdU9oARYVLgLR7LrqMNCYBnhtnQz1cj6bwgwQmgj',
          ),
          productName: 'Crypto.SOL/USD',
        },
      },
      {
        name: 'USDT',
        mint: new PublicKey('Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB'),
        symbol: 'USDT',
        decimals: 6,
        logoURI:
          'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB/logo.svg',
        pyth: {
          price: new PublicKey('3vxLXJqLqF3JG5TCbYycbKWRBbCJQLxQmBGCkyqEEefL'),
          product: new PublicKey(
            'Av6XyAMJnyi68FdsKSPYgzfXGjYrrt6jcAMwtvzLCqaM',
          ),
          productName: 'Crypto.USDT/USD',
        },
      },
      {
        name: 'GMT',
        mint: new PublicKey('7i5KKsX2weiTkry7jA4ZwSuXGhs5eJBEjY8vVxR4pfRx'),
        symbol: 'GMT',
        decimals: 9,
        logoURI:
          'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/7i5KKsX2weiTkry7jA4ZwSuXGhs5eJBEjY8vVxR4pfRx/logo.png',
        pyth: {
          price: new PublicKey('DZYZkJcFJThN9nZy4nK3hrHra1LaWeiyoZ9SMdLFEFpY'),
          product: new PublicKey(
            '6Vi1i2rJj23CGxLQYHHVjoMwJm4pNWVGDESdDto7QqTk',
          ),
          productName: 'Crypto.GMT/USD',
        },
      },
      {
        name: 'UXD Stablecoin',
        mint: new PublicKey('7kbnvuGBxxj8AG9qp8Scn56muWGaRaFqxg1FsRp3PaFT'),
        symbol: 'UXD',
        decimals: 6,
        logoURI:
          'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/7kbnvuGBxxj8AG9qp8Scn56muWGaRaFqxg1FsRp3PaFT/uxd-icon-black.png',
        pyth: {
          mockPrice: 1,
          price: new PublicKey('11111111111111111111111111111111'),
          product: new PublicKey('11111111111111111111111111111111'),
          productName: 'Mock.UXD/USD',
        },
      },
      {
        name: 'Solend USDC',
        mint: new PublicKey('993dVFL2uXWYeoXuEBFXR4BijeXdTv4s6BzsCjJZuwqk'),
        symbol: 'cUSDC',
        decimals: 6,
        logoURI:
          ' https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/993dVFL2uXWYeoXuEBFXR4BijeXdTv4s6BzsCjJZuwqk/logo.png',
        pyth: {
          mockPrice: 1.04,
          price: new PublicKey('11111111111111111111111111111111'),
          product: new PublicKey('11111111111111111111111111111111'),
          productName: 'Mock.cUSDC/USD',
        },
      },
      {
        name: 'Solend USDT',
        mint: new PublicKey('BTsbZDV7aCMRJ3VNy9ygV4Q2UeEo9GpR8D6VvmMZzNr8'),
        symbol: 'cUSDT',
        decimals: 6,
        logoURI:
          'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/BTsbZDV7aCMRJ3VNy9ygV4Q2UeEo9GpR8D6VvmMZzNr8/logo.png',
        pyth: {
          mockPrice: 1.04,
          price: new PublicKey('11111111111111111111111111111111'),
          product: new PublicKey('11111111111111111111111111111111'),
          productName: 'Mock.cUSDT/USD',
        },
      },
    ],
  };
}

export default new DeltafiDexV2();
