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
import Button from '@components/Button'

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
  console.log('YEAH HERE')
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

  const cancelable = Boolean(data.slice(56, 57))
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
  DcAwL38mreGvUyykD2iitqcgu9hpFbtzxfaGpLi72kfY: {
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

          const contract_metadata = accounts[2].pubkey
          const mint = accounts[5].pubkey
          var stream = await cli.getOne(contract_metadata.toBase58())
          const isExecuted = stream.createdAt > 0
          const mintMetadata = getMintMetadata(mint)
          const decimals = mintMetadata.decimals
          const streamData = deserStream(data, stream, decimals)
          let unlockedPercent = 0
          const unlocked = stream.unlocked(
            new Date().getTime() / 1000,
            decimals
          )
          unlockedPercent = Math.round(
            (unlocked / streamData.amountDeposited) * 100
          )

          return (
            <>
              <div>
                <div>
                  <span>Start:</span>
                  <span>
                    {' '}
                    {new Date(streamData.start * 1000).toISOString()} UTC
                  </span>
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
                  <span> {streamData.releaseFrequency} seconds</span>
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
                    <span>Unlocked:</span>
                    <VoteResultsBar
                      approveVotePercentage={unlockedPercent}
                      denyVotePercentage={0}
                    />
                    <br></br>
                  </div>
                )}
              </div>
            </>
          )
        } catch (error) {
          console.log(error)
          return <></>
        }
      },
    },
  },
}
