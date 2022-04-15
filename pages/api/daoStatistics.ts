import { getRealms, ProgramAccount, Realm } from '@solana/spl-governance'
import { Connection, PublicKey } from '@solana/web3.js'
import { NextApiRequest, NextApiResponse } from 'next'
import { getAllSplGovernanceProgramIds } from './tools/realms'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const conn = new Connection('https://ssc-dao.genesysgo.net/', 'recent')
  // Get all realms
  const allProgramIds = getAllSplGovernanceProgramIds()
  let allRealms: ProgramAccount<Realm>[] = []

  for (const programId of allProgramIds) {
    const allProgramRealms = await getRealms(conn, new PublicKey(programId))

    allRealms = allRealms.concat(allProgramRealms)
  }

  const daoStatistics = {
    programIdCount: allProgramIds.length,
    daoCount: allRealms.length,
  }

  res.status(200).json(daoStatistics)
}

export default handler
