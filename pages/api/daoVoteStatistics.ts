import { withSentry } from '@sentry/nextjs'
import {
  getGovernanceAccounts,
  ProgramAccount,
  Proposal,
  TokenOwnerRecord,
  VoteRecord,
} from '@solana/spl-governance'
import { Connection, PublicKey } from '@solana/web3.js'

import { NextApiRequest, NextApiResponse } from 'next'
import { getAllSplGovernanceProgramIds } from './tools/realms'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const conn = new Connection('https://ssc-dao.genesysgo.net/', 'recent')

  console.log('fetching spl-gov instances...')
  // Get all realms
  //const allProgramIds = getAllSplGovernanceProgramIds().slice(0, 1)
  const allProgramIds = getAllSplGovernanceProgramIds()

  console.log(`spl-gov instance count: ${allProgramIds.length}`)

  console.log('fetching proposals...')
  let allProposals: ProgramAccount<Proposal>[] = []

  for (const programId of allProgramIds) {
    const allProgramProposals = await getGovernanceAccounts(
      conn,
      new PublicKey(programId),
      Proposal
    )

    allProposals = allProposals.concat(allProgramProposals)
  }

  console.log('fetching vote records...')
  let allVoteRecords: ProgramAccount<VoteRecord>[] = []

  for (const programId of allProgramIds) {
    const allProgramVoteRecords = await getGovernanceAccounts(
      conn,
      new PublicKey(programId),
      VoteRecord
    )

    allVoteRecords = allVoteRecords.concat(allProgramVoteRecords)
  }

  console.log('fetching members...')
  let allMembers = new Set<string>()

  for (const programId of allProgramIds) {
    const allOwnerRecords = await getGovernanceAccounts(
      conn,
      new PublicKey(programId),
      TokenOwnerRecord
    )

    for (const ownerRecord of allOwnerRecords) {
      allMembers = allMembers.add(
        ownerRecord.account.governingTokenOwner.toBase58()
      )
    }
  }

  const daoStatistics = {
    asOf: new Date().toLocaleDateString('en-GB'),
    programIdCount: allProgramIds.length,
    proposalCount: allProposals.length,
    voteCount: allVoteRecords.length,
    membersCount: allMembers.size,
  }

  console.log('STATS', daoStatistics)

  res.status(200).json(daoStatistics)
}

export default withSentry(handler)
