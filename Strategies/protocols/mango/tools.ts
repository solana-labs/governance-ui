import {
  makeCreateMangoAccountInstruction,
  makeDepositInstruction,
  PublicKey,
  BN,
} from '@blockworks-foundation/mango-client'
import {
  getInstructionDataFromBase64,
  serializeInstructionToBase64,
} from '@solana/spl-governance'
import tokenService from '@utils/services/token'
import { createProposal } from 'actions/createProposal'
import axios from 'axios'
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
export async function tvl(timestamp) {
  const protocolInfo = await tokenService.getTokenInfo(MANGO_MINT)
  const balances: TreasuryStrategy[] = []
  const stats = await axios.get(endpoint)
  const date = new Date(timestamp * 1000).getTime()
  Object.entries(tokenList).map(([mangoId, mangoTokens]) => {
    const assetDeposits = stats.data.filter((s) => s.name === mangoId)
    if (assetDeposits.length > 0) {
      const info = tokenService.getTokenInfoFromCoingeckoId(mangoTokens)
      const closestVal = findClosestToDate(assetDeposits, date)
      balances.push({
        liquidity:
          (closestVal.totalDeposits - closestVal.totalBorrows) *
          closestVal.baseOraclePrice,
        handledTokenSymbol: info?.symbol || mangoId,
        apy: `${(
          Math.pow(1 + closestVal.depositRate / 100000, 100000) - 1
        ).toFixed(2)}%`,
        protocolName: MANGO,
        protocolSymbol: protocolInfo?.symbol || '',
        handledMint: '8FRFC6MoGGkMFQwngccyu69VnYbzykGeez7ignHVAFSN',
        handledTokenImgSrc: info?.logoURI || '',
        protocolLogoSrc: protocolInfo?.logoURI || '',
        strategyName: 'Deposit',
        //TODO handle getting current position
        currentPosition: new BN(0),
        strategyDescription: 'Description',
        isGenericItem: true,
        createProposalFcn: HandleMangoDeposit,
      })
    }
  })
  return balances
}

const HandleMangoDeposit: HandleCreateProposalWithStrategy = async (
  rpcContext,
  handledMint,
  mintAmount,
  realm,
  matchedTreasury,
  tokenOwnerRecord,
  name,
  descriptionLink,
  governingTokenMint,
  proposalIndex,
  isDraft,
  market,
  client
) => {
  const group = market!.group!
  const groupConfig = market!.groupConfig!
  const quoteCurrency = market!.quoteCurrency!
  const accountNumBN = new BN(1)
  const quoteRootBank =
    group.rootBankAccounts[group.getRootBankIndex(quoteCurrency.rootBank)]
  const quoteNodeBank =
    quoteRootBank?.nodeBankAccounts[
      group.tokens.findIndex(
        (x) => x.mint.toBase58() === matchedTreasury.mint?.publicKey.toBase58()
      )
    ]
  console.log(quoteRootBank)
  const [mangoAccountPk] = await PublicKey.findProgramAddress(
    [
      group.publicKey.toBytes(),
      matchedTreasury.governance!.pubkey.toBytes(),
      accountNumBN.toArrayLike(Buffer, 'le', 8),
    ],
    groupConfig.mangoProgramId
  )

  const createMangoAccountIns = makeCreateMangoAccountInstruction(
    groupConfig.mangoProgramId,
    groupConfig.publicKey,
    mangoAccountPk,
    matchedTreasury.governance!.pubkey,
    accountNumBN
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
  const serializedInstruction = serializeInstructionToBase64(
    depositMangoAccountIns
  )
  const instructionData = {
    data: getInstructionDataFromBase64(serializedInstruction),
    holdUpTime: matchedTreasury.governance!.account!.config
      .minInstructionHoldUpTime,
    prerequisiteInstructions: [createMangoAccountIns],
  }
  const proposalAddress = await createProposal(
    rpcContext,
    realm,
    matchedTreasury.governance!.pubkey,
    tokenOwnerRecord,
    name,
    descriptionLink,
    governingTokenMint,
    proposalIndex,
    [instructionData],
    isDraft,
    client
  )
  return proposalAddress
}
