import {
  getRealms,
  ProgramAccount,
  Realm,
  tryGetRealmConfig,
} from '@solana/spl-governance'
import { Connection, PublicKey } from '@solana/web3.js'
import { NextApiRequest, NextApiResponse } from 'next'
import { getAllSplGovernanceProgramIds } from './tools/realms'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const conn = new Connection('https://ssc-dao.genesysgo.net/', 'recent')
  // Get all realms

  // use first programId (Ukraine.SOL) for testings
  //const allProgramIds = getAllSplGovernanceProgramIds()
  const allProgramIds = getAllSplGovernanceProgramIds().slice(0, 1)
  //const allProgramIds = getAllSplGovernanceProgramIds()

  let allRealms: ProgramAccount<Realm>[] = []

  for (const programId of allProgramIds) {
    const allProgramRealms = await getRealms(conn, new PublicKey(programId))

    allRealms = allRealms.concat(allProgramRealms)
  }

  const nftRealms: ProgramAccount<Realm>[] = []

  for (const realm of allRealms.filter(
    (r) => r.account.config.useCommunityVoterWeightAddin
  )) {
    // Get NFT DAOs
    const realmConfig = await tryGetRealmConfig(conn, realm.owner, realm.pubkey)
    if (
      realmConfig.account.communityVoterWeightAddin?.equals(
        new PublicKey('GnftV5kLjd67tvHpNGyodwWveEKivz3ZWvvE3Z4xi2iw')
      )
    ) {
      nftRealms.push(realm)
    }
  }

  const daoStatistics = {
    asOf: new Date().toLocaleDateString('en-GB'),
    programIdCount: allProgramIds.length,
    daoCount: allRealms.length,
    nftDaoCount: nftRealms.length,
  }

  res.status(200).json(daoStatistics)
}

export default handler
