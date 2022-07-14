import { PublicKey } from '@solana/web3.js'
import axios from 'axios'
import { getConnectionContext } from 'utils/connection'
import { pubkeyFilter } from '@solana/spl-governance'
import { getAccountTypes, Governance, Proposal } from '@solana/spl-governance'
import { ProgramAccount } from '@solana/spl-governance'
import { getCertifiedRealmInfo } from '../models/registry/api'
import { getGovernanceAccounts } from './api'

const fiveMinutesSeconds = 5 * 60
const toleranceSeconds = 30

function errorWrapper() {
  runNotifier().catch((error) => {
    console.error(error)
  })
}

// run every 5 mins, checks if a governance proposal just opened in the last 5 mins
// and notifies on WEBHOOK_URL
async function runNotifier() {
  const nowInSeconds = new Date().getTime() / 1000

  const MAINNET_RPC_NODE =
    process.env.CLUSTER_URL || 'https://api.mainnet-beta.solana.com'
  const connectionContext = getConnectionContext('mainnet')

  const REALM_SYMBOL = process.env.REALM_SYMBOL || 'MNGO'
  const realmInfo = await getCertifiedRealmInfo(REALM_SYMBOL, connectionContext)

  const governances = await getGovernanceAccounts<Governance>(
    realmInfo!.programId,
    MAINNET_RPC_NODE,
    Governance,
    getAccountTypes(Governance),
    [pubkeyFilter(1, realmInfo!.realmId)!]
  )

  const governanceIds = Object.keys(governances).map((k) => new PublicKey(k))

  const proposalsByGovernance = await Promise.all(
    governanceIds.map((governanceId) => {
      return getGovernanceAccounts<Proposal>(
        realmInfo!.programId,
        MAINNET_RPC_NODE,
        Proposal,
        getAccountTypes(Proposal),
        [pubkeyFilter(1, governanceId)!]
      )
    })
  )

  const proposals: {
    [proposal: string]: ProgramAccount<Proposal>
  } = Object.assign({}, ...proposalsByGovernance)

  const realmGovernances = Object.fromEntries(
    Object.entries(governances).filter(([_k, v]) =>
      v.account.realm.equals(realmInfo!.realmId)
    )
  )

  const realmProposals = Object.fromEntries(
    Object.entries(proposals).filter(([_k, v]) =>
      Object.keys(realmGovernances).includes(v.account.governance.toBase58())
    )
  )

  console.log(`- scanning all '${REALM_SYMBOL}' proposals`)
  let countJustOpenedForVoting = 0
  let countVotingNotStartedYet = 0
  let countClosed = 0
  for (const k in realmProposals) {
    const proposal = realmProposals[k]

    if (
      // voting is closed
      proposal.account.votingCompletedAt
    ) {
      countClosed++
      continue
    }

    if (
      // voting has not started yet
      !proposal.account.votingAt
    ) {
      countVotingNotStartedYet++
      continue
    }

    if (
      // proposal opened in last 5 mins
      nowInSeconds - proposal.account.votingAt.toNumber() <=
      fiveMinutesSeconds + toleranceSeconds
      // proposal opened in last 24 hrs - useful to notify when bot recently stopped working
      // and missed the 5 min window
      // (nowInSeconds - proposal.info.votingAt.toNumber())/(60 * 60) <=
      // 24
    ) {
      countJustOpenedForVoting++

      const msg = `“${
        proposal.account.name
      }” proposal just opened for voting 🗳 https://realms.today/dao/${escape(
        REALM_SYMBOL
      )}/proposal/${k}`

      console.log(msg)
      if (process.env.WEBHOOK_URL) {
        axios.post(process.env.WEBHOOK_URL, { content: msg })
      }
    }
  }
  console.log(
    `-- countJustOpenedForVoting: ${countJustOpenedForVoting}, countVotingNotStartedYet: ${countVotingNotStartedYet}, countClosed: ${countClosed}`
  )
}

// start notifier immediately
errorWrapper()

setInterval(errorWrapper, fiveMinutesSeconds * 1000)
