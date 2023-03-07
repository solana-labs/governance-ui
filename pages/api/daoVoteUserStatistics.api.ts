// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import { getVoteRecordsByVoterMapByProposal } from '@models/api'
import { withSentry } from '@sentry/nextjs'
import {
  getGovernanceAccounts,
  getRealm,
  Governance,
  pubkeyFilter,
  YesNoVote,
} from '@solana/spl-governance'
import { Connection, PublicKey } from '@solana/web3.js'
import { getProposals } from '@utils/GovernanceTools'
import { NextApiRequest, NextApiResponse } from 'next'
import mainnetList from 'public/realms/mainnet-beta.json'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const conn = new Connection(
    'http://realms-realms-c335.mainnet.rpcpool.com/258d3727-bb96-409d-abea-0b1b4c48af29/',
    'recent'
  )

  const { dao, user } = req.query
  if (!dao) {
    res
      .status(500)
      .json({ error: 'dao publickey or symbol not provided in query' })
  }
  if (!user) {
    res
      .status(500)
      .json({ error: 'user wallet publickey not provided in query' })
  }
  let daoPk: PublicKey | null | undefined = null
  let walletPk: PublicKey | null = null
  try {
    daoPk = new PublicKey(dao!)
  } catch (e) {
    const pk = mainnetList.find(
      (x) => x.symbol.toLowerCase() === dao?.toString()!.toLowerCase()
    )?.realmId
    if (pk) {
      daoPk = new PublicKey(pk)
    }
  }
  try {
    walletPk = new PublicKey(user!)
  } catch (e) {
    res.status(500).json({ error: 'user wallet query is not publickey' })
  }

  if (!daoPk) {
    res.status(500).json({ error: 'Realm not found' })
  }

  const realm = await getRealm(conn, daoPk!)
  const voteRecordByVoter = await getVoteRecordsByVoterMapByProposal(
    conn,
    realm!.owner,
    walletPk!
  )
  const governances = await getGovernanceAccounts(
    conn,
    realm.owner,
    Governance,
    [pubkeyFilter(1, realm.pubkey)!]
  )
  const proposalsByGovernance = await getProposals(
    governances.map((x) => new PublicKey(x.pubkey)),
    {
      cluster: 'mainnet',
      current: conn,
      endpoint: conn.rpcEndpoint,
    },
    realm.owner
  )
  const votes = Object.values(voteRecordByVoter).map((x) => ({
    title: proposalsByGovernance
      .flatMap((pbg) => pbg)
      .find((p) => p.pubkey.equals(x.account.proposal))?.account.name,
    vote: x.account.vote ? YesNoVote[x.account.vote!.toYesNoVote()!] : null,
  }))

  res.status(200).json({
    yesCount: votes.filter((x) => x.vote === YesNoVote[0]).length,
    noCount: votes.filter((x) => x.vote === YesNoVote[1]).length,
    totalVotes: votes.length,
    votes,
  })
}

export default withSentry(handler)
