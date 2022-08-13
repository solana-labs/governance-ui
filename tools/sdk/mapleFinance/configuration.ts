import { Connection, PublicKey } from '@solana/web3.js';
import { USyrupJSON } from './idls/syrup';

import { newProgramMap } from '@saberhq/anchor-contrib';
import { SolanaAugmentedProvider } from '@saberhq/solana-contrib';
import { SyrupProgram } from './programs/syrup';
import { SignerWalletAdapter } from '@solana/wallet-adapter-base';
import { augmentedProvider } from '../augmentedProvider';
import { SplTokenInformation, SPL_TOKENS } from '@utils/splTokens';

export type MapleFinancePrograms = {
  Syrup: SyrupProgram;
};

export type PoolName = 'Credora_USDC';

export type Pools = {
  [key in PoolName]: {
    // lender: PublicKey;
    pool: PublicKey;
    globals: PublicKey;
    poolLocker: PublicKey;
    sharesMint: PublicKey;
    // lockedShares: PublicKey;
    // lenderShares: PublicKey;
    // lenderLocker: PublicKey;
    baseMint: SplTokenInformation;
  };
};

export class MapleFinance {
  public static readonly SyrupProgramId = new PublicKey(
    '5D9yi4BKrxF8h65NkVE1raCCWFKUs5ngub2ECxhvfaZe',
  );

  public static readonly pools: Pools = {
    Credora_USDC: {
      pool: new PublicKey('TamdAwg85s9aZ6mwSeAHoczzAV53rFokL5FVKzaF1Tb'),
      globals: new PublicKey('DtnAPKSHwJaYbFdjYibNcjxihVd6pK1agpT86N5tMVPX'),
      poolLocker: new PublicKey('92oAd9cm4rV4K4Xx9HPRMoFn7GwMaKsjNSPe7QVxywcy'),
      sharesMint: new PublicKey('CesxqgX4BvYudTNU45PArqTgefrRFhE1CwR7ECTDshfY'),
      baseMint: SPL_TOKENS.USDC,
    },
  };

  public loadPrograms(provider: SolanaAugmentedProvider): MapleFinancePrograms {
    return newProgramMap<MapleFinancePrograms>(
      provider,

      {
        // IDL
        Syrup: USyrupJSON,
      },

      {
        // Addresses
        Syrup: MapleFinance.SyrupProgramId,
      },
    );
  }

  public getMapleFinancePrograms({
    connection,
    wallet,
  }: {
    connection: Connection;
    wallet: SignerWalletAdapter;
  }) {
    const programs = this.loadPrograms(augmentedProvider(connection, wallet));

    if (!programs)
      throw new Error('MapleFinance Configuration error: no programs');
    return programs;
  }

  public static async findLenderAddress(
    poolName: PoolName,
    lenderUser: PublicKey,
  ): Promise<PublicKey> {
    return (
      await PublicKey.findProgramAddress(
        [
          Buffer.from('lender'),
          MapleFinance.pools[poolName].pool.toBytes(),
          lenderUser.toBytes(),
        ],
        MapleFinance.SyrupProgramId,
      )
    )[0];
  }

  public static async findLockedSharesAddress(
    lender: PublicKey,
  ): Promise<PublicKey> {
    return (
      await PublicKey.findProgramAddress(
        [Buffer.from('locked_shares'), lender.toBytes()],
        MapleFinance.SyrupProgramId,
      )
    )[0];
  }

  public static readonly syrupProgramInstructions = {
    lenderDeposit: 151,
  };
}

export default new MapleFinance();
