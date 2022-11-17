import {
  AccountMetaData,
  deserializeBorsh,
  getGovernance,
  getGovernanceInstructionSchema,
  getGovernanceProgramVersion,
  getRealm,
  SetRealmAuthorityAction,
  SetRealmAuthorityArgs,
  tryGetRealmConfig,
  VoteTipping,
} from '@solana/spl-governance'
import {
  SetGovernanceConfigArgs,
  SetRealmConfigArgs,
} from '@solana/spl-governance'
import { Connection } from '@solana/web3.js'
import { DISABLED_VOTER_WEIGHT } from '@tools/constants'
import { fmtVoterWeightThresholdMintAmount } from '@tools/governance/units'
import {
  fmtBNAmount,
  fmtMintAmount,
  getDaysFromTimestamp,
} from '@tools/sdk/units'

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
        const governance = await getGovernance(connection, accounts[0].pubkey)
        const realm = await getRealm(connection, governance.account.realm)

        const programVersion = await getGovernanceProgramVersion(
          connection,
          realm.owner
        )

        const args = deserializeBorsh(
          getGovernanceInstructionSchema(programVersion),
          SetGovernanceConfigArgs,
          Buffer.from(data)
        ) as SetGovernanceConfigArgs

        const communityMint = await tryGetMint(
          connection,
          realm.account.communityMint
        )
        const councilMint = realm.account.config.councilMint
          ? await tryGetMint(connection, realm.account.config.councilMint)
          : undefined
        const isMaxNumber =
          args.config.minCommunityTokensToCreateProposal.toString() ===
          DISABLED_VOTER_WEIGHT.toString()
        return (
          <>
            <p>
              {`voteThresholdPercentage:
              ${args.config.communityVoteThreshold.value?.toLocaleString()}%`}
            </p>
            {isMaxNumber ? (
              <p>minCommunityTokensToCreateProposal: Disabled</p>
            ) : (
              <p>
                {`minCommunityTokensToCreateProposal:
              ${fmtMintAmount(
                communityMint?.account,
                args.config.minCommunityTokensToCreateProposal
              )}`}{' '}
                ({args.config.minCommunityTokensToCreateProposal.toNumber()})
              </p>
            )}
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
              ${VoteTipping[args.config.communityVoteTipping]}`}
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

        const args = deserializeBorsh(
          getGovernanceInstructionSchema(programVersion),
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
        const realm = await getRealm(connection, accounts[0].pubkey)
        const programVersion = await getGovernanceProgramVersion(
          connection,
          realm.owner
        )

        const args = deserializeBorsh(
          getGovernanceInstructionSchema(programVersion),
          SetRealmConfigArgs,
          Buffer.from(data)
        ) as SetRealmConfigArgs

        const communityMint = await tryGetMint(
          connection,
          realm.account.communityMint
        )

        return (
          <>
            <p>
              {`minCommunityTokensToCreateGovernance:
              ${fmtVoterWeightThresholdMintAmount(
                communityMint?.account,
                args.configArgs.minCommunityTokensToCreateGovernance
              )}`}{' '}
              (
              {fmtBNAmount(
                args.configArgs.minCommunityTokensToCreateGovernance
              )}
              )
            </p>
            <p>
              {`useCouncilMint:
               ${args.configArgs.useCouncilMint}`}
            </p>
            <p>
              {`communityMintMaxVoteWeightSource:
               ${args.configArgs.communityMintMaxVoteWeightSource.fmtSupplyFractionPercentage()}% supply`}{' '}
              (
              {fmtBNAmount(
                args.configArgs.communityMintMaxVoteWeightSource.value
              )}
              )
            </p>
            <p>
              {`useCommunityVoterWeightAddin:
               ${!!args.configArgs.useCommunityVoterWeightAddin}`}
            </p>
            <p>
              {`useMaxCommunityVoterWeightAddin:
               ${!!args.configArgs.useMaxCommunityVoterWeightAddin}`}
            </p>
          </>
        )
      },
    },
  },
} as const
