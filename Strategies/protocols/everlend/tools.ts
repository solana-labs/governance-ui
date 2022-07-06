import { PublicKey, Transaction, TransactionInstruction } from '@solana/web3.js'
import {
  getInstructionDataFromBase64,
  ProgramAccount,
  Realm,
  RpcContext,
  serializeInstructionToBase64,
  TokenOwnerRecord,
} from '@solana/spl-governance'
import { BN } from '@project-serum/anchor'
import { AssetAccount } from '@utils/uiTypes/assets'
import { ConnectionContext } from '@utils/connection'
import { VotingClient } from '@utils/uiTypes/VotePlugin'
import {
  createProposal,
  InstructionDataWithHoldUpTime,
} from 'actions/createProposal'
import tokenService from '@utils/services/token'
import {
  prepareDepositTx,
  prepareWithdrawalRequestTx,
  Pool,
} from '@everlend/general-pool'
import axios from 'axios'
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  Token,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token'
import { prepareSolDepositTx } from './preparedSolDepositTx'

const MARKET_MAIN = 'DzGDoJHdzUANM7P7V25t5nxqbvzRcHDmdhY51V6WNiXC'
const MARKET_DEV = '4yC3cUWXQmoyyybfnENpxo33hiNxUNa1YAmmuxz93WAJ'
const REGISTRY_DEV = '6KCHtgSGR2WDE3aqrqSJppHRGVPgy9fHDX5XD8VZgb61'
const REGISTRY_MAIN = 'UaqUGgMvVzUZLthLHC9uuuBzgw5Ldesich94Wu5pMJg'
const ENDPOINT_MAIN = 'https://api.everlend.finance/api/v1/'
const ENDPOINT_DEV = 'https://dev-api.everlend.finance/api/v1/'
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

export async function handleEverlendAction(
  rpcContext: RpcContext,
  form: {
    action: 'Deposit' | 'Withdraw'
    title: string
    description: string
    bnAmount: BN
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
  client?: VotingClient
) {
  const isSol = matchedTreasury.isSol
  const insts: InstructionDataWithHoldUpTime[] = []
  const owner = isSol
    ? matchedTreasury!.pubkey
    : matchedTreasury!.extensions!.token!.account.owner
  const REGISTRY = new PublicKey(
    connection.cluster === 'mainnet' ? REGISTRY_MAIN : REGISTRY_DEV
  )

  const ctokenATA = await Token.getAssociatedTokenAddress(
    ASSOCIATED_TOKEN_PROGRAM_ID,
    TOKEN_PROGRAM_ID,
    new PublicKey(form.tokenMint),
    owner,
    true
  )

  const liquidityATA = await Token.getAssociatedTokenAddress(
    ASSOCIATED_TOKEN_PROGRAM_ID,
    TOKEN_PROGRAM_ID,
    new PublicKey(form.poolMint),
    owner,
    true
  )

  const setupInsts: InstructionDataWithHoldUpTime[] = []
  const cleanupInsts: InstructionDataWithHoldUpTime[] = []

  if (form.action === 'Deposit') {
    const actionTx = await handleEverlendDeposit(
      Boolean(isSol),
      connection,
      owner,
      REGISTRY,
      form.poolPubKey,
      form.bnAmount,
      ctokenATA,
      liquidityATA
    )
    actionTx.instructions.map((instruction) => {
      insts.push({
        data: getInstructionDataFromBase64(
          serializeInstructionToBase64(instruction)
        ),
        holdUpTime: matchedTreasury.governance!.account!.config
          .minInstructionHoldUpTime,
        prerequisiteInstructions: [],
      })
    })
  } else if (form.action === 'Withdraw') {
    const { withdrawTx, closeIx } = await handleEverlendWithdraw(
      Boolean(isSol),
      connection,
      owner,
      REGISTRY,
      form.poolPubKey,
      form.bnAmount,
      liquidityATA,
      ctokenATA
    )

    withdrawTx.instructions.map((instruction) => {
      insts.push({
        data: getInstructionDataFromBase64(
          serializeInstructionToBase64(instruction)
        ),
        holdUpTime: matchedTreasury.governance!.account!.config
          .minInstructionHoldUpTime,
        prerequisiteInstructions: [],
        chunkSplitByDefault: true,
      })
    })

    if (closeIx) {
      cleanupInsts.push({
        data: getInstructionDataFromBase64(
          serializeInstructionToBase64(closeIx)
        ),
        holdUpTime: matchedTreasury.governance!.account!.config
          .minInstructionHoldUpTime,
        prerequisiteInstructions: [],
        chunkSplitByDefault: true,
      })
    }
  }

  const proposalAddress = await createProposal(
    rpcContext,
    realm,
    matchedTreasury.governance!.pubkey,
    tokenOwnerRecord,
    form.title,
    form.description,
    governingTokenMint,
    proposalIndex,
    [...setupInsts, ...insts, ...cleanupInsts],
    isDraft,
    client
  )
  return proposalAddress
}

async function handleEverlendDeposit(
  isSol: boolean,
  connection: ConnectionContext,
  owner: PublicKey,
  REGISTRY: PublicKey,
  poolPubKey: string,
  amount: BN,
  source: PublicKey,
  destination: PublicKey
) {
  let actionTx: Transaction
  if (isSol) {
    const { tx: depositTx } = await prepareSolDepositTx(
      { connection: connection.current, payerPublicKey: owner },
      new PublicKey(poolPubKey),
      REGISTRY,
      amount,
      source,
      destination
    )
    actionTx = depositTx
  } else {
    const { tx: depositTx } = await prepareDepositTx(
      { connection: connection.current, payerPublicKey: owner },
      new PublicKey(poolPubKey),
      REGISTRY,
      amount,
      source
    )
    actionTx = depositTx
  }
  return actionTx
}

async function handleEverlendWithdraw(
  isSol: boolean,
  connection: ConnectionContext,
  owner: PublicKey,
  REGISTRY: PublicKey,
  poolPubKey: string,
  amount: BN,
  source: PublicKey,
  destination: PublicKey
) {
  const { tx: withdrawslTx } = await prepareWithdrawalRequestTx(
    {
      connection: connection.current,
      payerPublicKey: owner,
    },
    new PublicKey(poolPubKey),
    REGISTRY,
    amount,
    source,
    isSol ? owner : undefined
  )
  const withdrawTx = withdrawslTx
  let closeIx: TransactionInstruction | undefined
  if (isSol) {
    const closeWSOLAccountIx = Token.createCloseAccountInstruction(
      TOKEN_PROGRAM_ID,
      destination,
      owner,
      owner,
      []
    )
    closeIx = closeWSOLAccountIx
  }

  return {
    withdrawTx,
    closeIx: closeIx ?? null,
  }
}

export async function getEverlendStrategies(
  connection: ConnectionContext
): Promise<any> {
  const strategies = await getStrategies(connection)

  return strategies
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
  client?: VotingClient
) => Promise<PublicKey>
