import {
  makeCreateMangoAccountInstruction,
  makeDepositInstruction,
  PublicKey,
  BN,
  makeSetDelegateInstruction,
} from '@blockworks-foundation/mango-client'
import {
  getInstructionDataFromBase64,
  getNativeTreasuryAddress,
  serializeInstructionToBase64,
} from '@solana/spl-governance'
import { fmtMintAmount } from '@tools/sdk/units'
import { ConnectionContext } from '@utils/connection'
import tokenService from '@utils/services/token'
import { GovernedTokenAccount } from '@utils/tokens'
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
export const accountNumBN = new BN(1)
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
export async function tvl(
  timestamp,
  market: MarketStore,
  connection: ConnectionContext,
  governedTokenAccountsWithoutNfts: GovernedTokenAccount[]
) {
  const protocolInfo = await tokenService.getTokenInfo(MANGO_MINT)
  const balances: TreasuryStrategy[] = []
  const stats = await axios.get(endpoint)
  const date = new Date(timestamp * 1000).getTime()
  for (const [mangoId, mangoTokens] of Object.entries(tokenList)) {
    const assetDeposits = stats.data.filter((s) => s.name === mangoId)

    if (assetDeposits.length > 0) {
      const info = tokenService.getTokenInfoFromCoingeckoId(mangoTokens)
      const filteredTokenGov = governedTokenAccountsWithoutNfts.filter(
        (x) => x.mint?.publicKey.toBase58() === info?.address
      )
      const currentPosition = info
        ? await getPositionForMint(market, filteredTokenGov)
        : 0
      const closestVal = findClosestToDate(assetDeposits, date)
      const handledMint = info?.address || ''
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
        handledMint:
          handledMint === MANGO_MINT && connection.cluster === 'devnet'
            ? MANGO_MINT_DEVNET
            : handledMint,
        handledTokenImgSrc: info?.logoURI || '',
        protocolLogoSrc: protocolInfo?.logoURI || '',
        strategyName: 'Deposit',
        currentPosition: new BN(currentPosition),
        strategyDescription: 'Description',
        isGenericItem: false,
        createProposalFcn: HandleMangoDeposit,
      })
    }
  }

  return balances
}

const getPositionForMint = async (
  market: MarketStore,
  filteredTokenGov: GovernedTokenAccount[]
) => {
  let deposited = 0
  for (let i = 0; i < filteredTokenGov.length; i++) {
    const group = market!.group!
    const depositIndex = group.tokens.findIndex(
      (x) =>
        x.mint.toBase58() === filteredTokenGov[i]!.mint!.publicKey.toBase58()
    )
    const accounts = await tryGetMangoAccountsForOwner(
      market,
      filteredTokenGov[i].governance!.pubkey
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
  const group = market!.group!
  const groupConfig = market!.groupConfig!
  const rootBank = group.tokens.find(
    (x) => x.mint.toBase58() === matchedTreasury.mint?.publicKey.toBase58()
  )?.rootBank
  const quoteRootBank =
    group.rootBankAccounts[group.getRootBankIndex(rootBank!)]
  const quoteNodeBank = quoteRootBank?.nodeBankAccounts[0]

  const [mangoAccountPk] = await PublicKey.findProgramAddress(
    [
      group.publicKey.toBytes(),
      matchedTreasury.governance!.pubkey.toBytes(),
      accountNumBN.toArrayLike(Buffer, 'le', 8),
    ],
    groupConfig.mangoProgramId
  )

  const solAddress = await getNativeTreasuryAddress(
    realm!.owner,
    matchedTreasury!.governance!.pubkey
  )
  const createMangoAccountIns = makeCreateMangoAccountInstruction(
    groupConfig.mangoProgramId,
    groupConfig.publicKey,
    mangoAccountPk,
    matchedTreasury.governance!.pubkey,
    accountNumBN,
    solAddress
  )
  const depositMangoAccountIns = makeDepositInstruction(
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
  const delegateMangoAccount = makeSetDelegateInstruction(
    groupConfig.mangoProgramId,
    groupConfig.publicKey,
    mangoAccountPk,
    matchedTreasury.governance!.pubkey,
    new PublicKey(form.delegateAddress)
  )
  const depositMangoAccountInsObj = {
    data: getInstructionDataFromBase64(
      serializeInstructionToBase64(depositMangoAccountIns)
    ),
    holdUpTime: matchedTreasury.governance!.account!.config
      .minInstructionHoldUpTime,
    prerequisiteInstructions: [],
    chunkSplitByDefault: true,
  }
  const fmtAmount = fmtMintAmount(
    matchedTreasury.mint?.account,
    new BN(form.mintAmount)
  )
  const acc = await rpcContext.connection.getAccountInfo(
    mangoAccountPk,
    'processed'
  )
  const insts: InstructionDataWithHoldUpTime[] = []
  if (!acc) {
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
  if (form.delegateAddress) {
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
    `Deposit ${fmtAmount} ${
      tokenService.getTokenInfo(matchedTreasury.mint!.publicKey.toBase58())
        ?.symbol || 'tokens'
    } to Mango account`,
    '',
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
