import { U64_MAX } from '@marinade.finance/marinade-ts-sdk/dist/src/util'
import {
  AccountMetaData,
  getGovernance,
  getGovernanceProgramVersion,
  getGovernanceSchema,
  getRealm,
  ProgramAccount,
  RealmConfigAccount,
  SetRealmAuthorityAction,
  SetRealmAuthorityArgs,
  tryGetRealmConfig,
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
        const isMaxNumber =
          args.config.minCommunityTokensToCreateProposal.toString() ===
          U64_MAX.toString()
        return (
          <>
            <p>
              {`voteThresholdPercentage:
              ${args.config.voteThresholdPercentage.value.toLocaleString()}%`}
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
        let config: ProgramAccount<RealmConfigAccount> | null = null
        try {
          config = await tryGetRealmConfig(
            connection,
            realm.owner,
            realm.pubkey
          )
        } catch (e) {
          console.log(e)
        }

        return (
          <>
            <p>
              {`minCommunityTokensToCreateGovernance:
              ${fmtMintAmount(
                communityMint?.account,
                args.configArgs.minCommunityTokensToCreateGovernance
              )}`}{' '}
              ({args.configArgs.minCommunityTokensToCreateGovernance.toNumber()}
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
              {args.configArgs.communityMintMaxVoteWeightSource.value.toNumber()}
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
            {config?.account.communityVoterWeightAddin && (
              <p>
                {`communityVoterWeightAddin :
               ${config?.account.communityVoterWeightAddin?.toBase58()}`}
              </p>
            )}
            {config?.account.maxCommunityVoterWeightAddin && (
              <p>
                {`maxCommunityVoterWeightAddin:
               ${config?.account.maxCommunityVoterWeightAddin?.toBase58()}`}
              </p>
            )}
          </>
        )
      },
    },
  },
}
