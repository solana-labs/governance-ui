import { Connection, PublicKey } from '@solana/web3.js';
import { findATAAddrSync } from '@utils/ataTools';
import { SignerWalletAdapter } from '@solana/wallet-adapter-base';
import { Lifinity } from './lib';
import { PoolList } from './poolList';
import { Program, Provider } from '@project-serum/anchor';
import { LifinityAmmIDL } from './idl/lifinity_amm_idl';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import * as mplTokenMetadata from '@metaplex-foundation/mpl-token-metadata';
import * as mplCore from '@metaplex-foundation/mpl-core';
import { Wallet } from '@project-serum/sol-wallet-adapter';
import { uiAmountToNativeBN } from '../units';
import BigNumber from 'bignumber.js';

export const AMM_PROGRAM_ADDR = 'EewxydAPCCVuNEyrVN68PuSYdQ7wKn27V9Gjeoi8dy3S';

export const buildLifinity = ({
  connection,
  wallet,
}: {
  connection: Connection;
  wallet: Wallet;
}) => {
  return new Program(
    LifinityAmmIDL,
    new PublicKey(AMM_PROGRAM_ADDR),
    new Provider(connection, wallet, Provider.defaultOptions()),
  );
};

const getWalletNftAccounts = async ({
  connection,
  wallet,
}: {
  connection: Connection;
  wallet: PublicKey;
}): Promise<{
  lifinityTokenAccount: string | undefined;
  lifinityMetaAccount: string | undefined;
}> => {
  let lifinityTokenAccount;
  let lifinityMetaAccount;
  const parsedTokenAccounts = await connection.getParsedTokenAccountsByOwner(
    wallet,
    {
      programId: TOKEN_PROGRAM_ID,
    },
    'confirmed',
  );
  for (const tokenAccountInfo of parsedTokenAccounts.value) {
    const tokenAccountPubkey = tokenAccountInfo.pubkey;
    const parsedInfo = tokenAccountInfo.account.data.parsed.info;
    if (parsedInfo.tokenAmount.amount > 0) {
      const mintAddress = parsedInfo.mint;

      const metadataPDA = await mplTokenMetadata.Metadata.getPDA(mintAddress);
      const mintAccInfo = await connection.getAccountInfo(metadataPDA);
      if (mintAccInfo) {
        const {
          data: { updateAuthority },
        } = mplTokenMetadata.Metadata.from(
          // @ts-ignore
          new mplCore.Account(mintAddress, mintAccInfo),
        );
        if (
          updateAuthority === 'BihU63mFnjLaBNPXxaDj8WUPBepZqqB4T2RHBJ99f2xo' ||
          updateAuthority === 'H5q7Z2FJ5KaWmtGquGqoYJYrM73BEpoabzas5y12s38T'
        ) {
          lifinityTokenAccount = tokenAccountPubkey;
          lifinityMetaAccount = metadataPDA;
          break;
        }
      }
    }
  }
  return { lifinityTokenAccount, lifinityMetaAccount };
};

export const depositAllTokenTypesItx = async ({
  connection,
  liquidityPool,
  amountTokenA,
  amountTokenB,
  amountTokenLP,
  userTransferAuthority,
  wallet,
}: {
  connection: Connection;
  liquidityPool: string;
  amountTokenA: number;
  amountTokenB: number;
  amountTokenLP: number;
  userTransferAuthority: PublicKey;
  wallet: Wallet;
}) => {
  const program = buildLifinity({ connection, wallet });

  const pool = getPoolByLabel(liquidityPool);
  const [authority] = await PublicKey.findProgramAddress(
    [new PublicKey(pool.amm).toBuffer()],
    program.programId,
  );
  const [sourceAInfo] = findATAAddrSync(
    userTransferAuthority,
    new PublicKey(pool.poolCoinMint),
  );
  const [sourceBInfo] = findATAAddrSync(
    userTransferAuthority,
    new PublicKey(pool.poolPcMint),
  );
  const [destination] = findATAAddrSync(
    userTransferAuthority,
    new PublicKey(pool.poolMint),
  );
  console.log('destination', destination.toBase58());

  const {
    lifinityTokenAccount,
    lifinityMetaAccount,
  } = await getWalletNftAccounts({
    connection,
    //TODO -> have the Lifinity holder be the governance instead of the user wallet
    wallet: wallet.publicKey,
  });
  if (!lifinityTokenAccount || !lifinityMetaAccount)
    throw new Error('Wallet does not hold Lifinity Igniter');

  const itx = program.instruction.depositAllTokenTypes(
    uiAmountToNativeBN(amountTokenLP, pool.poolMintDecimal),
    uiAmountToNativeBN(amountTokenA, pool.poolCoinDecimal),
    uiAmountToNativeBN(amountTokenB, pool.poolPcDecimal),
    {
      accounts: {
        amm: new PublicKey(pool.amm),
        authority: authority,
        userTransferAuthorityInfo: userTransferAuthority,
        sourceAInfo,
        sourceBInfo,
        tokenA: new PublicKey(pool.poolCoinTokenAccount),
        tokenB: new PublicKey(pool.poolPcTokenAccount),
        poolMint: new PublicKey(pool.poolMint),
        destination,
        tokenProgram: TOKEN_PROGRAM_ID,
        configAccount: new PublicKey(pool.configAccount),
        holderAccountInfo: wallet.publicKey,
        lifinityNftAccount: new PublicKey(lifinityTokenAccount),
        lifinityNftMetaAccount: new PublicKey(lifinityMetaAccount),
      },
      instructions: [],
      signers: [],
    },
  );

  return itx;
};

export const getLPTokenBalance = async ({
  connection,
  liquidityPool,
  wallet,
}: {
  connection: Connection;
  liquidityPool: string;
  wallet: PublicKey;
}) => {
  const pool = getPoolByLabel(liquidityPool);
  const lpMint = new PublicKey(pool.poolMint);
  const [lpTokenAccount] = findATAAddrSync(wallet, lpMint);
  const [lpInfo, lpUserBalance] = await Promise.all([
    connection.getTokenSupply(lpMint),
    connection.getTokenAccountBalance(lpTokenAccount),
  ]);
  return {
    lpTokenAccount,
    maxBalance: lpUserBalance.value.uiAmount ?? 0,
    decimals: lpInfo.value.decimals,
  };
};

export const getWithdrawOut = async ({
  connection,
  liquidityPool,
  lpTokenAmount,
  slippage,
}: {
  connection: Connection;
  liquidityPool: string;
  lpTokenAmount: number;
  slippage: number;
}) => {
  const pool = getPoolByLabel(liquidityPool);
  const lpAccount = await connection.getTokenSupply(
    new PublicKey(pool.poolMint),
  );
  const poolAccountTokenA = await connection.getTokenAccountBalance(
    new PublicKey(pool.poolCoinTokenAccount),
  );
  const poolAccountTokenB = await connection.getTokenAccountBalance(
    new PublicKey(pool.poolPcTokenAccount),
  );
  const minimumTokenAAmount = calculateMinimumTokenAmountFromLP({
    tokenBalance: poolAccountTokenA.value.amount,
    tokenDecimals: pool.poolCoinDecimal,
    lpAmount: lpTokenAmount.toString(),
    lpSupply: lpAccount.value.amount,
    slippage,
  });
  const minimumTokenBAmount = calculateMinimumTokenAmountFromLP({
    tokenBalance: poolAccountTokenB.value.amount,
    tokenDecimals: pool.poolCoinDecimal,
    lpAmount: lpTokenAmount.toString(),
    lpSupply: lpAccount.value.amount,
    slippage,
  });
  return {
    amountTokenA: minimumTokenAAmount.toNumber(),
    amountTokenB: minimumTokenBAmount.toNumber(),
  };
};

const calculateMinimumTokenAmountFromLP = ({
  tokenBalance,
  tokenDecimals,
  lpAmount,
  lpSupply,
  slippage,
}: {
  tokenBalance: string;
  tokenDecimals: number;
  lpAmount: string;
  lpSupply: string;
  slippage: number | string;
}) => {
  const tokenBalanceBN = new BigNumber(tokenBalance);
  const percent = new BigNumber(+slippage + 100).div(new BigNumber(100));
  const lpAmountBN = new BigNumber(lpAmount);
  const lpSupplyBN = new BigNumber(lpSupply);

  return tokenBalanceBN
    .multipliedBy(lpAmountBN)
    .dividedBy(lpSupplyBN)
    .dividedBy(percent)
    .decimalPlaces(tokenDecimals);
};

export const getDepositOut = async ({
  connection,
  wallet,
  amountTokenA,
  slippage,
}: {
  connection: Connection;
  wallet: SignerWalletAdapter;
  amountTokenA: number;
  slippage: number;
}) => {
  const lfty = await Lifinity.build(connection, wallet);
  return lfty.getDepositAmountOut(connection, amountTokenA, slippage);
};

export const poolLabels = Object.keys(PoolList);

export const getPoolByLabel = (label: string) => PoolList[label];
