import { Connection, PublicKey } from '@solana/web3.js'
import { nftVoteRecordKey } from '@helium/voter-stake-registry-sdk'
import { HeliumVsrClient } from '../sdk/client'
import { PositionWithMeta } from '../sdk/types'
import { chunks } from '@utils/helpers'

export interface GetUsedPositionsForProposalArgs {
  connection: Connection
  client: HeliumVsrClient
  positions: PositionWithMeta[]
  proposalPk: PublicKey
}

export const getUsedPositionsForProposal = async (
  args: GetUsedPositionsForProposalArgs
): Promise<PositionWithMeta[]> => {
  const { connection, client, positions, proposalPk } = args
  const usedPositions: PositionWithMeta[] = []
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

  usedPositions.push(
    ...positions.filter((_pos, idx) => !!nftVoteRecordAccountInfos[idx])
  )

  return usedPositions
}
