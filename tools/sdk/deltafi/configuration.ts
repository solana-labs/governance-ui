import { Cluster, Connection, PublicKey } from '@solana/web3.js';
import { deltafiDexV2 } from './idl/deltafi';

import { newProgram } from '@saberhq/anchor-contrib';
import { SolanaAugmentedProvider } from '@saberhq/solana-contrib';
import { DeltafiProgram } from './program/deltafi';
import { SignerWalletAdapter } from '@solana/wallet-adapter-base';
import { augmentedProvider } from '../augmentedProvider';

export type DeltafiCluster = 'mainnet-prod' | 'mainnet-test';

export type FarmInfo = {
  name: string;
  farmInfo: PublicKey;
};

export type PoolInfo = {
  name: string;
  base: string;
  quote: string;
  mintBase: PublicKey;
  mintQuote: PublicKey;
  swapInfo: PublicKey;
  farmInfoList: FarmInfo[];
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

export type DeltafiClusterConfiguration = {
  network: Cluster;
  deltafiMint: PublicKey;
  deltafiToken: PublicKey;
  pythProgramId: PublicKey;
  programId: PublicKey;
  marketConfig: PublicKey;
  poolInfoList: PoolInfo[];
  tokenInfoList: TokenInfo[];
};

export type DeltafiConfiguration = {
  [key in DeltafiCluster]: DeltafiClusterConfiguration;
};

export class DeltafiDexV2 {
  public static readonly DeltafiProgramId = new PublicKey(
    'GNExJhNUhc9LN2DauuQAUJnXoy6DJ6zey3t9kT9A2PF3',
  );

  public static readonly instructionsCode = {
    CreateLiquidityProviderV2: 173,
    DepositToStableSwap: 54,
    depositToNormalSwap: 0, // ??
    WithdrawFromStableSwap: 136,
    withdrawFromNormalSwap: 0, // ??
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

  public static readonly deltafiProgramInstructions = {
    // lenderDeposit: 151,
  };

  public static readonly configuration: DeltafiConfiguration = {
    'mainnet-prod': {
      network: 'mainnet-beta',
      deltafiMint: new PublicKey('de1QJkP1qDCk5JYCCXCeq27bQQUdCaiv7xVKFrhPSzF'),
      deltafiToken: new PublicKey(
        '7Xay86NUjUp8Lzv7kAYp8TqVG8eoWf8qzwbYt6tYoPCP',
      ),
      pythProgramId: new PublicKey(
        'FsJ3A3u2vn5cTVofAjvy6y5kwABJAqYWpe4975bi2epH',
      ),
      programId: new PublicKey('GNExJhNUhc9LN2DauuQAUJnXoy6DJ6zey3t9kT9A2PF3'),
      marketConfig: new PublicKey(
        '2mKnx3JawxMVrt8QcZLSQkcuJFBT7TUfL2usrShhaadJ',
      ),
      poolInfoList: [
        {
          name: 'USDC-USDT',
          base: 'USDC',
          quote: 'USDT',
          mintBase: new PublicKey(
            'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
          ),
          mintQuote: new PublicKey(
            'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
          ),
          swapInfo: new PublicKey(
            'CjCwyW6Vpxu6srdzVP7NyV6DBwxPmyD2PXVAYcJXVqtG',
          ),
          farmInfoList: [],
        },
        {
          name: 'SOL-USDC',
          base: 'SOL',
          quote: 'USDC',
          mintBase: new PublicKey(
            'So11111111111111111111111111111111111111112',
          ),
          mintQuote: new PublicKey(
            'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
          ),
          swapInfo: new PublicKey(
            'H28JgPAZLywdezp9kZmy1jo2RdxVkZhoVbxKn3PwCAqs',
          ),
          farmInfoList: [],
        },
        {
          name: 'GMT-USDC',
          base: 'GMT',
          quote: 'USDC',
          mintBase: new PublicKey(
            '7i5KKsX2weiTkry7jA4ZwSuXGhs5eJBEjY8vVxR4pfRx',
          ),
          mintQuote: new PublicKey(
            'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
          ),
          swapInfo: new PublicKey(
            '4vx4UNSGEzfL9NWDuFhnPxLfmqB8hjCHLBeuALzmzn19',
          ),
          farmInfoList: [],
        },
        {
          name: 'UXD-USDC',
          base: 'UXD',
          quote: 'USDC',
          mintBase: new PublicKey(
            '7kbnvuGBxxj8AG9qp8Scn56muWGaRaFqxg1FsRp3PaFT',
          ),
          mintQuote: new PublicKey(
            'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
          ),
          swapInfo: new PublicKey(
            'DkwiQyA2JfD8ARfvMbMqu2DD4XKRkewRZVDE94SZNxSS',
          ),
          farmInfoList: [],
        },
        {
          name: 'cUSDC-cUSDT',
          base: 'cUSDC',
          quote: 'cUSDT',
          mintBase: new PublicKey(
            '993dVFL2uXWYeoXuEBFXR4BijeXdTv4s6BzsCjJZuwqk',
          ),
          mintQuote: new PublicKey(
            'BTsbZDV7aCMRJ3VNy9ygV4Q2UeEo9GpR8D6VvmMZzNr8',
          ),
          swapInfo: new PublicKey(
            'DzFzJyDTXG5YCWXN6DeVXbLGmpYbkX6PPHs1RNLX9fKk',
          ),
          farmInfoList: [],
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
            price: new PublicKey(
              'Gnt27xtC473ZT2Mw5u8wZ68Z3gULkSTb5DuxJy7eJotD',
            ),
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
            price: new PublicKey(
              'H6ARHf6YXhGYeQfUzQNGk6rDNnLBQKrenN712K4AQJEG',
            ),
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
            price: new PublicKey(
              '3vxLXJqLqF3JG5TCbYycbKWRBbCJQLxQmBGCkyqEEefL',
            ),
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
            price: new PublicKey(
              'DZYZkJcFJThN9nZy4nK3hrHra1LaWeiyoZ9SMdLFEFpY',
            ),
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
    },
    'mainnet-test': {
      network: 'mainnet-beta',
      deltafiMint: new PublicKey('tstpB7nAg8n7ynm5C5mfRkQ73Q8dSTcyxkjNvR2Bspt'),
      deltafiToken: new PublicKey(
        '4DdpVwwWq88Rp3L1vSHRXBiWhGZPonXkBGLvju6zfFa3',
      ),
      pythProgramId: new PublicKey(
        'FsJ3A3u2vn5cTVofAjvy6y5kwABJAqYWpe4975bi2epH',
      ),
      programId: new PublicKey('HcWvS1XyweYMrCvY8TEeDxXgbWJagizUZXxCSLC2E89N'),
      marketConfig: new PublicKey(
        'HzjyB5DwtKj2afCggaZxkPE2x1H8WCB2JFjEMzPQuuBS',
      ),
      poolInfoList: [
        {
          name: 'USDC-USDT',
          base: 'USDC',
          quote: 'USDT',
          mintBase: new PublicKey(
            'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
          ),
          mintQuote: new PublicKey(
            'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
          ),
          swapInfo: new PublicKey(
            'HaEkMzDR5BFcVAjKT35f2gWwPvAt1TwwAq9yuQtqRLQ5',
          ),
          farmInfoList: [
            {
              name: 'default',
              farmInfo: new PublicKey(
                'ErsicHXH46vnt9KLnaGAm8Dv97yKsNtC56aTVmsLejsZ',
              ),
            },
          ],
        },
        {
          name: 'SOL-USDC',
          base: 'SOL',
          quote: 'USDC',
          mintBase: new PublicKey(
            'So11111111111111111111111111111111111111112',
          ),
          mintQuote: new PublicKey(
            'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
          ),
          swapInfo: new PublicKey(
            'HPnmHPyFJR1n4t1H7ophxSftkfM3nKnrEGm5uvsTSSFV',
          ),
          farmInfoList: [
            {
              name: 'default',
              farmInfo: new PublicKey(
                'BpcJQN7wDXe5NJrhLdEUeJVgZ8Kdrfr3cPbZWiXqJa2a',
              ),
            },
          ],
        },
        {
          name: 'GMT-USDC',
          base: 'GMT',
          quote: 'USDC',
          mintBase: new PublicKey(
            '7i5KKsX2weiTkry7jA4ZwSuXGhs5eJBEjY8vVxR4pfRx',
          ),
          mintQuote: new PublicKey(
            'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
          ),
          swapInfo: new PublicKey(
            '2og8uyTCpR2rKzweQhJmBAoscX1e6WFCZhRrSTKbQ2ur',
          ),
          farmInfoList: [
            {
              name: 'default',
              farmInfo: new PublicKey(
                'FNUPc2bZb9hVjhmcLq9C7iUhFq8WWE2HtdaRgf96B9tX',
              ),
            },
          ],
        },
        {
          name: 'UXD-USDC',
          base: 'UXD',
          quote: 'USDC',
          mintBase: new PublicKey(
            '7kbnvuGBxxj8AG9qp8Scn56muWGaRaFqxg1FsRp3PaFT',
          ),
          mintQuote: new PublicKey(
            'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
          ),
          swapInfo: new PublicKey(
            '5FytqcoUbBAbo3tSArdU3evMnCCgbUmhvrDWFJDLy12Y',
          ),
          farmInfoList: [
            {
              name: 'default',
              farmInfo: new PublicKey(
                'G7cNunkiWP3HyUFySQh8gk9xnLSZMtuF5vRW83o3vUAo',
              ),
            },
          ],
        },
        {
          name: 'cUSDC-cUSDT',
          base: 'cUSDC',
          quote: 'cUSDT',
          mintBase: new PublicKey(
            '993dVFL2uXWYeoXuEBFXR4BijeXdTv4s6BzsCjJZuwqk',
          ),
          mintQuote: new PublicKey(
            'BTsbZDV7aCMRJ3VNy9ygV4Q2UeEo9GpR8D6VvmMZzNr8',
          ),
          swapInfo: new PublicKey(
            'HJuEyWQCHVY6ig45V4kzYEGPDgnt7Hm9Pmp4ihg1rbu9',
          ),
          farmInfoList: [
            {
              name: 'default',
              farmInfo: new PublicKey(
                'HmCTu2EgrcL1ss3WPrpG4q5FDHVnRcLuZeXe6XWmqg9r',
              ),
            },
          ],
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
            price: new PublicKey(
              'Gnt27xtC473ZT2Mw5u8wZ68Z3gULkSTb5DuxJy7eJotD',
            ),
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
            'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png',
          pyth: {
            price: new PublicKey(
              'H6ARHf6YXhGYeQfUzQNGk6rDNnLBQKrenN712K4AQJEG',
            ),
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
            price: new PublicKey(
              '3vxLXJqLqF3JG5TCbYycbKWRBbCJQLxQmBGCkyqEEefL',
            ),
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
            price: new PublicKey(
              'DZYZkJcFJThN9nZy4nK3hrHra1LaWeiyoZ9SMdLFEFpY',
            ),
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
            'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/993dVFL2uXWYeoXuEBFXR4BijeXdTv4s6BzsCjJZuwqk/logo.png',
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
    },
  };
}

export default new DeltafiDexV2();
