import {
  getAllGovernances,
  getNativeTreasuryAddress,
  getRealms,
  ProgramAccount,
  Realm,
  tryGetRealmConfig,
} from '@solana/spl-governance'
import { Connection, PublicKey } from '@solana/web3.js'
import { getOwnedTokenAccounts } from '@utils/tokens'
import { NextApiRequest, NextApiResponse } from 'next'
import { getAllSplGovernanceProgramIds } from './tools/realms'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const conn = new Connection('https://ssc-dao.genesysgo.net/', 'recent')

  // Get all realms
  const allProgramIds = getAllSplGovernanceProgramIds().slice(0, 1)
  //const allProgramIds = getAllSplGovernanceProgramIds()

  let allRealms: ProgramAccount<Realm>[] = []

  for (const programId of allProgramIds) {
    const allProgramRealms = await getRealms(conn, new PublicKey(programId))

    allRealms = allRealms.concat(allProgramRealms)
  }

  const nftRealms: ProgramAccount<Realm>[] = []

  for (const realm of allRealms) {
    const programId = realm.owner

    // Get NFT DAOs

    if (realm.account.config.useCommunityVoterWeightAddin) {
      const realmConfig = await tryGetRealmConfig(conn, programId, realm.pubkey)
      if (
        realmConfig.account.communityVoterWeightAddin?.equals(
          new PublicKey('GnftV5kLjd67tvHpNGyodwWveEKivz3ZWvvE3Z4xi2iw')
        )
      ) {
        nftRealms.push(realm)
      }
    }

    // Get governances
    const governances = await getAllGovernances(conn, programId, realm.pubkey)
    for (const governance of governances) {
      // Check governance owned token accounts
      let tokenAccounts = await getOwnedTokenAccounts(conn, governance.pubkey)
      for (const tokenAccount of tokenAccounts) {
        console.log('ACC 1', tokenAccount)
      }

      // Check SOL wallet owned token accounts
      const solWallet = await getNativeTreasuryAddress(
        programId,
        governance.pubkey
      )
      tokenAccounts = await getOwnedTokenAccounts(conn, solWallet)
      for (const tokenAccount of tokenAccounts) {
        console.log('ACC 1', tokenAccount)
      }
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
