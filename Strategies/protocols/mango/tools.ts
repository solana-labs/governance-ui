import { BN } from '@project-serum/anchor'
import { getInstructionDataFromBase64 } from '@solana/spl-governance'
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
        handledMint: info?.address || '',
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
  amount,
  realm,
  governance,
  tokenOwnerRecord,
  name,
  descriptionLink,
  governingTokenMint,
  proposalIndex,
  isDraft,
  client
) => {
  // sample of creating proposal with instruction
  const instructionData = {
    //TODO create mango deposit function using amount and mint

    // SAMPLE of serialized instruction that supply proposal
    //   const transferIx = Token.createTransferInstruction(
    //     TOKEN_PROGRAM_ID,
    //     sourceAccount,
    //     receiverAddress,
    //     governedTokenAccount.governance!.pubkey,
    //     [],
    //     new u64(mintAmount.toString())
    //   )
    //   const serializedInstruction = serializeInstructionToBase64(transferIx)
    //   data: getInstructionDataFromBase64(serializedInstruction),
    data: getInstructionDataFromBase64(''),
    holdUpTime: governance!.account!.config.minInstructionHoldUpTime,
    prerequisiteInstructions: [],
  }
  const proposalAddress = await createProposal(
    rpcContext,
    realm,
    governance.pubkey,
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
