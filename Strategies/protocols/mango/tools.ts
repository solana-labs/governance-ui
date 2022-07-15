import {
  makeCreateMangoAccountInstruction,
  makeDepositInstruction,
  PublicKey,
  BN,
  makeSetDelegateInstruction,
  MangoAccount,
} from '@blockworks-foundation/mango-client'
import {
  closeAccount,
  initializeAccount,
  WRAPPED_SOL_MINT,
} from '@project-serum/serum/lib/token-instructions'
import {
  getInstructionDataFromBase64,
  getNativeTreasuryAddress,
  serializeInstructionToBase64,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-governance'
import {
  Keypair,
  LAMPORTS_PER_SOL,
  SystemProgram,
  TransactionInstruction,
} from '@solana/web3.js'
import { syncNative } from '@solendprotocol/solend-sdk'
import { fmtMintAmount } from '@tools/sdk/units'
import { ConnectionContext } from '@utils/connection'
import tokenService from '@utils/services/token'
import {
  createProposal,
  InstructionDataWithHoldUpTime,
} from 'actions/createProposal'
import axios from 'axios'
import BigNumber from 'bignumber.js'
import { MarketStore } from 'Strategies/store/marketStore'
import {
  TreasuryStrategy,
  HandleCreateProposalWithStrategy,
} from 'Strategies/types/types'

//Symbol, coingeckoId
export const tokenList = {
  ETH: 'ethereum',
  BTC: 'bitcoin',
  SOL: 'solana',
  SRM: 'serum',
  USDC: 'usd-coin',
  USDT: 'tether',
  MNGO: 'mango-markets',
  RAY: 'raydium',
  COPE: 'cope',
  FTT: 'ftx-token',
  MSOL: 'msol',
  BNB: 'binance-coin',
  AVAX: 'avalanche',
  LUNA: 'terra-luna',
}
export const MANGO = 'Mango'
export const MANGO_MINT = 'MangoCzJ36AjZyKwVj3VnYU4GTonjfVEnJmvvWaxLac'
export const USDC_MINT = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'
export const MANGO_MINT_DEVNET = 'Bb9bsTQa1bGEtQ5KagGkvSHyuLqDWumFUcRqFusFNJWC'
export const MANGO_USDC_MINT_DEVNET =
  '8FRFC6MoGGkMFQwngccyu69VnYbzykGeez7ignHVAFSN'
export const tokenListFilter = Object.keys(tokenList).map((x) => {
  return {
    name: x,
    val: x,
  }
})

const endpoint =
  'https://mango-stats-v3.herokuapp.com/spot?mangoGroup=mainnet.1'

// Very inefficient
function findClosestToDate(values, date) {
  let min = values[0]
  for (const val of values) {
    const valDate = new Date(val.time).getTime()
    const minDate = new Date(min.time).getTime()
    if (Math.abs(valDate - date) < Math.abs(minDate - date)) {
      min = val
    }
  }
  if (Math.abs(new Date(min.time).getTime() - date) > 24 * 3600 * 1000) {
    return {
      totalDeposits: 0,
      totalBorrows: 0,
    }
  }
  return min
}

//method to fetch mango strategies
export async function tvl(timestamp, connection: ConnectionContext) {
  const protocolInfo = await tokenService.getTokenInfo(MANGO_MINT)
  const balances: TreasuryStrategy[] = []
  const stats = await axios.get(endpoint)
  const date = new Date(timestamp * 1000).getTime()
  for (const [mangoId, mangoTokens] of Object.entries(tokenList)) {
    const assetDeposits = stats.data.filter((s) => s.name === mangoId)

    if (assetDeposits.length > 0) {
      const info = tokenService.getTokenInfoFromCoingeckoId(mangoTokens)
      const handledMint =
        (info?.address === MANGO_MINT && connection.cluster === 'devnet'
          ? MANGO_MINT_DEVNET
          : info?.address === USDC_MINT && connection.cluster === 'devnet'
          ? MANGO_USDC_MINT_DEVNET
          : info?.address) || ''
      const closestVal = findClosestToDate(assetDeposits, date)
      balances.push({
        liquidity:
          (closestVal.totalDeposits - closestVal.totalBorrows) *
          closestVal.baseOraclePrice,
        handledTokenSymbol: info?.symbol || mangoId,
        apy: `${(
          (Math.pow(1 + closestVal.depositRate / 128, 128) - 1) *
          100
        ).toFixed(2)}%`,
        protocolName: MANGO,
        protocolSymbol: protocolInfo?.symbol || '',
        handledMint: handledMint,
        handledTokenImgSrc: info?.logoURI || '',
        protocolLogoSrc: protocolInfo?.logoURI || '',
        strategyName: 'Deposit',
        strategyDescription: 'Description',
        isGenericItem: false,
        createProposalFcn: HandleMangoDeposit,
      })
    }
  }

  return balances
}

export const calculateAllDepositsInMangoAccountsForMint = (
  accounts: MangoAccount[],
  mint: PublicKey,
  market: MarketStore
) => {
  let deposited = 0
  const group = market!.group
  const depositIndex =
    mint &&
    group?.tokens.findIndex((x) => x.mint.toBase58() === mint.toBase58())
  if (accounts?.length && typeof depositIndex !== 'undefined' && group) {
    const depositsWithAmountHiherThenZero = accounts
      .map((x) => x.deposits[depositIndex])
      .filter((x) => !x?.isZero())
    if (depositsWithAmountHiherThenZero.length) {
      const currentDepositAmount = accounts
        .map((x) =>
          x
            ?.getUiDeposit(
              market.cache!.rootBankCache[depositIndex],
              group,
              depositIndex
            )
            .toNumber()
        )
        .reduce((prev, next) => (prev += next), 0)
      deposited += currentDepositAmount ? currentDepositAmount : 0
    }
  }
  return deposited
}

const HandleMangoDeposit: HandleCreateProposalWithStrategy = async (
  rpcContext,
  handledMint,
  form,
  realm,
  matchedTreasury,
  tokenOwnerRecord,
  governingTokenMint,
  proposalIndex,
  prerequisiteInstructions,
  isDraft,
  market,
  client
) => {
  const fmtAmount = fmtMintAmount(
    matchedTreasury.extensions.mint?.account,
    new BN(form.mintAmount)
  )
  const decimalAmount = new BigNumber(form.mintAmount)
    .shiftedBy(-matchedTreasury.extensions.mint!.account.decimals)
    .toNumber()
  const group = market!.group!
  const groupConfig = market!.groupConfig!
  const rootBank = group.tokens.find(
    (x) =>
      x.mint.toBase58() ===
      matchedTreasury.extensions.mint?.publicKey.toBase58()
  )?.rootBank
  const quoteRootBank =
    group.rootBankAccounts[group.getRootBankIndex(rootBank!)]
  const quoteNodeBank = quoteRootBank?.nodeBankAccounts[0]
  const nextAccNumb = new BN(form.proposalCount)
  const mangoAccountPk =
    form.mangoAccountPk ||
    (
      await PublicKey.findProgramAddress(
        [
          group.publicKey.toBytes(),
          matchedTreasury.governance!.pubkey.toBytes(),
          nextAccNumb.toArrayLike(Buffer, 'le', 8),
        ],
        groupConfig.mangoProgramId
      )
    )[0]
  const solAddress = await getNativeTreasuryAddress(
    realm!.owner,
    matchedTreasury!.governance!.pubkey
  )
  let wrappedSolAccount: null | Keypair = null
  const insts: InstructionDataWithHoldUpTime[] = []
  const localPrequisteInstructions: TransactionInstruction[] = []
  if (matchedTreasury.isSol) {
    wrappedSolAccount = new Keypair()
    const lamports = decimalAmount * LAMPORTS_PER_SOL
    const space = 165
    const rent = await rpcContext.connection.getMinimumBalanceForRentExemption(
      space,
      'processed'
    )
    localPrequisteInstructions.push(
      SystemProgram.createAccount({
        fromPubkey: rpcContext.wallet.publicKey!,
        newAccountPubkey: wrappedSolAccount?.publicKey,
        lamports: rent,
        space: space,
        programId: TOKEN_PROGRAM_ID,
      }),
      initializeAccount({
        account: wrappedSolAccount?.publicKey,
        mint: WRAPPED_SOL_MINT,
        owner: matchedTreasury.governance.pubkey!,
      })
    )
    const transferIx = SystemProgram.transfer({
      fromPubkey: matchedTreasury.extensions.transferAddress!,
      toPubkey: wrappedSolAccount!.publicKey!,
      lamports: lamports,
    })
    const instructionData = {
      data: getInstructionDataFromBase64(
        serializeInstructionToBase64(transferIx)
      ),
      holdUpTime:
        matchedTreasury.governance!.account!.config.minInstructionHoldUpTime,
      prerequisiteInstructions: [...localPrequisteInstructions],
      prerequisiteInstructionsSigners: [wrappedSolAccount],
    }
    insts.push(instructionData)
    const syncIx = syncNative(wrappedSolAccount.publicKey!)
    const syncInst = {
      data: getInstructionDataFromBase64(serializeInstructionToBase64(syncIx)),
      holdUpTime:
        matchedTreasury.governance!.account!.config.minInstructionHoldUpTime,
      prerequisiteInstructions: [],
    }
    insts.push(syncInst)
  }
  const depositMangoAccountInsObj = {
    data: getInstructionDataFromBase64(
      serializeInstructionToBase64(
        makeDepositInstruction(
          groupConfig.mangoProgramId,
          groupConfig.publicKey,
          matchedTreasury.isSol
            ? matchedTreasury.governance.pubkey!
            : matchedTreasury.extensions.token!.account.owner!,
          group.mangoCache,
          mangoAccountPk,
          quoteRootBank!.publicKey,
          quoteNodeBank!.publicKey,
          quoteNodeBank!.vault,
          wrappedSolAccount?.publicKey ??
            matchedTreasury.extensions.transferAddress!,
          new BN(form.mintAmount)
        )
      )
    ),
    holdUpTime:
      matchedTreasury.governance!.account!.config.minInstructionHoldUpTime,
    prerequisiteInstructions: [],
    chunkSplitByDefault: true,
  }
  if (!form.mangoAccountPk) {
    const createMangoAccountIns = makeCreateMangoAccountInstruction(
      groupConfig.mangoProgramId,
      groupConfig.publicKey,
      mangoAccountPk,
      matchedTreasury.governance!.pubkey,
      nextAccNumb,
      solAddress
    )
    const instructionData = {
      data: getInstructionDataFromBase64(
        serializeInstructionToBase64(createMangoAccountIns)
      ),
      holdUpTime:
        matchedTreasury.governance!.account!.config.minInstructionHoldUpTime,
      prerequisiteInstructions: [...prerequisiteInstructions],
      splitToChunkByDefault: true,
    }
    insts.push(instructionData)
  }
  if (form.delegateAddress && form.delegateDeposit) {
    const delegateMangoAccount = makeSetDelegateInstruction(
      groupConfig.mangoProgramId,
      groupConfig.publicKey,
      mangoAccountPk,
      matchedTreasury.governance!.pubkey,
      new PublicKey(form.delegateAddress)
    )
    const instructionData = {
      data: getInstructionDataFromBase64(
        serializeInstructionToBase64(delegateMangoAccount)
      ),
      holdUpTime:
        matchedTreasury.governance!.account!.config.minInstructionHoldUpTime,
      prerequisiteInstructions: [],
      splitToChunkByDefault: true,
    }
    insts.push(instructionData)
  }
  insts.push(depositMangoAccountInsObj)
  if (wrappedSolAccount) {
    const instructionData = {
      data: getInstructionDataFromBase64(
        serializeInstructionToBase64(
          closeAccount({
            source: wrappedSolAccount.publicKey,
            destination: matchedTreasury.extensions.transferAddress,
            owner: matchedTreasury.governance.pubkey,
          })
        )
      ),
      holdUpTime:
        matchedTreasury.governance!.account!.config.minInstructionHoldUpTime,
      prerequisiteInstructions: [],
      splitToChunkByDefault: true,
    }
    insts.push(instructionData)
  }
  const proposalAddress = await createProposal(
    rpcContext,
    realm,
    matchedTreasury.governance!.pubkey,
    tokenOwnerRecord,
    form.title ||
      `Deposit ${fmtAmount} ${
        tokenService.getTokenInfo(
          matchedTreasury.extensions.mint!.publicKey.toBase58()
        )?.symbol || 'tokens'
      } to Mango account`,
    form.description,
    governingTokenMint,
    proposalIndex,
    insts,
    isDraft,
    client
  )
  return proposalAddress
}

export const tryGetMangoAccount = async (
  market: MarketStore,
  mangoAccountPk: PublicKey
) => {
  try {
    const account = await market.client?.getMangoAccount(
      mangoAccountPk,
      market.group!.dexProgramId
    )
    return account
  } catch (e) {
    return null
  }
}

export const tryGetMangoAccountsForOwner = async (
  market: MarketStore,
  ownerPk: PublicKey
) => {
  try {
    const accounts = await market.client?.getMangoAccountsForOwner(
      market.group!,
      ownerPk
    )
    return accounts
  } catch (e) {
    return null
  }
}

export const ASSET_TYPE = [
  {
    name: 'Token',
    value: 0,
  },
  {
    name: 'Perp',
    value: 1,
  },
]

export const MARKET_MODE = [
  {
    name: 'Default',
    value: 0,
  },
  {
    name: 'Active',
    value: 1,
  },
  {
    name: 'Close Only',
    value: 2,
  },
  {
    name: 'Force Close Only',
    value: 3,
  },
  {
    name: 'Inactive',
    value: 4,
  },
  {
    name: 'Swapping Spot Market',
    value: 5,
  },
]
