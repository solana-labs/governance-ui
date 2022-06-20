import { Connection, PublicKey } from '@solana/web3.js';
import { SignerWalletAdapter } from '@solana/wallet-adapter-base';
import {
  buildLifinity,
  getPoolInfoByName,
  getWalletNftAccounts,
} from './lifinity';
import { PoolNames } from './poolList';
import BigNumber from 'bignumber.js';
import { findATAAddrSync } from '@utils/ataTools';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { BN } from '@project-serum/anchor';

const depositToPool = async ({
  connection,
  userTransferAuthority,
  poolName,
  wallet,
  maximumAmountTokenA,
  maximumAmountTokenB,
  amountLpToken,
}: {
  connection: Connection;
  userTransferAuthority: PublicKey;
  poolName: PoolNames;
  wallet: SignerWalletAdapter;
  maximumAmountTokenA: BigNumber;
  maximumAmountTokenB: BigNumber;
  amountLpToken: BigNumber;
  slippage: number;
}) => {
  const program = buildLifinity({ connection, wallet });

  const {
    amm,
    configAccount,
    lpToken: { mint: mintLpToken },
    tokenA: { mint: mintTokenA, tokenAccount: tokenAccountTokenA },
    tokenB: { mint: mintTokenB, tokenAccount: tokenAccountTokenB },
  } = getPoolInfoByName(poolName);

  const [authority] = await PublicKey.findProgramAddress(
    [amm.toBuffer()],
    program.programId,
  );

  const [sourceAInfo] = findATAAddrSync(userTransferAuthority, mintTokenA);
  const [sourceBInfo] = findATAAddrSync(userTransferAuthority, mintTokenB);
  const [destination] = findATAAddrSync(userTransferAuthority, mintLpToken);

  const nftAccounts = await getWalletNftAccounts({
    connection,
    wallet: userTransferAuthority,
  });

  if (!nftAccounts) {
    throw new Error('Wallet does not hold Lifinity Igniter');
  }

  const { lifinityNftAccount, lifinityNftMetaAccount } = nftAccounts;

  return program.instruction.depositAllTokenTypes(
    new BN(Math.floor(amountLpToken.toNumber())),
    new BN(Math.ceil(maximumAmountTokenA.toNumber())),
    new BN(Math.ceil(maximumAmountTokenB.toNumber())),
    {
      accounts: {
        amm,
        authority,
        sourceAInfo,
        sourceBInfo,
        poolMint: mintLpToken,
        destination,
        configAccount,
        lifinityNftAccount,
        lifinityNftMetaAccount,
        userTransferAuthorityInfo: userTransferAuthority,
        tokenA: tokenAccountTokenA,
        tokenB: tokenAccountTokenB,
        tokenProgram: TOKEN_PROGRAM_ID,
        holderAccountInfo: userTransferAuthority,
      },
      instructions: [],
      signers: [],
    },
  );
};

export default depositToPool;
