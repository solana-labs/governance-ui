import { Connection, PublicKey } from '@solana/web3.js';
import AmmImpl, { PROGRAM_ID } from '@mercurial-finance/dynamic-amm-sdk';
import {
  MAINNET_POOL,
  VAULT_PROGRAM_ID,
} from '@mercurial-finance/dynamic-amm-sdk/dist/cjs/src/amm/constants';

export type PoolName = 'USDT_USDC' | 'USDC_UXD';

export type PoolDescription = {
  displayName: string;
  publicKey: PublicKey;
};

export type Pools = {
  [key in PoolName]: PoolDescription;
};

export class MercurialConfiguration {
  public static readonly instructionsCode = {
    addImbalanceLiquidity: 79,
    removeBalanceLiquidity: 133,
  };

  public static readonly poolProgram = new PublicKey(PROGRAM_ID);

  public static readonly vaultProgram = new PublicKey(VAULT_PROGRAM_ID);

  public readonly pools: Pools = {
    USDT_USDC: {
      displayName: 'USDT/USDC',
      publicKey: new PublicKey(MAINNET_POOL.USDT_USDC),
    },
    USDC_UXD: {
      displayName: 'USDC/UXD',
      publicKey: new PublicKey('4xqyRGWMRkfVo7GH74aryKjSLcpQiVHGAZY4u1n6wAbZ'),
    },
  };

  public loadAmmPool({
    connection,
    pool,
  }: {
    connection: Connection;
    pool: PublicKey;
  }): Promise<AmmImpl> {
    return AmmImpl.create(connection, pool, {
      cluster: 'mainnet-beta',
    });
  }
}

export default new MercurialConfiguration();
