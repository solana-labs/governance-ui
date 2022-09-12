import { LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js'
import {
  ProgramAccount,
  Realm,
  RpcContext,
  TokenOwnerRecord,
} from '@solana/spl-governance'
import { BN } from '@project-serum/anchor'
import { AssetAccount } from '@utils/uiTypes/assets'
import { ConnectionContext } from '@utils/connection'
import { VotingClient } from '@utils/uiTypes/VotePlugin'
import numbro from 'numbro'
import tokenService from '@utils/services/token'
import { Pool } from '@everlend/general-pool'
import axios from 'axios'

import {
  MARKET_MAIN,
  MARKET_DEV,
  ENDPOINT_MAIN,
  ENDPOINT_DEV,
} from './constants'
import { handleEverlendAction } from './depositTools'
import { SignerWalletAdapter } from '@solana/wallet-adapter-base'
import { deserialize } from '@everlend/common'
export const EVERLEND = 'Everlend'

async function getAPYs(isDev = false) {
  const api = axios.create({
    baseURL: isDev ? ENDPOINT_DEV : ENDPOINT_MAIN,
    timeout: 30000,
  })

  return api.get('apy')
}

async function getStrategies(connection: ConnectionContext) {
  const isDev = connection.cluster === 'devnet'
  const POOL_MARKET_PUBKEY = new PublicKey(isDev ? MARKET_DEV : MARKET_MAIN)

  try {
    const response = await Pool.findMany(connection.current, {
      poolMarket: POOL_MARKET_PUBKEY,
    })

    const apys = await getAPYs(isDev)

    const strategies = await Promise.all(
      response.map(async (pool) => {
        const {
          tokenMint,
          poolMint,
          tokenAccount,
          totalAmountBorrowed,
        } = pool.data
        const tokenInfo = tokenService.getTokenInfo(tokenMint.toString())
        const apy =
          apys.data.find((apy) => apy.token === tokenInfo?.symbol)?.supply_apy *
            100 ?? 0

        const tokenAccountBalance = await connection.current.getTokenAccountBalance(
          tokenAccount
        )
        const poolMintInfoRaw = await connection.current.getAccountInfo(
          poolMint
        )

        let poolMintInfoBuffer
        let poolMintInfo
        if (poolMintInfoRaw) {
          poolMintInfoBuffer = Buffer.from(poolMintInfoRaw?.data)
          poolMintInfo = deserialize(poolMintInfoBuffer)
        }

        const rateEToken = calcETokenRate(
          poolMintInfo.supply.toNumber(),
          Number(tokenAccountBalance.value.amount) +
            totalAmountBorrowed.toNumber()
        )

        return {
          handledMint: tokenMint.toString(),
          createProposalFcn: handleEverlendAction,
          protocolLogoSrc: '/realms/Everlend/img/logo.png',
          protocolName: 'Everlend',
          protocolSymbol: 'evd',
          isGenericItem: false,
          poolMint: poolMint.toString(),
          poolPubKey: pool.publicKey.toString(),
          strategyDescription: '',
          strategyName: 'Deposit',
          handledTokenSymbol: tokenInfo?.symbol,
          handledTokenImgSrc: tokenInfo?.logoURI,
          apy: apy.toFixed(2).concat('%'),
          rateEToken,
          decimals: poolMintInfo.decimals,
        }
      })
    )

    return strategies
  } catch (e) {
    console.error(e)
  }
}

export async function getEverlendStrategies(
  connection: ConnectionContext
): Promise<any> {
  const strategies = await getStrategies(connection)

  return strategies
}

export const lamportsToSol = (value: number): number => {
  return value / LAMPORTS_PER_SOL
}

export type CreateEverlendProposal = (
  rpcContext: RpcContext,
  form: {
    action: 'Deposit' | 'Withdraw'
    title: string
    description: string
    bnAmount: BN
    amountFmt: string
    poolPubKey: string
    tokenMint: string
    poolMint: string
  },
  realm: ProgramAccount<Realm>,
  matchedTreasury: AssetAccount,
  tokenOwnerRecord: ProgramAccount<TokenOwnerRecord>,
  governingTokenMint: PublicKey,
  proposalIndex: number,
  isDraft: boolean,
  connection: ConnectionContext,
  wallet: SignerWalletAdapter,
  client?: VotingClient
) => Promise<PublicKey>

export const calcETokenRate = (
  collateralTotalMintSupply: number,
  totalPoolSize: number
): number => {
  const rate = collateralTotalMintSupply / totalPoolSize

  return Number.isNaN(rate) || !Number.isFinite(rate) ? 1 : rate
}

export const calcUserTokenBalanceByPoolToken = (
  poolTokenAmount: number,
  tokenDecimals = 9,
  eTokenRate: number,
  ceil = true
): number => {
  const tokenBalanceRaw = poolTokenAmount / eTokenRate
  const decimalMultiplier = 10 ** tokenDecimals
  const tokenBalanceByDecimalMultiplier = tokenBalanceRaw * decimalMultiplier

  return (
    (ceil
      ? Math.ceil(tokenBalanceByDecimalMultiplier)
      : Math.round(tokenBalanceByDecimalMultiplier)) / decimalMultiplier
  )
}

export const convertToCurrency = (
  amount: number,
  rate: number,
  mantissa?: number
): number => {
  if (mantissa) {
    return Number(
      numbro(amount * rate).format({
        mantissa,
      })
    )
  }
  return amount * rate
}
