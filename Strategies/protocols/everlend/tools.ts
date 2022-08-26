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

    const strategies = response.map((pool) => {
      const { tokenMint, poolMint } = pool.data
      const tokenInfo = tokenService.getTokenInfo(tokenMint.toString())
      const apy =
        apys.data.find((apy) => apy.token === tokenInfo?.symbol)?.supply_apy *
          100 ?? 0
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
      }
    })

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
