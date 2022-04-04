import {
  makeCreateMangoAccountInstruction,
  makeDepositInstruction,
  PublicKey,
  BN,
  makeSetDelegateInstruction,
  MangoAccount,
} from '@blockworks-foundation/mango-client'
import {
  getInstructionDataFromBase64,
  getNativeTreasuryAddress,
  serializeInstructionToBase64,
} from '@solana/spl-governance'
import { fmtMintAmount } from '@tools/sdk/units'
import { ConnectionContext } from '@utils/connection'
import tokenService from '@utils/services/token'
import {
  createProposal,
  InstructionDataWithHoldUpTime,
} from 'actions/createProposal'
import axios from 'axios'
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
export const MANGO_MINT_DEVNET = 'Bb9bsTQa1bGEtQ5KagGkvSHyuLqDWumFUcRqFusFNJWC'
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
  const group = market!.group!
  const depositIndex = group.tokens.findIndex(
    (x) => x.mint.toBase58() === mint.toBase58()
  )
  if (accounts?.length) {
    const depositsWithAmountHiherThenZero = accounts
      .map((x) => x.deposits[depositIndex])
      .filter((x) => !x.isZero())
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
    matchedTreasury.mint?.account,
    new BN(form.mintAmount)
  )
  const group = market!.group!
  const groupConfig = market!.groupConfig!
  const rootBank = group.tokens.find(
    (x) => x.mint.toBase58() === matchedTreasury.mint?.publicKey.toBase58()
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

  const depositMangoAccountInsObj = {
    data: getInstructionDataFromBase64(
      serializeInstructionToBase64(
        makeDepositInstruction(
          groupConfig.mangoProgramId,
          groupConfig.publicKey,
          matchedTreasury.governance!.pubkey,
          group.mangoCache,
          mangoAccountPk,
          quoteRootBank!.publicKey,
          quoteNodeBank!.publicKey,
          quoteNodeBank!.vault,
          matchedTreasury.transferAddress!,
          new BN(form.mintAmount)
        )
      )
    ),
    holdUpTime: matchedTreasury.governance!.account!.config
      .minInstructionHoldUpTime,
    prerequisiteInstructions: [],
    chunkSplitByDefault: true,
  }
  const insts: InstructionDataWithHoldUpTime[] = []
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
      holdUpTime: matchedTreasury.governance!.account!.config
        .minInstructionHoldUpTime,
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
      holdUpTime: matchedTreasury.governance!.account!.config
        .minInstructionHoldUpTime,
      prerequisiteInstructions: [],
      splitToChunkByDefault: true,
    }
    insts.push(instructionData)
  }
  insts.push(depositMangoAccountInsObj)
  const proposalAddress = await createProposal(
    rpcContext,
    realm,
    matchedTreasury.governance!.pubkey,
    tokenOwnerRecord,
    form.title ||
      `Deposit ${fmtAmount} ${
        tokenService.getTokenInfo(matchedTreasury.mint!.publicKey.toBase58())
          ?.symbol || 'tokens'
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
