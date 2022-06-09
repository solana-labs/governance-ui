import { BN } from '@project-serum/anchor'
import { 
  ProgramAccount,
  Realm,getInstructionDataFromBase64, RpcContext, serializeInstructionToBase64, TokenOwnerRecord } from '@solana/spl-governance'
import { ASSOCIATED_TOKEN_PROGRAM_ID, Token, TOKEN_PROGRAM_ID } from '@solana/spl-token'
import { PublicKey, TransactionInstruction } from '@solana/web3.js'
import { depositReserveLiquidityInstruction, redeemReserveCollateralInstruction } from '@solendprotocol/solend-sdk'
import { fmtMintAmount, getMintNaturalAmountFromDecimalAsBN } from '@tools/sdk/units'
import tokenService from '@utils/services/token'
import { createProposal, InstructionDataWithHoldUpTime } from 'actions/createProposal'
import axios from 'axios'
import { SolendStrategy } from 'Strategies/types/types'

import { VotingClient } from '@utils/uiTypes/VotePlugin'
import { AssetAccount } from '@utils/uiTypes/assets'
import { ConnectionContext } from '@utils/connection'

const MAINNET_PROGRAM = 'So1endDq2YkqhipRh3WViPa8hdiSpxWy6z3Z6tMCpAo'
const DEVNET_PROGRAM = 'ALend7Ketfx5bxh6ghsCDXAoDrhvEmsXT3cynB6aPLgx'

export const SOLEND = 'Solend'
const SOLEND_SYMBOL = 'SLND'
const SOLEND_PROTOCOL_LOGO_URI =
  'https://solend-image-assets.s3.us-east-2.amazonaws.com/1280-circle.png'

const SOLEND_ENDPOINT = 'https://api.solend.fi'

export type CreateSolendStrategyParams = (
  rpcContext: RpcContext,
  form: {
    title: string,
    description: string,
    action: 'Deposit' | 'Withdraw'
    amount: number,
    proposalCount: number,
    reserve: SolendSubStrategy,
  },
  realm: ProgramAccount<Realm>,
  treasuaryAccount: AssetAccount,
  tokenOwnerRecord: ProgramAccount<TokenOwnerRecord>,
  governingTokenMint: PublicKey,
  proposalIndex: number,
  isDraft: boolean,
  connection: ConnectionContext,
  client?: VotingClient
) => Promise<PublicKey>;

type Config = Array<MarketConfig>;

type MarketConfig = {
  name: string;
  isPrimary: boolean;
  description: string;
  creator: string;
  address: string;
  authorityAddress: string;
  reserves: Array<ReserveConfig>;
};

type ReserveConfig = {
  liquidityToken: {
    coingeckoID: string;
    decimals: number;
    logo: string;
    mint: string;
    name: string;
    symbol: string;
    volume24h: number;
  };
  pythOracle: string;
  switchboardOracle: string;
  address: string;
  collateralMintAddress: string;
  collateralSupplyAddress: string;
  liquidityAddress: string;
  liquidityFeeReceiverAddress: string;
  userSupplyCap: number;
};

type ReserveStat = {
  reserve: {
    lendingMarket: string,
    liquidity: {
      mintPubkey: string,
      mintDecimals: number,
      supplyPubkey: string,
      pythOracle: string,
      switchboardOracle: string,
      availableAmount: string,
      borrowedAmountWads: string,
      cumulativeBorrowRateWads: string,
      marketPrice: string
    },  
    collateral: {
        mintPubkey: string,
        mintTotalSupply: string,
        supplyPubkey: string
    },
  };
  rates: {
    supplyInterest: string,
    borrowInterest: string
  }
}

export type SolendSubStrategy = {
  marketAddress: string;
  marketName: string;
  reserveAddress: string;
  mintAddress: string;
  logo: string;
  symbol: string;
  decimals: number;
  liquidity: number;
  supplyApy: number;
  isPrimary: boolean;
  liquidityAddress: string,
  collateralMintAddress: string,
  marketAuthorityAddress: string,
}

export async function getReserveData(reserveIds: Array<string>): Promise<Array<ReserveStat>> {
  const stats = (
    await (
      await axios.get(
        `${SOLEND_ENDPOINT}/v1/reserves?ids=${reserveIds
          .join(',')}`
      )
    ).data
  ).results as Array<ReserveStat>;

  return stats;
}


export async function getReserve(): Promise<Config> {
  return await (
    await axios.get(`${SOLEND_ENDPOINT}/v1/markets/configs?scope=solend`)
  ).data
}

export async function getConfig(): Promise<Config> {
  return await (
    await axios.get(`${SOLEND_ENDPOINT}/v1/markets/configs?scope=solend`)
  ).data
}

export async function getReserves(): Promise<Config[0]['reserves']> {
  const config = await getConfig()
  const reserves = config.flatMap(market => market.reserves.map(reserve => ({
    marketName: market.name,
    marketDescription: market.description,
    marketAddress: market.address,
    marketPrimary: market.isPrimary,
    marketAuthorityAddress: market.authorityAddress,
    ...reserve,
  })))

  return reserves;
}

export async function getSolendStrategies() {
  const strats: SolendStrategy[] = []

  // method to fetch solend strategies
  const config = await getConfig()
  const reserves = config.flatMap(market => market.reserves.map(reserve => ({
    marketName: market.name,
    marketDescription: market.description,
    marketAddress: market.address,
    marketPrimary: market.isPrimary,
    marketAuthorityAddress: market.authorityAddress,
    ...reserve,
  })))

  const stats = await getReserveData(reserves.map(reserve => reserve.address));

  const mergedData = reserves.map((reserve ,index) => ({
    marketName: reserve.marketName.charAt(0).toUpperCase() + reserve.marketName.slice(1),
    marketAddress: reserve.marketAddress,
    reserveAddress: reserve.address,
    mintAddress: reserve.liquidityToken.mint,
    decimals: reserve.liquidityToken.decimals,
    liquidityAddress: reserve.liquidityAddress,
    collateralMintAddress: reserve.collateralMintAddress,
    marketAuthorityAddress: reserve.marketAuthorityAddress,
    isPrimary: reserve.marketPrimary,
    logo: reserve.liquidityToken.logo,
    symbol: reserve.liquidityToken.symbol,
    liquidity: Number(stats[index].reserve.liquidity.availableAmount) / (10 ** stats[index].reserve.liquidity.mintDecimals) * (Number(stats[index].reserve.liquidity.marketPrice) / 10 ** 18),
    supplyApy: Number(stats[index].rates.supplyInterest),
  })) as Array<SolendSubStrategy>
  
  const aggregatedData = mergedData.reduce((acc, reserve) => ({
    ...acc,
    [reserve.symbol]: (acc[reserve.symbol] ?? []).concat(reserve),
  }), {} as {
    [symbol: string]: typeof mergedData
  });

  for (const [symbol, reserves] of Object.entries(aggregatedData)) {
    const tokenData = reserves[0];
    const maxApy = Math.max(...reserves.map(reserve => reserve.supplyApy));
    const totalLiquidity = reserves.reduce((acc, reserve) => (acc + reserve.liquidity), 0)

    strats.push({
      liquidity: totalLiquidity,
      handledTokenSymbol: symbol,
      apy: reserves.length > 1 ? `Up to ${maxApy.toFixed(2)}%` : `${maxApy.toFixed(2)}%`,
      protocolName: SOLEND,
      protocolSymbol: SOLEND_SYMBOL,
      handledMint: tokenData.mintAddress,
      handledTokenImgSrc: tokenData.logo,
      protocolLogoSrc: SOLEND_PROTOCOL_LOGO_URI,
      strategyName: 'Deposit',
      strategyDescription:
        'Earn interest on your treasury assets by depositing into Solend.',
      isGenericItem: false,
      reserves: reserves,
      createProposalFcn: handleSolendAction,
    })
  }

  return strats
}

async function handleSolendAction(
  rpcContext: RpcContext,
  form: {
    action: 'Deposit' | 'Withdraw',
    title: string,
    description: string,
    amount: number,
    reserve: SolendSubStrategy,
  },
  realm: ProgramAccount<Realm>,
  matchedTreasury: AssetAccount,
  tokenOwnerRecord: ProgramAccount<TokenOwnerRecord>,
  governingTokenMint: PublicKey,
  proposalIndex: number,
  isDraft: boolean,
  connection: ConnectionContext,
  client?: VotingClient
) {
  const setupInstructions: TransactionInstruction[] = []
  const insts: InstructionDataWithHoldUpTime[] = []

  const slndProgramAddress =
    connection.cluster === 'mainnet'
      ? MAINNET_PROGRAM
      : DEVNET_PROGRAM

  const bnAmount = getMintNaturalAmountFromDecimalAsBN(
    form.amount,
    matchedTreasury.extensions.mint!.account.decimals,
  )

  const fmtAmount = fmtMintAmount(
    matchedTreasury.extensions.mint?.account,
    new BN(form.amount)
  )

  const ataDepositAddress = await Token.getAssociatedTokenAddress(
    ASSOCIATED_TOKEN_PROGRAM_ID,
    TOKEN_PROGRAM_ID,
    new PublicKey(form.reserve.collateralMintAddress),
    matchedTreasury!.extensions!.token!.account.owner,
    true
  )

  const liquidityWithdrawAddress = await Token.getAssociatedTokenAddress(
    ASSOCIATED_TOKEN_PROGRAM_ID,
    TOKEN_PROGRAM_ID,
    new PublicKey(form.reserve.collateralMintAddress),
    matchedTreasury!.extensions!.token!.account.owner,
    true
  )


  if (form.action === 'Deposit') {
    const depositAccountInfo = await connection.current.getAccountInfo(
      ataDepositAddress,
    );
    if (!depositAccountInfo) {
      // generate the instruction for creating the ATA
      const createAtaIx = Token.createAssociatedTokenAccountInstruction(
        ASSOCIATED_TOKEN_PROGRAM_ID,
        TOKEN_PROGRAM_ID,
        new PublicKey(form.reserve.collateralMintAddress),
        ataDepositAddress,
        matchedTreasury!.extensions!.token!.account.owner,
        rpcContext.walletPubkey
      )
      setupInstructions.push(createAtaIx)
    }
  } else {
    const withdrawAccountInfo = await connection.current.getAccountInfo(
      liquidityWithdrawAddress,
    );
    if (!withdrawAccountInfo) {
      // generate the instruction for creating the ATA
      const createAtaIx = Token.createAssociatedTokenAccountInstruction(
        ASSOCIATED_TOKEN_PROGRAM_ID,
        TOKEN_PROGRAM_ID,
        matchedTreasury.extensions.token?.publicKey!,
        liquidityWithdrawAddress,
        matchedTreasury!.extensions!.token!.account.owner,
        rpcContext.walletPubkey
      )
      setupInstructions.push(createAtaIx)
    }
  }

  const actionIx = form.action === 'Deposit' ? depositReserveLiquidityInstruction(
    bnAmount,
    matchedTreasury.extensions.token?.publicKey!,
    ataDepositAddress,
    new PublicKey(form.reserve.reserveAddress),
    new PublicKey(form.reserve.liquidityAddress),
    new PublicKey(form.reserve.collateralMintAddress),
    new PublicKey(form.reserve.marketAddress),
    new PublicKey(form.reserve.marketAuthorityAddress),
    matchedTreasury!.extensions!.token!.account.owner,
    new PublicKey(slndProgramAddress)
  ) : redeemReserveCollateralInstruction(
    bnAmount,
    ataDepositAddress,
    matchedTreasury.extensions.token?.publicKey!,
    new PublicKey(form.reserve.reserveAddress),
    new PublicKey(form.reserve.collateralMintAddress),
    new PublicKey(form.reserve.liquidityAddress),
    new PublicKey(form.reserve.marketAddress),
    new PublicKey(form.reserve.marketAuthorityAddress),
    matchedTreasury!.extensions!.token!.account.owner,
    new PublicKey(slndProgramAddress)
  );

  const depositSolendInsObj = {
    data: getInstructionDataFromBase64(
      serializeInstructionToBase64(
        actionIx
      )
    ),
    holdUpTime: matchedTreasury.governance!.account!.config
      .minInstructionHoldUpTime,
    prerequisiteInstructions: [...setupInstructions],
    chunkSplitByDefault: true,
  }
  insts.push(depositSolendInsObj)

  const proposalAddress = await createProposal(
    rpcContext,
    realm,
    matchedTreasury.governance!.pubkey,
    tokenOwnerRecord,
    form.title ||
      `${form.action} ${form.amount} ${
        tokenService.getTokenInfo(
          matchedTreasury.extensions.mint!.publicKey.toBase58()
        )?.symbol || 'tokens'
      } ${form.action ==='Deposit' ? 'into' : 'from'} the Solend ${form.reserve.name} pool`,
    form.description,
    governingTokenMint,
    proposalIndex,
    insts,
    isDraft,
    client
  )
  return proposalAddress
}
