import Loading from '@components/Loading'
import {
  AccountMetaData,
  deserializeBorsh,
  getGovernance,
  getGovernanceInstructionSchema,
  getGovernanceProgramVersion,
  getRealm,
  GovernanceAccountParser,
  InstructionData,
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
import { Connection, PublicKey } from '@solana/web3.js'
import { DISABLED_VOTER_WEIGHT } from '@tools/constants'
import { fmtVoterWeightThresholdMintAmount } from '@tools/governance/units'
import {
  fmtBNAmount,
  fmtMintAmount,
  getDaysFromTimestamp,
  getHoursFromTimestamp,
} from '@tools/sdk/units'
import { dryRunInstruction } from 'actions/dryRunInstruction'
import { tryGetMint } from '../../../utils/tokens'

const TOKEN_TYPES = { 0: 'Liquid', 1: 'Membership', 2: 'Disabled' }
const governanceProgramId = 'GovER5Lthms3bLBqWub97yVrMmEogzX7xNjdXpPPCVZw'

export const GOVERNANCE_INSTRUCTIONS = {
  [governanceProgramId]: {
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
        const isCurrentGovernanceMinCommMax =
          governance.account.config.minCommunityTokensToCreateProposal.toString() ===
          DISABLED_VOTER_WEIGHT.toString()

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
              {`votingCoolOffTime:
          ${getHoursFromTimestamp(args.config.votingCoolOffTime)} hour(s)`}
            </p>
            <p>
              {`depositExemptProposalCount:
          ${args.config.depositExemptProposalCount}`}
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
            <h1>Current config</h1>
            <div className="space-y-3">
              <p>
                {`voteThresholdPercentage:
              ${governance.account.config.communityVoteThreshold.value?.toLocaleString()}%`}
              </p>
              {isCurrentGovernanceMinCommMax ? (
                <div>minCommunityTokensToCreateProposal: Disabled</div>
              ) : (
                <div>
                  {`minCommunityTokensToCreateProposal:
              ${fmtMintAmount(
                communityMint?.account,
                governance.account.config.minCommunityTokensToCreateProposal
              )}`}{' '}
                  (
                  {governance.account.config.minCommunityTokensToCreateProposal.toNumber()}
                  )
                </div>
              )}
              <p>
                {`minCouncilTokensToCreateProposal:
              ${fmtMintAmount(
                councilMint?.account,
                governance.account.config.minCouncilTokensToCreateProposal
              )}`}
              </p>
              <p>
                {`minInstructionHoldUpTime:
              ${getDaysFromTimestamp(
                governance.account.config.minInstructionHoldUpTime
              )} day(s)`}
              </p>
              <p>
                {`maxVotingTime:
              ${getDaysFromTimestamp(
                governance.account.config.maxVotingTime
              )} days(s)`}
              </p>
              <p>
                {`voteTipping:
              ${VoteTipping[governance.account.config.communityVoteTipping]}`}
              </p>
            </div>
            <h1 className="mt-10">Proposed config</h1>
            <div className="space-y-3">
              <p>
                {`voteThresholdPercentage:
              ${args.config.communityVoteThreshold.value?.toLocaleString()}%`}
              </p>
              {isMaxNumber ? (
                <div>minCommunityTokensToCreateProposal: Disabled</div>
              ) : (
                <div>
                  {`minCommunityTokensToCreateProposal:
              ${fmtMintAmount(
                communityMint?.account,
                args.config.minCommunityTokensToCreateProposal
              )}`}{' '}
                  ({args.config.minCommunityTokensToCreateProposal.toNumber()})
                </div>
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
            </div>
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
        let isLoading = true
        const realm = await getRealm(connection, accounts[0].pubkey)
        // The wallet can be any existing account for the simulation
        // Note: when running a local validator ensure the account is copied from devnet: --clone ENmcpFCpxN1CqyUjuog9yyUVfdXBKF3LVCwLr7grJZpk -ud
        const walletPk = new PublicKey(
          'ENmcpFCpxN1CqyUjuog9yyUVfdXBKF3LVCwLr7grJZpk'
        )
        const walletMoq: any = {
          publicKey: walletPk,
        }
        const instructionMoq = new InstructionData({
          programId: realm.owner,
          accounts: accounts,
          data: data,
        })
        const [
          programVersion,
          communityMint,
          currentRealmConfig,
          simulationResults,
        ] = await Promise.all([
          getGovernanceProgramVersion(connection, realm.owner),
          tryGetMint(connection, realm.account.communityMint),
          tryGetRealmConfig(connection, realm.owner, realm.pubkey),
          dryRunInstruction(connection, walletMoq, instructionMoq),
        ])

        const args = deserializeBorsh(
          getGovernanceInstructionSchema(programVersion),
          SetRealmConfigArgs,
          Buffer.from(data)
        ) as SetRealmConfigArgs

        const possibleRealmConfigsAccounts = simulationResults.response.accounts?.filter(
          (x) => x?.owner === realm.owner.toBase58()
        )
        let parsedRealmConfig: null | ProgramAccount<RealmConfigAccount> = null
        if (possibleRealmConfigsAccounts) {
          for (const acc of possibleRealmConfigsAccounts) {
            try {
              const account = GovernanceAccountParser(RealmConfigAccount)(
                PublicKey.default,
                //moq for accountInfo
                {
                  data: Buffer.from(acc!.data[0], 'base64'),
                  owner: realm.owner,
                } as any
              )
              parsedRealmConfig = account as ProgramAccount<RealmConfigAccount>
              // eslint-disable-next-line no-empty
            } catch {}
          }
        }
        const proposedPluginPk = parsedRealmConfig?.account?.communityTokenConfig?.voterWeightAddin?.toBase58()
        const proposedMaxVoterWeightPk = parsedRealmConfig?.account?.communityTokenConfig?.maxVoterWeightAddin?.toBase58()
        isLoading = false

        return isLoading ? (
          <Loading></Loading>
        ) : programVersion >= 3 ? (
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
            <h1>Current config</h1>
            <div className="space-y-3">
              <p>
                {`minCommunityTokensToCreateGovernance:
              ${fmtVoterWeightThresholdMintAmount(
                communityMint?.account,
                realm.account.config.minCommunityTokensToCreateGovernance
              )}`}{' '}
                (
                {fmtBNAmount(
                  realm.account.config.minCommunityTokensToCreateGovernance
                )}
                )
              </p>
              <p>
                {`communityMintMaxVoteWeightSource:
               ${realm.account.config.communityMintMaxVoteWeightSource.fmtSupplyFractionPercentage()}% supply`}{' '}
                (
                {fmtBNAmount(
                  realm.account.config.communityMintMaxVoteWeightSource.value
                )}
                )
              </p>
              <p>
                {`useCouncilMint:
               ${!!realm.account.config.councilMint}`}
              </p>
              <p>
                {`useCommunityVoterWeightAddin:
               ${!!realm.account.config.useCommunityVoterWeightAddin}`}
              </p>
              <p>
                {`useMaxCommunityVoterWeightAddin:
               ${!!realm.account.config.useMaxCommunityVoterWeightAddin}`}
              </p>
              <p>
                {currentRealmConfig?.account.communityTokenConfig
                  .voterWeightAddin && (
                  <div>
                    {`communityVoterWeightAddin :
               ${currentRealmConfig?.account.communityTokenConfig.voterWeightAddin?.toBase58()}`}
                  </div>
                )}
                {currentRealmConfig?.account.communityTokenConfig
                  .maxVoterWeightAddin && (
                  <div>
                    {`maxCommunityVoterWeightAddin:
               ${currentRealmConfig?.account.communityTokenConfig.maxVoterWeightAddin?.toBase58()}`}
                  </div>
                )}
              </p>
            </div>
            <h1 className="mt-10">Proposed config</h1>
            <div className="space-y-3">
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
                {`communityMintMaxVoteWeightSource:
               ${args.configArgs.communityMintMaxVoteWeightSource.fmtSupplyFractionPercentage()}% supply`}{' '}
                (
                {fmtBNAmount(
                  args.configArgs.communityMintMaxVoteWeightSource.value
                )}
                )
              </p>
              <p>
                {`useCouncilMint:
               ${args.configArgs.useCouncilMint}`}
              </p>
              <p>
                {`useCommunityVoterWeightAddin:
               ${
                 !!args.configArgs.useCommunityVoterWeightAddin ||
                 !!args.configArgs.communityTokenConfigArgs?.useVoterWeightAddin
               }`}
              </p>
              <p>
                {`useMaxCommunityVoterWeightAddin:
               ${
                 !!args.configArgs.useMaxCommunityVoterWeightAddin ||
                 !!args.configArgs.communityTokenConfigArgs
                   ?.useMaxVoterWeightAddin
               }`}
              </p>
              <p>
                {proposedPluginPk && (
                  <div>
                    {`communityVoterWeightAddin :
               ${proposedPluginPk}`}
                  </div>
                )}
                {proposedMaxVoterWeightPk && (
                  <div>
                    {`maxCommunityVoterWeightAddin:
               ${proposedMaxVoterWeightPk}`}
                  </div>
                )}
              </p>
            </div>
          </>
        )
      },
    },
  },
} as const
