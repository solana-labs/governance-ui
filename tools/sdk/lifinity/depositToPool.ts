import { Connection, PublicKey } from '@solana/web3.js';
import { SignerWalletAdapter } from '@solana/wallet-adapter-base';
import { depositAllTokenTypesItx } from './lifinity';

const depositToPool = async ({
  connection,
  authority,
  liquidityPool,
  wallet,
  uiAmountTokenA,
  uiAmountTokenB,
  uiAmountTokenLP,
}: {
  connection: Connection;
  authority: PublicKey;
  liquidityPool: string;
  wallet: SignerWalletAdapter;
  uiAmountTokenA: number;
  uiAmountTokenB: number;
  uiAmountTokenLP: number;
  slippage: number;
}) => {
  const depositItx = await depositAllTokenTypesItx({
    connection,
    liquidityPool,
    uiAmountTokenA,
    uiAmountTokenB,
    uiAmountTokenLP,
    userTransferAuthority: authority,
    wallet,
  });

  return depositItx;
};

export default depositToPool;
