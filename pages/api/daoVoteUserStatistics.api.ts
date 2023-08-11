// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import { getVoteRecordsByVoterMapByProposal } from '@models/api'
import { withSentry } from '@sentry/nextjs'
import {
  getGovernanceAccounts,
  getRealm,
  Governance,
  ProposalState,
  pubkeyFilter,
  VoteRecord,
  YesNoVote,
} from '@solana/spl-governance'
import { Connection, PublicKey } from '@solana/web3.js'
import { getProposals } from '@utils/GovernanceTools'
import { fmtTokenAmount } from '@utils/formatting'
import dayjs from 'dayjs'
import { NextApiRequest, NextApiResponse } from 'next'
import mainnetList from 'public/realms/mainnet-beta.json'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const conn = new Connection(
    process.env.MAINNET_RPC ||
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
  const [
    communityMint,
    councilMint,
    voteRecordByVoter,
    governances,
    allProgramVoteRecords,
  ] = await Promise.all([
    conn.getParsedAccountInfo(realm.account.communityMint),
    realm.account.config.councilMint
      ? conn.getParsedAccountInfo(realm.account.config.councilMint)
      : null,
    getVoteRecordsByVoterMapByProposal(conn, realm!.owner, walletPk!),
    getGovernanceAccounts(conn, realm.owner, Governance, [
      pubkeyFilter(1, realm.pubkey)!,
    ]),
    getGovernanceAccounts(conn, new PublicKey(realm!.owner), VoteRecord),
  ])

  const communityMintDecimals =
    communityMint.value?.data['parsed'].info.decimals
  const councilMintDecimals = councilMint?.value?.data['parsed'].info.decimals

  const proposalsByGovernance = await getProposals(
    governances.map((x) => new PublicKey(x.pubkey)),
    {
      cluster: 'mainnet',
      current: conn,
      endpoint: conn.rpcEndpoint,
    },
    realm.owner
  )

  const votes = proposalsByGovernance
    .flatMap((pbg) => pbg)
    .filter((x) => x.account.state !== ProposalState.Draft)
    .map((proposal) => {
      const vote = Object.values(voteRecordByVoter).find((vote) =>
        vote.account.proposal.equals(proposal.pubkey)
      )

      return {
        title: proposal?.account.name,
        creationDate: dayjs(
          (proposal?.account.signingOffAt
            ? proposal?.account.signingOffAt
            : proposal?.account.draftAt)!.toNumber() * 1000
        ).format('DD-MM-YYYY HH:MM'),
        status: proposal
          ? ProposalState[proposal.account.state].toString()
          : null,
        proposaPK: proposal.pubkey.toBase58(),
        yesVotes: fmtTokenAmount(
          proposal.account.getYesVoteCount(),
          proposal.account.governingTokenMint.equals(
            realm.account.communityMint
          )
            ? communityMintDecimals
            : councilMintDecimals
        ),
        noVotes: fmtTokenAmount(
          proposal.account.getNoVoteCount(),
          proposal.account.governingTokenMint.equals(
            realm.account.communityMint
          )
            ? communityMintDecimals
            : councilMintDecimals
        ),
        voted: vote?.account.vote
          ? YesNoVote[vote.account.vote!.toYesNoVote()!]
          : vote?.account.voteWeight?.yes
          ? 'Yes'
          : vote?.account.voteWeight?.no
          ? 'No'
          : null,
        creationDateTimestamp: proposal?.account.signingOffAt
          ? proposal?.account.signingOffAt.toNumber()
          : proposal?.account.draftAt.toNumber(),
        totalVotersNumber: allProgramVoteRecords.filter((x) =>
          x.account.proposal.equals(proposal.pubkey)
        ).length,
      }
    })

  res.status(200).json({
    totalProposalsCount: votes.length,
    yesCount: votes.filter((x) => x.voted === YesNoVote[0]).length,
    noCount: votes.filter((x) => x.voted === YesNoVote[1]).length,
    abstainVotesCount: votes.filter((x) => x.voted === null).length,
    totalVotesCasts: votes.filter((x) => x.voted).length,
    votes: votes.sort(
      (a, b) => b.creationDateTimestamp - a.creationDateTimestamp
    ),
  })
}

export default withSentry(handler)
