import {
  makeCreateMangoAccountInstruction,
  makeDepositInstruction,
  PublicKey,
  BN,
} from '@blockworks-foundation/mango-client'
import {
  getInstructionDataFromBase64,
  getNativeTreasuryAddress,
  serializeInstructionToBase64,
} from '@solana/spl-governance'
import { fmtMintAmount } from '@tools/sdk/units'
import { ConnectionContext } from '@utils/connection'
import tokenService from '@utils/services/token'
import { GovernedTokenAccount, tryGetMint } from '@utils/tokens'
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
        ? await getPositionForMint(market, connection, filteredTokenGov)
        : 0
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
        handledMint: info?.address || '',
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
  connection: ConnectionContext,
  filteredTokenGov: GovernedTokenAccount[]
) => {
  let deposited = 0
  for (let i = 0; i < filteredTokenGov.length; i++) {
    const group = market!.group!
    const groupConfig = market!.groupConfig!
    const depositIndex = group.tokens.findIndex(
      (x) =>
        x.mint.toBase58() === filteredTokenGov[i]!.mint!.publicKey.toBase58()
    )
    const [mangoAccountPk] = await PublicKey.findProgramAddress(
      [
        group.publicKey.toBytes(),
        filteredTokenGov[i].governance!.pubkey.toBytes(),
        accountNumBN.toArrayLike(Buffer, 'le', 8),
      ],
      groupConfig.mangoProgramId
    )
    const account = await tryGetMangoAccount(market, mangoAccountPk)
    if (account) {
      const deposit = account?.deposits[depositIndex]
      const mintInfo = await tryGetMint(
        connection.current,
        new PublicKey(filteredTokenGov[i]!.mint!.publicKey.toBase58())
      )
      if (mintInfo && !deposit?.isZero()) {
        const currentDepositAmount = account
          ?.getUiDeposit(
            market.cache!.rootBankCache[depositIndex],
            group,
            depositIndex
          )
          .toNumber()
        deposited += currentDepositAmount ? currentDepositAmount : 0
      }
    }
  }
  return deposited
}

const HandleMangoDeposit: HandleCreateProposalWithStrategy = async (
  rpcContext,
  handledMint,
  mintAmount,
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
    new BN(mintAmount)
  )
  const instructionData1 = {
    data: getInstructionDataFromBase64(
      serializeInstructionToBase64(createMangoAccountIns)
    ),
    holdUpTime: matchedTreasury.governance!.account!.config
      .minInstructionHoldUpTime,
    prerequisiteInstructions: [...prerequisiteInstructions],
    splitToChunkByDefault: true,
  }
  const instructionData2 = {
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
    new BN(mintAmount)
  )
  const acc = await rpcContext.connection.getAccountInfo(
    mangoAccountPk,
    'processed'
  )
  const insts: InstructionDataWithHoldUpTime[] = []
  if (!acc) {
    insts.push(instructionData1)
  }
  insts.push(instructionData2)
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
