import { Connection, PublicKey } from '@solana/web3.js'
import { nftVoteRecordKey } from '@helium/voter-stake-registry-sdk'
import { HeliumVsrClient } from '../sdk/client'
import { PositionWithVotingMint } from '../sdk/types'
import { chunks } from '@utils/helpers'

export interface GetUnusedPositionsForProposalArgs {
  connection: Connection
  client: HeliumVsrClient
  positions: PositionWithVotingMint[]
  proposalPk: PublicKey
}

export const getUnusedPositionsForProposal = async (
  args: GetUnusedPositionsForProposalArgs
): Promise<PositionWithVotingMint[]> => {
  const { connection, client, positions, proposalPk } = args
  const unusedPositions: PositionWithVotingMint[] = []
  const nftVoteRecordKeys = positions.map(
    (pos) => nftVoteRecordKey(proposalPk, pos.mint, client.program.programId)[0]
  )

  const nftVoteRecordAccountInfos = (
    await Promise.all(
      chunks(nftVoteRecordKeys, 99).map((chunk) =>
        connection.getMultipleAccountsInfo(chunk)
      )
    )
  ).flat()

  unusedPositions.push(
    ...positions.filter((_pos, idx) => !nftVoteRecordAccountInfos[idx])
  )

  return unusedPositions
}
