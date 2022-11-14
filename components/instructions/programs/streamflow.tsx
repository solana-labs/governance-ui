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

export const formatPeriodOfTime = (period: number): string => {
  if (!period) return '0 seconds'

  const years = period / PERIOD.YEAR
  if (Math.floor(years)) return years > 1 ? `${years} years` : 'year'

  const months = period / PERIOD.MONTH
  if (Math.floor(months))
    return months > 1
      ? `${months.toFixed(DEFAULT_DECIMAL_PLACES)} months`
      : 'month'

  const weeks = period / PERIOD.WEEK
  if (Math.floor(weeks)) return weeks > 1 ? `${weeks} weeks` : 'week'

  const days = period / PERIOD.DAY
  if (Math.floor(days)) return days > 1 ? `${days} days` : 'day'

  const hours = period / PERIOD.HOUR
  if (Math.floor(hours)) return hours > 1 ? `${hours} hours` : 'hour'

  const minutes = period / PERIOD.MINUTE
  if (Math.floor(minutes)) return minutes > 1 ? `${minutes} minutes` : 'minute'

  const seconds = period / PERIOD.SECOND
  if (Math.floor(seconds)) return seconds > 1 ? `${seconds} seconds` : 'second'

  return ''
}

function deserializeStreamInformationFromData(
  data: Uint8Array,
  mintMetadataDecimals: number
): {
  start: number
  amountDeposited: number
  releaseFrequency: number
  releaseAmount: number
  amountAtCliff: number
  cancelable: boolean
  recipient: PublicKey
} {
  // - Follows UnckeckedStreamLayout
  // - Needs to add extra +8 bytes for header
  // - All numbers are stored in little endian
  const start = new BN(data.slice(8, 16), 'le').toNumber()
  const amountDeposited = getNumberFromBN(
    new BN(data.slice(16, 24), 'le'),
    mintMetadataDecimals
  )
  const releaseFrequency = new BN(data.slice(24, 32), 'le').toNumber()
  const releaseAmount = getNumberFromBN(
    new BN(data.slice(32, 40), 'le'),
    mintMetadataDecimals
  )
  const amountAtCliff = getNumberFromBN(
    new BN(data.slice(48, 56), 'le'),
    mintMetadataDecimals
  )
  const cancelable = Boolean(data.slice(56, 57)[0])
  const recipient = new PublicKey(data.slice(134, 166))

  return {
    start,
    amountDeposited,
    releaseFrequency,
    releaseAmount,
    amountAtCliff,
    cancelable,
    recipient,
  }
}

export interface TokenMintMetadata {
  readonly decimals: number
  readonly symbol: string
}

export function getMintMetadata(tokenMintPk: PublicKey): TokenMintMetadata {
  const tokenMintAddress = tokenMintPk.toBase58()
  const tokenInfo = tokenService.getTokenInfo(tokenMintAddress)

  if (!tokenInfo) {
    return MINT_METADATA[tokenMintAddress]
  }

  return {
    decimals: tokenInfo.decimals,
    symbol: tokenInfo.symbol,
  }
}

// Mint metadata for Well known tokens displayed on the instruction card
export const MINT_METADATA = {
  Gssm3vfi8s65R31SBdmQRq6cKeYojGgup7whkw4VCiQj: { symbol: 'STRM', decimals: 9 },
}

function decodeStream(stream: Stream, mintMetadataDecimals: number) {
  return {
    start: stream.start,
    amountDeposited: getNumberFromBN(
      stream.depositedAmount,
      mintMetadataDecimals
    ),
    releaseFrequency: stream.period,
    releaseAmount: getNumberFromBN(
      stream.amountPerPeriod,
      mintMetadataDecimals
    ),
    amountAtCliff: getNumberFromBN(stream.cliffAmount, mintMetadataDecimals),
    cancelable: stream.cancelableBySender,
    recipient: new PublicKey(stream.recipient),
  }
}

async function getStreamCreateDataUI(
  connection: Connection,
  data: Uint8Array,
  accounts: AccountMetaData[]
) {
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
    const { decimals } = mintMetadata

    const {
      start,
      amountDeposited,
      releaseFrequency,
      releaseAmount,
      amountAtCliff,
      cancelable,
      recipient,
    } = isExecuted
      ? decodeStream(stream, decimals)
      : // stream not yet initialized -> we deserialize from instruction data
        deserializeStreamInformationFromData(data, decimals)

    const withdrawn = getNumberFromBN(stream.withdrawnAmount, decimals)
    const unlockedPercent = Math.round((withdrawn / amountDeposited) * 100)

    return (
      <div>
        <div>
          <span>Recipient:</span>
          <span className="ml-2">{recipient.toBase58()}</span>
        </div>

        <span className="text-orange mt-2">
          RECIPIENT SHOULD BE THE WALLET, NOT THE ASSOCIATED TOKEN ACCOUNT
        </span>

        <div className="mt-4">
          <span>Start:</span>
          {start == 0 && 'On approval'}
          {start > 0 && (
            <span className="ml-2">
              {new Date(start * 1_000 /* second to ms */).toISOString()} UTC
            </span>
          )}
        </div>

        <div>
          <span>Amount:</span>
          <span className="ml-2">
            {amountDeposited} {mintMetadata.symbol}
          </span>
        </div>

        <div>
          <span>Unlocked every:</span>
          <span className="ml-2">{formatPeriodOfTime(releaseFrequency)}</span>
        </div>
        <div>
          <span>Release amount:</span>
          <span className="ml-2">
            {releaseAmount} {mintMetadata.symbol}
          </span>
        </div>
        <div>
          <span>Released at start:</span>
          <span className="ml-2">{amountAtCliff}</span>
        </div>
        <div>
          <span>Contract is cancelable:</span>
          <span className="ml-2">{cancelable ? 'Yes' : 'No'}</span>
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
}

export const STREAMFLOW_INSTRUCTIONS = {
  strmRqUCoQUgGUan5YhzUZa6KqdzwX5L6FpUxfmKg5m: {
    0: {
      name: 'Streamflow: Create',
      accounts: [
        { name: 'Payer treasury', important: true },
        { name: 'Governed treasury', important: true },
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
      getDataUI: getStreamCreateDataUI,
    },
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
      getDataUI: getStreamCreateDataUI,
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
        _data: Uint8Array,
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
                <span className="ml-2"> {contractMetadata.toBase58()}</span>
              </div>

              <div>
                <span>Recipient:</span>
                <span className="ml-2"> {recipient.toBase58()}</span>
              </div>
              <div>
                <span>Total withdrawn:</span>
                <span className="ml-2">
                  {withdrawn} {mintMetadata.symbol}
                </span>
              </div>
              <div>
                <span>Amount to be returned:</span>
                <span className="ml-2">
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
