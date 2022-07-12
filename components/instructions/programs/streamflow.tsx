import { Connection, PublicKey } from '@solana/web3.js'
import { AccountMetaData } from '@solana/spl-governance'
import useWalletStore from 'stores/useWalletStore'
import BN from 'bn.js'

import tokenService from '@utils/services/token'
import VoteResultsBar from '@components/VoteResultsBar'
import { StreamClient, ClusterExtended, Cluster } from '@streamflow/stream'
import Button from '@components/Button'

const getNumberFromBN = (value: BN, decimals: number): number =>
  value.gt(new BN(2 ** 53 - 1))
    ? value.div(new BN(10 ** decimals)).toNumber()
    : value.toNumber() / 10 ** decimals

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
  DcAwL38mreGvUyykD2iitqcgu9hpFbtzxfaGpLi72kfY: {
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
        data: Uint8Array,
        accounts: AccountMetaData[]
      ) => {
        console.log(connection)
        const mint = getMintMetadata(accounts[5].pubkey)
        const decimals = mint.decimals
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

        const cli = new StreamClient(
          connection.rpcEndpoint,
          Cluster.Devnet, //add option to client to attach connection
          undefined,
          accounts[0].pubkey.toBase58()
        )
        let unlockedPercent = 0
        try {
          const stream = await cli.getOne(accounts[2].pubkey.toBase58())
          const unlocked = stream.unlocked(
            new Date().getTime() / 1000,
            decimals
          )
          unlockedPercent = Math.round((unlocked / amountDeposited) * 100)
        } catch (error) {
          console.log(error)
        }

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
      },
    },
  },
}
