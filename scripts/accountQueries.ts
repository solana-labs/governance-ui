import { PublicKey } from '@solana/web3.js'
import { deserializeUnchecked } from 'borsh'
import { AccountsQuery, setDefaults } from 'glasseater'
import {
  getAccountTypes,
  Governance,
  Proposal,
  ProposalState,
} from 'models/accounts'
import { ProgramVersion } from 'models/registry/constants'
import { getGovernanceSchema } from 'models/serialisation'
import { getConnectionContext } from 'utils/connection'

const context = getConnectionContext('mainnet')
setDefaults(
  {
    commitment: context.current.commitment,
    endpoint: context.endpoint,
  },
  {
    customDeserializer: deserializeUnchecked,
    // xxx: if using throttled RPC, change/remove config below
    msDelayBetweenBatchedRequests: 0,
    maxNumberOfRequestsPerBatch: 150,
  }
)

// TODO: get schema from account type
// https://github.com/solana-labs/governance-ui/pull/170#discussion_r777661145
const SCHEMA = getGovernanceSchema(ProgramVersion.V1)

/**
 * Fetches the number of open Proposals for a list of Realms
 * @example
 * // returns { "DPi...xFE": 1, "foo...123": 4 }
 * `await getProposalCounts(mainnetRealms)`
 * @returns {Object} Returns dictionary of `{ [realmId]: count }`
 */
export const getNumberOfProposalsInVotingState = async (realms) => {
  // 1/3) get all governance accounts for each realm
  const governanceAccounts = new AccountsQuery(SCHEMA, Governance)
  realms.forEach(({ programId, realmId }) => {
    getAccountTypes(Governance).forEach((accountType) => {
      governanceAccounts
        .for(programId)
        .select(['config'])
        .where({
          accountType,
          realm: new PublicKey(realmId),
        })
        .injectMetadata({ programId, realmId })
    })
  })
  const governances = await governanceAccounts.fetch()

  // 2/3) get all proposals being voted on for each governance account
  const proposalAccounts = new AccountsQuery(SCHEMA, Proposal)
  governances.forEach((governance) => {
    getAccountTypes(Proposal).forEach((accountType) => {
      proposalAccounts
        .for(governance.$metadata.programId)
        .where({
          accountType,
          governance: new PublicKey(governance.$metadata.pubkey!),
          state: ProposalState.Voting,
          votingAt: (votingAt) =>
            Boolean(
              votingAt &&
                governance.config?.maxVotingTime &&
                votingAt.toNumber() + governance.config.maxVotingTime >
                  Date.now() / 1000
            ),
          votingCompletedAt: null,
        })
        .injectMetadata({ realmId: governance.$metadata.realmId })
    })
  })
  const proposals = await proposalAccounts.fetch()

  // 3/3) group open proposals by realm & return `{ [realmPubkey]: count }`
  return proposals.reduce((acc, curr) => {
    acc[curr.$metadata.realmId] ??= 0
    acc[curr.$metadata.realmId] += 1
    return acc
  }, {})
}
