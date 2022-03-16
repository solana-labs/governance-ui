import {
  AccountMetaData,
  getGovernance,
  getGovernanceProgramVersion,
  getGovernanceSchema,
  getRealm,
  SetRealmAuthorityAction,
  SetRealmAuthorityArgs,
  VoteTipping,
} from '@solana/spl-governance'
import {
  SetGovernanceConfigArgs,
  SetRealmConfigArgs,
} from '@solana/spl-governance'
import { GOVERNANCE_SCHEMA } from '@solana/spl-governance'
import { Connection } from '@solana/web3.js'
import { fmtMintAmount, getDaysFromTimestamp } from '@tools/sdk/units'
import { deserialize } from 'borsh'

import { tryGetMint } from '../../../utils/tokens'

export const GOVERNANCE_INSTRUCTIONS = {
  GovER5Lthms3bLBqWub97yVrMmEogzX7xNjdXpPPCVZw: {
    19: {
      name: 'Set Governance Config',
      accounts: [{ name: 'Governance' }],
      getDataUI: async (
        connection: Connection,
        data: Uint8Array,
        accounts: AccountMetaData[]
      ) => {
        const args = deserialize(
          GOVERNANCE_SCHEMA,
          SetGovernanceConfigArgs,
          Buffer.from(data)
        ) as SetGovernanceConfigArgs

        const governance = await getGovernance(connection, accounts[0].pubkey)
        const realm = await getRealm(connection, governance.account.realm)
        const communityMint = await tryGetMint(
          connection,
          realm.account.communityMint
        )
        const councilMint = realm.account.config.councilMint
          ? await tryGetMint(connection, realm.account.config.councilMint)
          : undefined

        return (
          <>
            <p>
              {`voteThresholdPercentage:
              ${args.config.voteThresholdPercentage.value.toLocaleString()}%`}
            </p>
            <p>
              {`minCommunityTokensToCreateProposal:
              ${fmtMintAmount(
                communityMint?.account,
                args.config.minCommunityTokensToCreateProposal
              )}`}
            </p>
            <p>
              {`minCouncilTokensToCreateProposal:
              ${fmtMintAmount(
                councilMint?.account,
                args.config.minCouncilTokensToCreateProposal
              )}`}
            </p>
            <p>
              {`minInstructionHoldUpTime:
              ${getDaysFromTimestamp(
                args.config.minInstructionHoldUpTime
              )} day(s)`}
            </p>
            <p>
              {`maxVotingTime:
              ${getDaysFromTimestamp(args.config.maxVotingTime)} days(s)`}
            </p>
            <p>
              {`voteTipping:
              ${VoteTipping[args.config.voteTipping]}`}
            </p>
            <p>
              {`proposalCoolOffTime:
              ${getDaysFromTimestamp(args.config.proposalCoolOffTime)} days(s)`}
            </p>
          </>
        )
      },
    },
    21: {
      name: 'Set Realm Authority',
      accounts: [
        { name: 'Realm' },
        { name: 'Realm Authority' },
        { name: 'New Realm Authority' },
      ],
      getDataUI: async (
        connection: Connection,
        data: Uint8Array,
        accounts: AccountMetaData[]
      ) => {
        const realm = await getRealm(connection, accounts[0].pubkey)
        const programVersion = await getGovernanceProgramVersion(
          connection,
          realm.owner
        )

        const args = deserialize(
          getGovernanceSchema(programVersion),
          SetRealmAuthorityArgs,
          Buffer.from(data)
        ) as SetRealmAuthorityArgs

        return (
          <>
            <p>
              {`action:
               ${SetRealmAuthorityAction[args.action!]}`}
            </p>
          </>
        )
      },
    },
    22: {
      name: 'Set Realm Config',
      accounts: [{ name: 'Realm' }, { name: 'Realm Authority' }],
      getDataUI: async (
        connection: Connection,
        data: Uint8Array,
        accounts: AccountMetaData[]
      ) => {
        const args = deserialize(
          GOVERNANCE_SCHEMA,
          SetRealmConfigArgs,
          Buffer.from(data)
        ) as SetRealmConfigArgs

        const realm = await getRealm(connection, accounts[0].pubkey)
        const communityMint = await tryGetMint(
          connection,
          realm.account.communityMint
        )

        return (
          <>
            <p>
              {`minCommunityTokensToCreateGovernance:
              ${fmtMintAmount(
                communityMint?.account,
                args.configArgs.minCommunityTokensToCreateGovernance
              )}`}
            </p>
            <p>
              {`useCouncilMint:
               ${args.configArgs.useCouncilMint}`}
            </p>
            <p>
              {`communityMintMaxVoteWeightSource:
               ${args.configArgs.communityMintMaxVoteWeightSource.fmtSupplyFractionPercentage()}% supply`}
            </p>
          </>
        )
      },
    },
  },
}
