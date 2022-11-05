import { Connection, PublicKey } from '@solana/web3.js'
import { AccountMetaData } from '@solana/spl-governance'
import BN from 'bn.js'

import tokenService from '@utils/services/token'
import VoteResultsBar from '@components/VoteResultsBar'
import {
  StreamClient,
  Cluster,
  getNumberFromBN,
  Stream,
} from '@streamflow/stream'
import { PERIOD } from 'pages/dao/[symbol]/proposal/components/instructions/Streamflow/CreateStream'

export const DEFAULT_DECIMAL_PLACES = 2

export const formatAmount = (
  amount: number,
  decimals: number,
  decimalPlaces?: number
) => amount.toFixed(decimalPlaces || decimals)

export const roundAmount = (
  amount: number,
  decimalPlaces = DEFAULT_DECIMAL_PLACES
) => {
  const tens = 10 ** decimalPlaces
  return Math.round(amount * tens) / tens
}

const isMoreThanOne = (amount: number) => (amount > 1 ? 's' : '')

export const formatPeriodOfTime = (period: number): string => {
  if (!period) return '0 seconds'
  const years = period / PERIOD.YEAR
  if (Math.floor(years))
    return `${years > 1 ? years : ''} year${isMoreThanOne(years)}`

  const months = period / PERIOD.MONTH
  if (Math.floor(months))
    return `${
      months > 1 ? formatAmount(months, 0, DEFAULT_DECIMAL_PLACES) : ''
    } month${isMoreThanOne(months)}`

  const weeks = period / PERIOD.WEEK
  if (Math.floor(weeks))
    return `${weeks > 1 ? weeks : ''} week${isMoreThanOne(weeks)}`

  const days = period / PERIOD.DAY
  if (Math.floor(days))
    return `${days > 1 ? days : ''} day${isMoreThanOne(days)}`

  const hours = period / PERIOD.HOUR
  if (Math.floor(hours))
    return `${hours > 1 ? hours : ''} hour${isMoreThanOne(hours)}`

  const minutes = period / PERIOD.MINUTE
  if (Math.floor(minutes))
    return `${minutes > 1 ? minutes : ''} minute${isMoreThanOne(minutes)}`

  const seconds = period / PERIOD.SECOND
  if (Math.floor(seconds))
    return `${seconds > 1 ? seconds : ''} second${isMoreThanOne(seconds)}`

  return ''
}

function deserStream(
  data: Uint8Array,
  stream: Stream,
  decimals
): {
  start: number
  amountDeposited: number
  releaseFrequency: number
  releaseAmount: number
  amountAtCliff: number
  cancelable: boolean
} {
  if (stream.createdAt > 0) {
    return {
      start: stream.start,
      amountDeposited: getNumberFromBN(stream.depositedAmount, decimals),
      releaseFrequency: stream.period,
      releaseAmount: getNumberFromBN(stream.amountPerPeriod, decimals),
      amountAtCliff: getNumberFromBN(stream.cliffAmount, decimals),
      cancelable: stream.cancelableBySender,
    }
  }
  // stream not yet initialized -> we deserialize from instruction data
  const start = new BN(data.slice(8, 16), 'le').toNumber()
  const amountDeposited = getNumberFromBN(
    new BN(data.slice(16, 24), 'le'),
    decimals
  )
  const releaseFrequency = new BN(data.slice(24, 32), 'le').toNumber()
  const releaseAmount = getNumberFromBN(
    new BN(data.slice(32, 40), 'le'),
    decimals
  )
  const amountAtCliff = getNumberFromBN(
    new BN(data.slice(48, 56), 'le'),
    decimals
  )
  const cancelable = Boolean(data.slice(56, 57)[0])
  return {
    start,
    amountDeposited,
    releaseFrequency,
    releaseAmount,
    amountAtCliff,
    cancelable,
  }
}

export interface TokenMintMetadata {
  readonly decimals: number
  readonly symbol: string
}

// Mint metadata for Well known tokens displayed on the instruction card
export const MINT_METADATA = {
  Gssm3vfi8s65R31SBdmQRq6cKeYojGgup7whkw4VCiQj: { symbol: 'STRM', decimals: 9 },
}

export function getMintMetadata(
  tokenMintPk: PublicKey | undefined
): TokenMintMetadata {
  const tokenMintAddress = tokenMintPk ? tokenMintPk.toBase58() : ''
  const tokenInfo = tokenMintAddress
    ? tokenService.getTokenInfo(tokenMintAddress)
    : null
  return tokenInfo
    ? {
        name: tokenInfo.symbol,
        decimals: tokenInfo.decimals,
        address: tokenInfo.address,
      }
    : MINT_METADATA[tokenMintAddress]
}

export const STREAMFLOW_INSTRUCTIONS = {
  strmRqUCoQUgGUan5YhzUZa6KqdzwX5L6FpUxfmKg5m: {
    174: {
      name: 'Streamflow: Create',
      accounts: [
        { name: 'Payer treasury', important: true },
        { name: 'Token treasury', important: true },
        { name: 'Contract metadata' },
        { name: 'PDA Token account' },
        { name: 'Liquidator' },
        { name: 'Mint' },
        { name: 'Streamflow treasury' },
        { name: 'Rent' },
        { name: 'Streamflow program' },
        { name: 'Token program' },
        { name: 'System program' },
      ],
      getDataUI: async (
        connection: Connection,
        data: Uint8Array,
        accounts: AccountMetaData[]
      ) => {
        try {
          const cli = new StreamClient(
            connection.rpcEndpoint,
            Cluster.Devnet, //add option to client to attach connection
            undefined,
            accounts[0].pubkey.toBase58()
          )

          const hasExplicitPayer = accounts.length === 12
          const metadataIndex = hasExplicitPayer ? 3 : 2
          const mintIndex = hasExplicitPayer ? 6 : 5

          const contractMetadata = accounts[metadataIndex].pubkey
          const mint = accounts[mintIndex].pubkey
          const stream = await cli.getOne(contractMetadata.toBase58())
          const isExecuted = stream.createdAt > 0
          const mintMetadata = getMintMetadata(mint)
          const decimals = mintMetadata.decimals
          const streamData = deserStream(data, stream, decimals)
          const withdrawn = getNumberFromBN(stream.withdrawnAmount, decimals)
          const unlockedPercent = Math.round(
            (withdrawn / streamData.amountDeposited) * 100
          )

          return (
            <div>
              <div>
                <span>Start:</span>
                {streamData.start == 0 && ' On approval '}
                {streamData.start > 0 && (
                  <span>
                    {' '}
                    {new Date(streamData.start * 1000).toISOString()} UTC
                  </span>
                )}
              </div>

              <div>
                <span>Amount:</span>
                <span>
                  {' '}
                  {streamData.amountDeposited} {mintMetadata.symbol}
                </span>
              </div>
              <div>
                <span>Unlocked every:</span>
                <span> {formatPeriodOfTime(streamData.releaseFrequency)}</span>
              </div>
              <div>
                <span>Release amount:</span>
                <span>
                  {' '}
                  {streamData.releaseAmount} {mintMetadata.symbol}
                </span>
              </div>
              <div>
                <span>Released at start:</span>
                <span> {streamData.amountAtCliff}</span>
              </div>
              <div>
                <span>Contract is cancelable:</span>
                <span> {streamData.cancelable ? 'Yes' : 'No'}</span>
              </div>
              <br></br>
              {isExecuted && (
                <div>
                  <span>Unlocked: {unlockedPercent}%</span>
                  <VoteResultsBar
                    approveVotePercentage={unlockedPercent}
                    denyVotePercentage={0}
                  />
                  <br></br>
                </div>
              )}
            </div>
          )
        } catch (error) {
          console.log(error)
          return <></>
        }
      },
    },
    232: {
      name: 'Streamflow: Cancel',
      accounts: [
        { name: 'Authority', important: true },
        { name: 'Payer treasury', important: true },
        { name: 'Token treasury' },
        { name: 'Recipient' },
        { name: 'Recipient Associated token account' },
        { name: 'Contract metadata' },
        { name: 'PDA Token account' },
        { name: 'Streamflow treasury' },
        { name: 'Streamflow treasury Associated token account' },
        { name: 'Partner' },
        { name: 'Partner treasury Associated token account' },
        { name: 'Mint' },
        { name: 'Token program' },
      ],
      getDataUI: async (
        connection: Connection,
        data: Uint8Array,
        accounts: AccountMetaData[]
      ) => {
        try {
          const cli = new StreamClient(
            connection.rpcEndpoint,
            Cluster.Devnet, //add option to client to attach connection
            undefined,
            accounts[1].pubkey.toBase58()
          )

          const contractMetadata = accounts[5].pubkey
          const stream = await cli.getOne(contractMetadata.toBase58())
          const mint = accounts[11].pubkey
          const mintMetadata = getMintMetadata(mint)
          const recipient = accounts[3].pubkey

          const withdrawn = getNumberFromBN(
            stream.withdrawnAmount,
            mintMetadata.decimals
          )
          const amountDeposited = getNumberFromBN(
            stream.depositedAmount,
            mintMetadata.decimals
          )

          return (
            <div>
              <div>
                <span>Stream ID:</span>

                <span> {contractMetadata.toBase58()}</span>
              </div>

              <div>
                <span>Recipient:</span>
                <span> {recipient.toBase58()}</span>
              </div>
              <div>
                <span>Total withdrawn:</span>
                <span>
                  {' '}
                  {withdrawn} {mintMetadata.symbol}
                </span>
              </div>
              <div>
                <span>Amount to be returned:</span>
                <span>
                  {' '}
                  {amountDeposited - withdrawn} {mintMetadata.symbol}
                </span>
              </div>
            </div>
          )
        } catch (error) {
          console.log(error)
          return <></>
        }
      },
    },
  },
}
