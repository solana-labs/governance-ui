import { PublicKey } from '@solana/web3.js';
import { SPL_TOKENS } from '@utils/splTokens';

export type SupportedSaberPoolNames = 'UXDxUSDC';

export type Pool = {
  poolToken: {
    name: string;
    mint: PublicKey;
    decimals: number;
  };
  tokenAccountA: {
    name: string;
    tokenMint: PublicKey;
    mint: PublicKey;
    decimals: number;
    adminDestinationAccount: PublicKey;
  };
  tokenAccountB: {
    name: string;
    tokenMint: PublicKey;
    mint: PublicKey;
    decimals: number;
    adminDestinationAccount: PublicKey;
  };
  swapAccount: PublicKey;
  swapAccountAuthority: PublicKey;
};

export type Pools = {
  [key in SupportedSaberPoolNames]: Pool;
};

export type SupportedSaberPoolsMintsInformation = {
  [key in SupportedSaberPoolNames]: Pool['poolToken'];
};

class SaberPools {
  public readonly saberStableSwapProgramId = new PublicKey(
    'SSwpkEEcbUqx4vtoEByFjSkhKdCT862DNVb52nZg1UZ',
  );

  public readonly pools: Pools = {
    UXDxUSDC: {
      poolToken: {
        name: 'UXD-USDC LP Token',
        mint: new PublicKey('UXDgmqLd1roNYkC4TmJzok61qcM9oKs5foDADiFoCiJ'),
        decimals: 6,
      },

      tokenAccountA: {
        name: 'UXD',
        tokenMint: SPL_TOKENS.UXD.mint,
        mint: new PublicKey('9zj4aX38Uxf3h6AUjS4EipWS8mwbEofasHAf3a1uKGds'),
        decimals: 6,
        adminDestinationAccount: new PublicKey(
          '3czPMjjuHNb1yAahyQVmGiN7AQAGaws8xpFcSskCj2oe',
        ),
      },

      tokenAccountB: {
        name: 'USDC',
        tokenMint: SPL_TOKENS.USDC.mint,
        mint: new PublicKey('CwQDG1MWunn9cLNwcZLd8YBacweSR7ARo32w4mLua1Yr'),
        decimals: 6,
        adminDestinationAccount: new PublicKey(
          '5BEZbHQMLGyLsVTG77UoJqNsuF7PJUfeNmxwDfe6v4jy',
        ),
      },

      swapAccount: new PublicKey('KEN5P7p3asnb23Sw6yAmJRGvijfAzso3RqfyLAQhznt'),

      swapAccountAuthority: new PublicKey(
        'HaNqpJUQeH2t6SB3tDJAtKV52fJM9rV1mGZrRrqMRZo1',
      ),
    },
  };

  public readonly stableSwapInstructions = {
    swap: 1,
    deposit: 2,
    withdrawOne: 4,
  };

  public getPoolsTokens(): SupportedSaberPoolsMintsInformation {
    return Object.entries(this.pools).reduce((acc, [key, { poolToken }]) => {
      acc[key] = poolToken;
      return acc;
    }, {} as SupportedSaberPoolsMintsInformation);
  }

  public getPoolByTokenMints(
    mint1: PublicKey,
    mint2: PublicKey,
  ): Pool | undefined {
    return Object.values(this.pools).find(
      (pool) =>
        (pool.tokenAccountA.tokenMint.equals(mint1) ||
          pool.tokenAccountA.tokenMint.equals(mint2)) &&
        (pool.tokenAccountB.tokenMint.equals(mint1) ||
          pool.tokenAccountB.tokenMint.equals(mint2)),
    );
  }

  public getPoolByTokenAccounts(
    tokenAccount1: PublicKey,
    tokenAccount2: PublicKey,
  ): Pool | undefined {
    return Object.values(this.pools).find(
      (pool) =>
        (pool.tokenAccountA.mint.equals(tokenAccount1) ||
          pool.tokenAccountA.mint.equals(tokenAccount2)) &&
        (pool.tokenAccountB.mint.equals(tokenAccount1) ||
          pool.tokenAccountB.mint.equals(tokenAccount2)),
    );
  }
}

export default new SaberPools();
