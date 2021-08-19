import { PublicKey } from '@solana/web3.js'
import axios from 'axios'
import { RealmInfo } from '../@types/types'
import { getAccountTypes, Governance, Proposal } from '../models/accounts'
import { ParsedAccount } from '../models/serialisation'
import { ENDPOINTS } from '../stores/useWalletStore'
import { getGovernanceAccounts, pubkeyFilter } from './api'

const fiveMinutesSeconds = 5 * 60

// run every 5 mins, checks if a mngo governance proposal just opened in the last 5 mins
// and notifies on WEBHOOK_URL
async function runNotifier() {
  const nowInSeconds = new Date().getTime() / 1000

  const REALMS: RealmInfo[] = [
    {
      symbol: 'MNGO',
      programId: new PublicKey('GqTPL6qRf5aUuqscLh8Rg2HTxPUXfhhAXDptTLhp1t2J'),
      realmId: new PublicKey('DPiH3H3c7t47BMxqTxLsuPQpEC6Kne8GA9VXbxpnZxFE'),
    },
  ]

  const CLUSTER = 'mainnet-beta'
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

  console.log(`${Date.now()} - scanning all proposals`)
  for (const k in realmProposals) {
    const proposal = realmProposals[k]

    console.log(`-- processing ${proposal.info.name}`)

    if (
      // voting is closed
      proposal.info.votingCompletedAt
    )
      continue

    if (
      // not yet signed i.e. only in draft
      !proposal.info.signingOffAt
    )
      continue

    if (
      // proposal opened in last 5 mins
      nowInSeconds - proposal.info.signingOffAt.toNumber() <=
      fiveMinutesSeconds
    ) {
      const msg = `--- ${proposal.info.name} proposal just opened for voting`
      console.log(msg)
      axios.post(process.env.WEBHOOK_URL, { msg })
    }
  }
}

setInterval(runNotifier, fiveMinutesSeconds * 1000)
