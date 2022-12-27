import { getRealms } from '@solana/spl-governance'
import { Connection, PublicKey } from '@solana/web3.js'

import { NextApiRequest, NextApiResponse } from 'next'
import { getAllSplGovernanceProgramIds } from './tools/realms'
import { withSentry } from '@sentry/nextjs'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const conn = new Connection(
    'https://wild-empty-sunset.solana-mainnet.quiknode.pro/58b024b787bbbe155d39de4ae5e789ac63ed1982/',
    'recent'
  )

  console.log('fetching spl-gov instances...')
  // Get all realms
  //const allProgramIds = getAllSplGovernanceProgramIds().slice(0, 1)
  const allProgramIds = getAllSplGovernanceProgramIds()

  console.log(`spl-gov instance count: ${allProgramIds.length}`)

  console.log('fetching realms...')
  const realmsByProgramId = {}

  for (const programId of allProgramIds) {
    const allProgramRealms = await getRealms(conn, new PublicKey(programId))

    realmsByProgramId[programId] = allProgramRealms.map((r) => r.account.name)
  }

  console.log('STATS', realmsByProgramId)

  res.status(200).json(realmsByProgramId)
}

export default withSentry(handler)
