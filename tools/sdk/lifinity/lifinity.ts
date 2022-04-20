import BigNumber from 'bignumber.js';
import * as mplCore from '@metaplex-foundation/mpl-core';
import * as mplTokenMetadata from '@metaplex-foundation/mpl-token-metadata';
import { Program, Provider } from '@project-serum/anchor';
import { Wallet } from '@project-serum/sol-wallet-adapter';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { SignerWalletAdapter } from '@solana/wallet-adapter-base';
import { Connection, PublicKey } from '@solana/web3.js';
import { findATAAddrSync } from '@utils/ataTools';
import { uiAmountToNativeBigN, uiAmountToNativeBN } from '../units';
import { LifinityAmmIDL } from './idl/lifinity_amm_idl';
import { IPoolInfo, PoolList } from './poolList';

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
  const minimumTokenAAmount = calculateMinimumTokenWithdrawAmountFromLP({
    tokenBalance: poolAccountTokenA.value.amount,
    tokenDecimals: pool.poolCoinDecimal,
    lpAmount: lpTokenAmount.toString(),
    lpSupply: lpAccount.value.amount,
    slippage,
  });
  const minimumTokenBAmount = calculateMinimumTokenWithdrawAmountFromLP({
    tokenBalance: poolAccountTokenB.value.amount,
    tokenDecimals: pool.poolCoinDecimal,
    lpAmount: lpTokenAmount.toString(),
    lpSupply: lpAccount.value.amount,
    slippage,
  });
  return {
    uiAmountTokenA: minimumTokenAAmount.toNumber(),
    uiAmountTokenB: minimumTokenBAmount.toNumber(),
  };
};

const calculateMinimumTokenWithdrawAmountFromLP = ({
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

const getOutAmount = (
  poolInfo: IPoolInfo,
  amount: number | string,
  fromCoinMint: string,
  toCoinMint: string,
  slippage: number,
  coinBalance: BigNumber,
  pcBalance: BigNumber,
) => {
  const price = pcBalance.dividedBy(coinBalance);

  const fromAmount = new BigNumber(amount);

  const percent = new BigNumber(100)
    .plus(new BigNumber(slippage))
    .dividedBy(new BigNumber(100));

  if (!coinBalance || !pcBalance) {
    return new BigNumber(0);
  }

  if (
    fromCoinMint === poolInfo.poolCoinMint &&
    toCoinMint === poolInfo.poolPcMint
  ) {
    // outcoin is pc
    return fromAmount.multipliedBy(price).multipliedBy(percent);
  }

  if (
    fromCoinMint === poolInfo.poolPcMint &&
    toCoinMint === poolInfo.poolCoinMint
  ) {
    // outcoin is coin
    return fromAmount.dividedBy(percent).dividedBy(price);
  }

  return new BigNumber(0);
};

export const getDepositOut = async ({
  connection,
  uiAmountTokenA,
  slippage,
  poolLabel,
}: {
  connection: Connection;
  wallet: SignerWalletAdapter;
  uiAmountTokenA: number;
  slippage: number;
  poolLabel: string;
}) => {
  const pool = getPoolByLabel(poolLabel);
  const amount = new BigNumber(uiAmountTokenA.toString());
  const lpSup = await connection.getTokenSupply(new PublicKey(pool.poolMint));
  const lpSupply = uiAmountToNativeBigN(
    lpSup.value.amount,
    lpSup.value.decimals,
  );

  const coin = await connection.getTokenAccountBalance(
    new PublicKey(pool.poolCoinTokenAccount),
  );
  const coinBalance = uiAmountToNativeBigN(
    coin.value.amount,
    coin.value.decimals,
  );

  const pc = await connection.getTokenAccountBalance(
    new PublicKey(pool.poolPcTokenAccount),
  );
  const pcBalance = uiAmountToNativeBigN(pc.value.amount, pc.value.decimals);

  const coinAddress = pool.poolCoinMint;
  const pcAddress = pool.poolPcMint;

  const outAmount = getOutAmount(
    pool,
    amount.toString(),
    coinAddress,
    pcAddress,
    slippage,
    coinBalance,
    pcBalance,
  );
  // Bruh
  const lpReceived =
    Math.floor(
      ((amount.toNumber() * Math.pow(10, pool.poolCoinDecimal)) /
        coinBalance.toNumber()) *
        lpSupply.toNumber(),
    ) / Math.pow(10, pool.poolMintDecimal);
  const amountOut =
    Math.floor(outAmount.toNumber() * Math.pow(10, pool.poolPcDecimal)) /
    Math.pow(10, pool.poolPcDecimal);
  return {
    amountIn: uiAmountTokenA,
    amountOut,
    lpReceived,
  };
};

export const poolLabels = Object.keys(PoolList);

export const getPoolByLabel = (label: string) => PoolList[label];

export const getPoolLabelByPoolMint = (mint: string) => {
  const [label] = Object.entries(PoolList).find(
    ([, data]) => data.poolMint === mint,
  ) ?? ['not found'];
  return label;
};

export const depositAllTokenTypesItx = async ({
  connection,
  liquidityPool,
  uiAmountTokenA,
  uiAmountTokenB,
  uiAmountTokenLP,
  userTransferAuthority,
  wallet,
}: {
  connection: Connection;
  liquidityPool: string;
  uiAmountTokenA: number;
  uiAmountTokenB: number;
  uiAmountTokenLP: number;
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
    wallet: userTransferAuthority,
  });
  if (!lifinityTokenAccount || !lifinityMetaAccount)
    throw new Error('Wallet does not hold Lifinity Igniter');

  const itx = program.instruction.depositAllTokenTypes(
    uiAmountToNativeBN(uiAmountTokenLP, pool.poolMintDecimal),
    uiAmountToNativeBN(uiAmountTokenA, pool.poolCoinDecimal),
    uiAmountToNativeBN(uiAmountTokenB, pool.poolPcDecimal),
    {
      accounts: {
        amm: new PublicKey(pool.amm),
        authority,
        userTransferAuthorityInfo: userTransferAuthority,
        sourceAInfo,
        sourceBInfo,
        tokenA: new PublicKey(pool.poolCoinTokenAccount),
        tokenB: new PublicKey(pool.poolPcTokenAccount),
        poolMint: new PublicKey(pool.poolMint),
        destination,
        tokenProgram: TOKEN_PROGRAM_ID,
        configAccount: new PublicKey(pool.configAccount),
        holderAccountInfo: userTransferAuthority,
        lifinityNftAccount: new PublicKey(lifinityTokenAccount),
        lifinityNftMetaAccount: new PublicKey(lifinityMetaAccount),
      },
      instructions: [],
      signers: [],
    },
  );

  return itx;
};
