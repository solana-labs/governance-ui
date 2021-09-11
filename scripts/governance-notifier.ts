import { PublicKey } from '@solana/web3.js'
import axios from 'axios'
import { REALMS } from '../hooks/useRealm'
import { getAccountTypes, Governance, Proposal } from '../models/accounts'
import { ParsedAccount } from '../models/core/accounts'

import { ENDPOINTS } from '../stores/useWalletStore'
import { getGovernanceAccounts, pubkeyFilter } from './api'

const fiveMinutesSeconds = 5 * 60
const toleranceSeconds = 30

// run every 5 mins, checks if a mngo governance proposal just opened in the last 5 mins
// and notifies on WEBHOOK_URL
async function runNotifier() {
  const nowInSeconds = new Date().getTime() / 1000

  const CLUSTER = 'mainnet'
  const ENDPOINT = ENDPOINTS.find((e) => e.name === CLUSTER)

  const realmInfo = REALMS.find((r) => r.symbol === 'MNGO')

  const governances = await getGovernanceAccounts<Governance>(
    realmInfo.programId,
    ENDPOINT.url,
    Governance,
    getAccountTypes(Governance),
    [pubkeyFilter(1, realmInfo.realmId)]
  )

  const governanceIds = Object.keys(governances).map((k) => new PublicKey(k))

  const proposalsByGovernance = await Promise.all(
    governanceIds.map((governanceId) => {
      return getGovernanceAccounts<Proposal>(
        realmInfo.programId,
        ENDPOINT.url,
        Proposal,
        getAccountTypes(Proposal),
        [pubkeyFilter(1, governanceId)]
      )
    })
  )

  const proposals: {
    [proposal: string]: ParsedAccount<Proposal>
  } = Object.assign({}, ...proposalsByGovernance)

  const realmGovernances = Object.fromEntries(
    Object.entries(governances).filter(([_k, v]) =>
      v.info.realm.equals(realmInfo.realmId)
    )
  )

  const realmProposals = Object.fromEntries(
    Object.entries(proposals).filter(([_k, v]) =>
      Object.keys(realmGovernances).includes(v.info.governance.toBase58())
    )
  )

  console.log(`- scanning all proposals`)
  let countJustOpenedForVoting = 0
  let countVotingNotStartedYet = 0
  let countClosed = 0
  for (const k in realmProposals) {
    const proposal = realmProposals[k]

    if (
      // voting is closed
      proposal.info.votingCompletedAt
    ) {
      countClosed++
      continue
    }

    if (
      // voting has not started yet
      !proposal.info.votingAt
    ) {
      countVotingNotStartedYet++
      continue
    }

    if (
      // proposal opened in last 5 mins
      nowInSeconds - proposal.info.votingAt.toNumber() <=
      fiveMinutesSeconds + toleranceSeconds
    ) {
      countJustOpenedForVoting++
      const msg = `--- ${proposal.info.name} proposal just opened for voting`
      console.log(msg)
      if (process.env.WEBHOOK_URL) {
        axios.post(process.env.WEBHOOK_URL, { msg })
      }
    }
  }
  console.log(
    `-- countJustOpenedForVoting: ${countJustOpenedForVoting}, countVotingNotStartedYet: ${countVotingNotStartedYet}, countClosed: ${countClosed}`
  )
}

setInterval(runNotifier, fiveMinutesSeconds * 1000)
