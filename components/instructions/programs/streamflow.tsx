import { Connection, PublicKey } from '@solana/web3.js'
import { AccountMetaData } from '@solana/spl-governance'

import tokenService from '@utils/services/token'
import VoteResultsBar from '@components/VoteResultsBar'
import {
  StreamClient,
  ClusterExtended,
  Cluster,
  getNumberFromBN,
} from '@streamflow/stream'
import Button from '@components/Button'

import { STREAMFLOW_PROGRAM_ID } from 'pages/dao/[symbol]/proposal/components/instructions/Streamflow/CreateStream'

const getCluster = (name: string): ClusterExtended => {
  if (name == 'devnet') {
    return Cluster.Devnet
  } else {
    return Cluster.Mainnet
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

const BufferLayout = require('buffer-layout')

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
  STREAMFLOW_PROGRAM_ID: {
    174: {
      name: 'Streamflow: Create',
      accounts: [
        { name: 'Source', important: true },
        { name: 'Token account', important: true },
        { name: 'Authority' },
        { name: 'Authority' },
        { name: 'Liquidator' },
        { name: 'Mint' },
        { name: 'Streamflow treasury' },
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
            accounts[0].pubkey.toBase58()
          )
          const stream = await cli.getOne(accounts[2].pubkey.toBase58())
          const decimals = getMintMetadata(accounts[5].pubkey).decimals
          const start = stream.start
          const amountDeposited = getNumberFromBN(
            stream.depositedAmount,
            decimals
          )
          const releaseFrequency = stream.period
          const releaseAmount = getNumberFromBN(
            stream.amountPerPeriod,
            decimals
          )
          const amountAtCliff = getNumberFromBN(stream.cliffAmount, decimals)

          let unlockedPercent = 0
          const unlocked = stream.unlocked(
            new Date().getTime() / 1000,
            decimals
          )
          unlockedPercent = Math.round((unlocked / amountDeposited) * 100)

          return (
            <>
              <div>
                <div>
                  <span>Start:</span>
                  <span> {new Date(start * 1000).toISOString()} UTC</span>
                </div>

                <div>
                  <span>Amount:</span>
                  <span> {amountDeposited}</span>
                </div>
                <div>
                  <span>Unlocked every:</span>
                  <span> {releaseFrequency} seconds</span>
                </div>
                <div>
                  <span>Release amount:</span>
                  <span> {releaseAmount}</span>
                </div>
                <div>
                  <span>Released at start:</span>
                  <span> {amountAtCliff}</span>
                </div>
                <br></br>
                <div>
                  <span>Unlocked:</span>
                  <VoteResultsBar
                    approveVotePercentage={unlockedPercent}
                    denyVotePercentage={0}
                  />
                </div>
                <br></br>
                <Button>Cancel</Button>
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
