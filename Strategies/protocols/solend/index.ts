import { BN } from '@project-serum/anchor'
import {
  ProgramAccount,
  Realm,
  getInstructionDataFromBase64,
  RpcContext,
  serializeInstructionToBase64,
  TokenOwnerRecord,
} from '@solana/spl-governance'
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  NATIVE_MINT,
  Token,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token'
import { PublicKey, SystemProgram } from '@solana/web3.js'
import {
  depositReserveLiquidityInstruction,
  redeemReserveCollateralInstruction,
  syncNative,
} from '@solendprotocol/solend-sdk'
import tokenService from '@utils/services/token'
import {
  createProposal,
  InstructionDataWithHoldUpTime,
} from 'actions/createProposal'
import axios from 'axios'
import { SolendStrategy } from 'Strategies/types/types'

import { VotingClient } from '@utils/uiTypes/VotePlugin'
import { AssetAccount } from '@utils/uiTypes/assets'
import { ConnectionContext } from '@utils/connection'
import BigNumber from 'bignumber.js'

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
    title: string
    description: string
    action: 'Deposit' | 'Withdraw'
    bnAmount: BN
    amountFmt: string
    proposalCount: number
    reserve: SolendSubStrategy
  },
  realm: ProgramAccount<Realm>,
  treasuaryAccount: AssetAccount,
  tokenOwnerRecord: ProgramAccount<TokenOwnerRecord>,
  governingTokenMint: PublicKey,
  proposalIndex: number,
  isDraft: boolean,
  connection: ConnectionContext,
  client?: VotingClient
) => Promise<PublicKey>

type Config = Array<MarketConfig>

type MarketConfig = {
  name: string
  isPrimary: boolean
  description: string
  creator: string
  address: string
  authorityAddress: string
  reserves: Array<ReserveConfig>
}

type ReserveConfig = {
  liquidityToken: {
    coingeckoID: string
    decimals: number
    logo: string
    mint: string
    name: string
    symbol: string
    volume24h: number
  }
  pythOracle: string
  switchboardOracle: string
  address: string
  collateralMintAddress: string
  collateralSupplyAddress: string
  liquidityAddress: string
  liquidityFeeReceiverAddress: string
  userSupplyCap: number
}

type ReserveStat = {
  reserve: {
    lendingMarket: string
    liquidity: {
      mintPubkey: string
      mintDecimals: number
      supplyPubkey: string
      pythOracle: string
      switchboardOracle: string
      availableAmount: string
      borrowedAmountWads: string
      cumulativeBorrowRateWads: string
      marketPrice: string
    }
    collateral: {
      mintPubkey: string
      mintTotalSupply: string
      supplyPubkey: string
    }
  }
  rates: {
    supplyInterest: string
    borrowInterest: string
  }
}

export type SolendSubStrategy = {
  marketAddress: string
  marketName: string
  reserveAddress: string
  mintAddress: string
  logo: string
  symbol: string
  decimals: number
  liquidity: number
  supplyApy: number
  isPrimary: boolean
  liquidityAddress: string
  collateralMintAddress: string
  marketAuthorityAddress: string
}

export async function getReserveData(
  reserveIds: Array<string>
): Promise<Array<ReserveStat>> {
  if (!reserveIds.length) return []

  const res = reserveIds.flat().reduce((acc, _curr, i) => {
    if (!(i % 50)) {
      acc.push(reserveIds.flat().slice(i, i + 50))
    }
    return acc
  }, [] as string[][])

  const stats = await Promise.all(
    res.map((reserveIds) =>
      axios.get(`${SOLEND_ENDPOINT}/v1/reserves?ids=${reserveIds.join(',')}`)
    )
  )

  return (await Promise.all(stats.map((stat) => stat.data))).flatMap(
    (stat) => stat.results
  )
}

export function cTokenExchangeRate(reserve: ReserveStat) {
  return new BigNumber(reserve.reserve.liquidity.availableAmount ?? '0')
    .plus(
      new BigNumber(reserve.reserve.liquidity.borrowedAmountWads).shiftedBy(-18)
    )
    .dividedBy(new BigNumber(reserve.reserve.collateral.mintTotalSupply))
    .toNumber()
}

export async function getReserve(): Promise<Config> {
  return await (
    await axios.get(`${SOLEND_ENDPOINT}/v1/markets/configs?scope=all`)
  ).data
}

export async function getReserves(): Promise<Config[0]['reserves']> {
  const config = await getReserve()
  const reserves = config.flatMap((market) =>
    market.reserves.map((reserve) => ({
      marketName: market.name,
      marketDescription: market.description,
      marketAddress: market.address,
      marketPrimary: market.isPrimary,
      marketAuthorityAddress: market.authorityAddress,
      ...reserve,
    }))
  )

  return reserves
}

export async function getSolendStrategies() {
  const strats: SolendStrategy[] = []

  // method to fetch solend strategies
  const config = await getReserve()
  const reserves = config.flatMap((market) =>
    market.reserves.map((reserve) => ({
      marketName: market.name,
      marketDescription: market.description,
      marketAddress: market.address,
      marketPrimary: market.isPrimary,
      marketAuthorityAddress: market.authorityAddress,
      ...reserve,
    }))
  )

  const stats = await getReserveData(reserves.map((reserve) => reserve.address))

  const mergedData = reserves.map((reserve, index) => ({
    marketName:
      reserve.marketName.charAt(0).toUpperCase() + reserve.marketName.slice(1),
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
    liquidity:
      (Number(stats[index].reserve.liquidity.availableAmount) /
        10 ** stats[index].reserve.liquidity.mintDecimals) *
      (Number(stats[index].reserve.liquidity.marketPrice) / 10 ** 18),
    supplyApy: Number(stats[index].rates.supplyInterest),
  })) as Array<SolendSubStrategy>

  const aggregatedData = mergedData.reduce(
    (acc, reserve) => ({
      ...acc,
      [reserve.symbol]: (acc[reserve.symbol] ?? []).concat(reserve),
    }),
    {} as {
      [symbol: string]: typeof mergedData
    }
  )

  for (const [symbol, reserves] of Object.entries(aggregatedData)) {
    const tokenData = reserves[0]
    const maxApy = Math.max(...reserves.map((reserve) => reserve.supplyApy))
    const totalLiquidity = reserves.reduce(
      (acc, reserve) => acc + reserve.liquidity,
      0
    )

    strats.push({
      liquidity: totalLiquidity,
      handledTokenSymbol: symbol,
      apy:
        reserves.length > 1
          ? `Up to ${maxApy.toFixed(2)}%`
          : `${maxApy.toFixed(2)}%`,
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
    action: 'Deposit' | 'Withdraw'
    title: string
    description: string
    bnAmount: BN
    reserve: SolendSubStrategy
    amountFmt: string
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
  const isSol = matchedTreasury.isSol
  const insts: InstructionDataWithHoldUpTime[] = []
  const owner = isSol
    ? matchedTreasury!.pubkey
    : matchedTreasury!.extensions!.token!.account.owner

  const slndProgramAddress =
    connection.cluster === 'mainnet' ? MAINNET_PROGRAM : DEVNET_PROGRAM

  const ctokenATA = await Token.getAssociatedTokenAddress(
    ASSOCIATED_TOKEN_PROGRAM_ID,
    TOKEN_PROGRAM_ID,
    new PublicKey(form.reserve.collateralMintAddress),
    owner,
    true
  )

  const liquidityATA = await Token.getAssociatedTokenAddress(
    ASSOCIATED_TOKEN_PROGRAM_ID,
    TOKEN_PROGRAM_ID,
    new PublicKey(form.reserve.mintAddress),
    owner,
    true
  )

  let createAtaInst

  if (form.action === 'Deposit') {
    const depositAccountInfo = await connection.current.getAccountInfo(
      ctokenATA
    )
    if (!depositAccountInfo) {
      // generate the instruction for creating the ATA
      createAtaInst = Token.createAssociatedTokenAccountInstruction(
        ASSOCIATED_TOKEN_PROGRAM_ID,
        TOKEN_PROGRAM_ID,
        new PublicKey(form.reserve.collateralMintAddress),
        ctokenATA,
        owner,
        owner
      )
    }
  } else {
    const withdrawAccountInfo = await connection.current.getAccountInfo(
      liquidityATA
    )
    if (!withdrawAccountInfo && !isSol) {
      // generate the instruction for creating the ATA
      createAtaInst = Token.createAssociatedTokenAccountInstruction(
        ASSOCIATED_TOKEN_PROGRAM_ID,
        TOKEN_PROGRAM_ID,
        matchedTreasury.extensions.token!.publicKey,
        liquidityATA,
        owner,
        owner
      )
    }
  }

  if (createAtaInst) {
    const createAtaInstObj = {
      data: getInstructionDataFromBase64(
        serializeInstructionToBase64(createAtaInst)
      ),
      holdUpTime: matchedTreasury.governance!.account!.config
        .minInstructionHoldUpTime,
      prerequisiteInstructions: [],
      chunkSplitByDefault: true,
    }
    insts.push(createAtaInstObj)
  }

  const setupInsts: InstructionDataWithHoldUpTime[] = []
  const cleanupInsts: InstructionDataWithHoldUpTime[] = []

  if (isSol) {
    const userWSOLAccountInfo = await connection.current.getAccountInfo(
      liquidityATA
    )

    const rentExempt = await Token.getMinBalanceRentForExemptAccount(
      connection.current
    )

    const sendAction = form.action === 'Deposit'

    const transferLamportsIx = SystemProgram.transfer({
      fromPubkey: owner,
      toPubkey: liquidityATA,
      lamports:
        (userWSOLAccountInfo ? 0 : rentExempt) +
        (sendAction ? form.bnAmount.toNumber() : 0),
    })

    const transferLamportInst = {
      data: getInstructionDataFromBase64(
        serializeInstructionToBase64(transferLamportsIx)
      ),
      holdUpTime: matchedTreasury.governance!.account!.config
        .minInstructionHoldUpTime,
      prerequisiteInstructions: [],
      chunkSplitByDefault: true,
    }

    setupInsts.push(transferLamportInst)

    const closeWSOLAccountIx = Token.createCloseAccountInstruction(
      TOKEN_PROGRAM_ID,
      liquidityATA,
      owner,
      owner,
      []
    )

    const closeWSOLInst = {
      data: getInstructionDataFromBase64(
        serializeInstructionToBase64(closeWSOLAccountIx)
      ),
      holdUpTime: matchedTreasury.governance!.account!.config
        .minInstructionHoldUpTime,
      prerequisiteInstructions: [],
      chunkSplitByDefault: true,
    }

    if (userWSOLAccountInfo) {
      const syncIx = syncNative(liquidityATA)
      const syncInst = {
        data: getInstructionDataFromBase64(
          serializeInstructionToBase64(syncIx)
        ),
        holdUpTime: matchedTreasury.governance!.account!.config
          .minInstructionHoldUpTime,
        prerequisiteInstructions: [],
        chunkSplitByDefault: true,
      }
      if (sendAction) {
        setupInsts.push(syncInst)
      } else {
        cleanupInsts.push(closeWSOLInst)
      }
    } else {
      const createUserWSOLAccountIx = Token.createAssociatedTokenAccountInstruction(
        ASSOCIATED_TOKEN_PROGRAM_ID,
        TOKEN_PROGRAM_ID,
        NATIVE_MINT,
        liquidityATA,
        owner,
        owner
      )
      const createUserWSOLAccountInst = {
        data: getInstructionDataFromBase64(
          serializeInstructionToBase64(createUserWSOLAccountIx)
        ),
        holdUpTime: matchedTreasury.governance!.account!.config
          .minInstructionHoldUpTime,
        prerequisiteInstructions: [],
        chunkSplitByDefault: true,
      }
      setupInsts.push(createUserWSOLAccountInst)
      cleanupInsts.push(closeWSOLInst)
    }
  }

  const actionIx =
    form.action === 'Deposit'
      ? depositReserveLiquidityInstruction(
          form.bnAmount,
          liquidityATA,
          ctokenATA,
          new PublicKey(form.reserve.reserveAddress),
          new PublicKey(form.reserve.liquidityAddress),
          new PublicKey(form.reserve.collateralMintAddress),
          new PublicKey(form.reserve.marketAddress),
          new PublicKey(form.reserve.marketAuthorityAddress),
          owner,
          new PublicKey(slndProgramAddress)
        )
      : redeemReserveCollateralInstruction(
          form.bnAmount,
          ctokenATA,
          liquidityATA,
          new PublicKey(form.reserve.reserveAddress),
          new PublicKey(form.reserve.collateralMintAddress),
          new PublicKey(form.reserve.liquidityAddress),
          new PublicKey(form.reserve.marketAddress),
          new PublicKey(form.reserve.marketAuthorityAddress),
          owner,
          new PublicKey(slndProgramAddress)
        )

  const depositSolendInsObj = {
    data: getInstructionDataFromBase64(serializeInstructionToBase64(actionIx)),
    holdUpTime: matchedTreasury.governance!.account!.config
      .minInstructionHoldUpTime,
    prerequisiteInstructions: [],
    chunkSplitByDefault: true,
  }
  insts.push(depositSolendInsObj)

  const proposalAddress = await createProposal(
    rpcContext,
    realm,
    matchedTreasury.governance!.pubkey,
    tokenOwnerRecord,
    form.title ||
      `${form.action} ${form.amountFmt} ${
        tokenService.getTokenInfo(
          matchedTreasury.extensions.mint!.publicKey.toBase58()
        )?.symbol || 'tokens'
      } ${form.action === 'Deposit' ? 'into' : 'from'} the Solend ${
        form.reserve.marketName
      } pool`,
    form.description,
    governingTokenMint,
    proposalIndex,
    [...setupInsts, ...insts, ...cleanupInsts],
    isDraft,
    client
  )
  return proposalAddress
}
