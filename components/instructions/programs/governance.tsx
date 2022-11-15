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

const TOKEN_TYPES = { 0: 'Liquid', 1: 'Membership', 2: 'Disabled' }

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

        return programVersion >= 3 ? (
          <>
            <p>
              communityVoteThreshold:{' '}
              {args.config.communityVoteThreshold.value
                ? args.config.communityVoteThreshold.value?.toLocaleString() +
                  '%'
                : 'Disabled'}
            </p>
            <p>
              councilVoteThreshold:{' '}
              {args.config.councilVoteThreshold.value
                ? args.config.councilVoteThreshold.value?.toLocaleString() + '%'
                : 'Disabled'}
            </p>
            <p>
              communityVetoVoteThreshold:{' '}
              {args.config.communityVetoVoteThreshold.value
                ? args.config.communityVetoVoteThreshold.value?.toLocaleString() +
                  '%'
                : 'Disabled'}
            </p>
            <p>
              councilVetoVoteThreshold:{' '}
              {args.config.councilVetoVoteThreshold.value
                ? args.config.councilVetoVoteThreshold.value?.toLocaleString() +
                  '%'
                : 'Disabled'}
            </p>
            {args.config.minCommunityTokensToCreateProposal.toString() ===
            DISABLED_VOTER_WEIGHT.toString() ? (
              <p>minCommunityTokensToCreateProposal: Disabled</p>
            ) : (
              <p>
                minCommunityTokensToCreateProposal:{' '}
                {fmtMintAmount(
                  communityMint?.account,
                  args.config.minCommunityTokensToCreateProposal
                )}{' '}
                ({args.config.minCommunityTokensToCreateProposal.toString()})
              </p>
            )}
            {args.config.minCouncilTokensToCreateProposal.toString() ===
            DISABLED_VOTER_WEIGHT.toString() ? (
              <p>minCouncilTokensToCreateProposal: Disabled</p>
            ) : (
              <p>
                minCouncilTokensToCreateProposal:{' '}
                {fmtMintAmount(
                  councilMint?.account,
                  args.config.minCouncilTokensToCreateProposal
                )}{' '}
                ({args.config.minCouncilTokensToCreateProposal.toString()})
              </p>
            )}
            <p>
              {`minInstructionHoldUpTime:
          ${getDaysFromTimestamp(args.config.minInstructionHoldUpTime)} day(s)`}
            </p>
            <p>
              {`maxVotingTime:
          ${getDaysFromTimestamp(args.config.maxVotingTime)} days(s)`}
            </p>
            <p>
              {`communityVoteTipping:
          ${VoteTipping[args.config.communityVoteTipping]}`}
            </p>
            <p>
              {`councilVoteTipping:
          ${VoteTipping[args.config.councilVoteTipping]}`}
            </p>
          </>
        ) : (
          <>
            <p>
              {`voteThresholdPercentage:
              ${args.config.communityVoteThreshold.value?.toLocaleString()}%`}
            </p>
            {args.config.minCommunityTokensToCreateProposal.toString() ===
            DISABLED_VOTER_WEIGHT.toString() ? (
              <p>minCommunityTokensToCreateProposal: Disabled</p>
            ) : (
              <p>
                minCommunityTokensToCreateProposal:{' '}
                {fmtMintAmount(
                  communityMint?.account,
                  args.config.minCommunityTokensToCreateProposal
                )}{' '}
                ({args.config.minCommunityTokensToCreateProposal.toString()})
              </p>
            )}
            {args.config.minCouncilTokensToCreateProposal.toString() ===
            DISABLED_VOTER_WEIGHT.toString() ? (
              <p>minCouncilTokensToCreateProposal: Disabled</p>
            ) : (
              <p>
                minCouncilTokensToCreateProposal:{' '}
                {fmtMintAmount(
                  councilMint?.account,
                  args.config.minCouncilTokensToCreateProposal
                )}{' '}
                ({args.config.minCouncilTokensToCreateProposal.toString()})
              </p>
            )}
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
        const realmConfig = await tryGetRealmConfig(
          connection,
          realm.owner,
          realm.pubkey
        )

        return programVersion >= 3 ? (
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
              {`communityTokenConfigArgs.tokenType:
               ${
                 TOKEN_TYPES[args.configArgs.communityTokenConfigArgs.tokenType]
               }`}{' '}
              ({args.configArgs.communityTokenConfigArgs.tokenType})
            </p>
            <p>
              {`communityTokenConfigArgs.useVoterWeightAddin:
               ${
                 // note that the !! should do nothing, but the typing is inaccurate and the value is actually 0 or 1
                 !!args.configArgs.communityTokenConfigArgs.useVoterWeightAddin
               }`}
            </p>
            <p>
              {`communityTokenConfigArgs.useMaxVoterWeightAddin:
               ${
                 // note that the !! should do nothing, but the typing is inaccurate and the value is actually 0 or 1
                 !!args.configArgs.communityTokenConfigArgs
                   .useMaxVoterWeightAddin
               }`}
            </p>
            <p>
              {`councilTokenConfigArgs.tokenType:
               ${
                 TOKEN_TYPES[args.configArgs.councilTokenConfigArgs.tokenType]
               }`}{' '}
              ({args.configArgs.councilTokenConfigArgs.tokenType})
            </p>
            <p>
              {`councilTokenConfigArgs.useVoterWeightAddin:
               ${
                 // note that the !! should do nothing, but the typing is inaccurate and the value is actually 0 or 1
                 !!args.configArgs.councilTokenConfigArgs.useVoterWeightAddin
               }`}
            </p>
            <p>
              {`councilTokenConfigArgs.useMaxVoterWeightAddin:
               ${
                 // note that the !! should do nothing, but the typing is inaccurate and the value is actually 0 or 1
                 !!args.configArgs.councilTokenConfigArgs.useMaxVoterWeightAddin
               }`}
            </p>
          </>
        ) : (
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
            {/* These two lines seem misleading. We are displaying *current*, not *proposed*, config. */}
            {realmConfig?.account.communityTokenConfig.voterWeightAddin && (
              <p>
                {`communityVoterWeightAddin :
               ${realmConfig?.account.communityTokenConfig.voterWeightAddin?.toBase58()}`}
              </p>
            )}
            {realmConfig?.account.communityTokenConfig.maxVoterWeightAddin && (
              <p>
                {`maxCommunityVoterWeightAddin:
               ${realmConfig?.account.communityTokenConfig.maxVoterWeightAddin?.toBase58()}`}
              </p>
            )}
          </>
        )
      },
    },
  },
}
