import {
  deserializeBorsh,
  getGovernanceSchemaForAccount,
  GovernanceAccountType,
  GovernanceConfig,
  ProgramAccount,
  Proposal,
  VoteTipping,
} from '@solana/spl-governance'
import { BN } from '@coral-xyz/anchor'
import {
  getMintNaturalAmountFromDecimal,
  getTimestampFromDays,
  parseMintNaturalAmountFromDecimal,
} from '@tools/sdk/units'
import { isDisabledVoterWeight } from '@tools/governance/units'
import { createGovernanceThresholds } from '@tools/governance/configs'
import { ConnectionContext } from './connection'
import axios from 'axios'
import { bs58 } from '@coral-xyz/anchor/dist/cjs/utils/bytes'
import { PublicKey } from '@solana/web3.js'

interface GovernanceConfigValues {
  minTokensToCreateProposal: number | string
  minInstructionHoldUpTime: number
  maxVotingTime: number
  voteThresholdPercentage: number
  mintDecimals: number
  voteTipping?: VoteTipping
  votingCoolOffTime?: number
  depositExemptProposalCount?: number
}

// Parses min tokens to create (proposal or governance)
function parseMinTokensToCreate(value: string | number, mintDecimals: number) {
  return typeof value === 'string'
    ? parseMintNaturalAmountFromDecimal(value, mintDecimals)
    : getMintNaturalAmountFromDecimal(value, mintDecimals)
}

export function getGovernanceConfigFromV2Form(
  programVersion: number,
  values: GovernanceConfigValues
) {
  const {
    communityVoteThreshold,
    councilVoteThreshold,
    councilVetoVoteThreshold,
    communityVetoVoteThreshold,
  } = createGovernanceThresholds(programVersion, values.voteThresholdPercentage)

  const minTokensToCreateProposal = isDisabledVoterWeight(
    values.minTokensToCreateProposal
  )
    ? values.minTokensToCreateProposal
    : parseMinTokensToCreate(
        values.minTokensToCreateProposal,
        values.mintDecimals
      )

  const voteTippig = values.voteTipping || 0

  return new GovernanceConfig({
    communityVoteThreshold: communityVoteThreshold,
    minCommunityTokensToCreateProposal: new BN(
      minTokensToCreateProposal.toString()
    ),
    minInstructionHoldUpTime: getTimestampFromDays(
      values.minInstructionHoldUpTime
    ),
    baseVotingTime: getTimestampFromDays(values.maxVotingTime),
    // Use 1 as default for council tokens.
    // Council tokens are rare and possession of any amount of council tokens should be sufficient to be allowed to create proposals
    // If it turns to be a wrong assumption then it should be exposed in the UI
    minCouncilTokensToCreateProposal: new BN(1),
    communityVoteTipping: voteTippig,
    councilVoteTipping: voteTippig,
    councilVoteThreshold: councilVoteThreshold,
    councilVetoVoteThreshold: councilVetoVoteThreshold,
    communityVetoVoteThreshold: communityVetoVoteThreshold,
    //defaults in v2 there is no votingCoolOffTime and depositExemptProposalCount
    votingCoolOffTime: 0,
    depositExemptProposalCount: 10,
  })
}

export const getProposals = async (
  pubkeys: PublicKey[],
  connection: ConnectionContext,
  programId: PublicKey
) => {
  const proposalsRaw = await axios.request({
    url: connection.endpoint,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: JSON.stringify([
      ...pubkeys.map((x) => {
        return getProposalsFilter(
          programId,
          connection,
          bs58.encode(Uint8Array.from([GovernanceAccountType.ProposalV1])),
          x
        )
      }),
      ...pubkeys.map((x) => {
        return getProposalsFilter(
          programId,
          connection,
          bs58.encode(Uint8Array.from([GovernanceAccountType.ProposalV2])),
          x
        )
      }),
    ]),
  })

  const accounts: ProgramAccount<Proposal>[] = []
  const rawAccounts = proposalsRaw.data
    ? proposalsRaw.data.flatMap((x) => x.result)
    : []
  for (const rawAccount of rawAccounts) {
    try {
      const getSchema = getGovernanceSchemaForAccount
      const data = Buffer.from(rawAccount.account.data[0], 'base64')
      const accountType = data[0]
      const account: ProgramAccount<Proposal> = {
        pubkey: new PublicKey(rawAccount.pubkey),
        account: deserializeBorsh(getSchema(accountType), Proposal, data),
        owner: new PublicKey(rawAccount.account.owner),
      }

      accounts.push(account)
    } catch (ex) {
      console.info(`Can't deserialize @ ${rawAccount.pubkey}, ${ex}.`)
    }
  }
  const acc: ProgramAccount<Proposal>[][] = []
  const reducedAccounts = accounts.reduce((acc, current) => {
    const exsitingIdx = acc.findIndex((x) =>
      x.find(
        (x) =>
          x.account.governance.toBase58() ===
          current.account.governance.toBase58()
      )
    )
    if (exsitingIdx > -1) {
      acc[exsitingIdx].push(current)
    } else {
      acc.push([current])
    }
    return acc
  }, acc)
  return reducedAccounts
}

const getProposalsFilter = (
  programId: PublicKey,
  connection: ConnectionContext,
  memcmpBytes: string,
  pk: PublicKey
) => {
  return {
    jsonrpc: '2.0',
    id: 1,
    method: 'getProgramAccounts',
    params: [
      programId.toBase58(),
      {
        commitment: connection.current.commitment,
        encoding: 'base64',
        filters: [
          {
            memcmp: {
              offset: 0, // number of bytes
              bytes: memcmpBytes, // base58 encoded string
            },
          },
          {
            memcmp: {
              offset: 1,
              bytes: pk.toBase58(),
            },
          },
        ],
      },
    ],
  }
}
