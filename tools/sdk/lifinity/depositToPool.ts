import { Connection, PublicKey } from '@solana/web3.js';
import { SignerWalletAdapter } from '@solana/wallet-adapter-base';
import { depositAllTokenTypesItx } from './lifinity';

const depositToPool = async ({
  connection,
  authority,
  liquidityPool,
  wallet,
  amountTokenA,
  amountTokenB,
  amountTokenLP,
}: {
  connection: Connection;
  authority: PublicKey;
  liquidityPool: string;
  wallet: SignerWalletAdapter;
  amountTokenA: number; // amount in UXD
  amountTokenB: number; // amount in USDC
  amountTokenLP: number;
  slippage: number;
}) => {
  const depositItx = await depositAllTokenTypesItx({
    connection,
    liquidityPool,
    amountTokenA,
    amountTokenB,
    amountTokenLP,
    userTransferAuthority: authority,
    wallet,
  });

  return depositItx;
};

export default depositToPool;
