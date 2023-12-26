import {
  CalendarIcon,
  ClockIcon,
  HandIcon,
  LibraryIcon,
  OfficeBuildingIcon,
  PencilIcon,
  ScaleIcon,
  UserGroupIcon,
} from '@heroicons/react/outline'
import { GoverningTokenType, VoteTipping } from '@solana/spl-governance'
import cx from 'classnames'
import { useRouter } from 'next/router'

import { ntext } from '@utils/ntext'
import { Wallet } from '@models/treasury/Wallet'
import Tooltip from '@components/Tooltip'
import { DISABLED_VOTER_WEIGHT } from '@tools/constants'
import Address from '@components/Address'
import useQueryContext from '@hooks/useQueryContext'

import Section from '../../../Section'
import TokenIcon from '../../../../icons/TokenIcon'
import useProgramVersion from '@hooks/useProgramVersion'
import { formatMintNaturalAmountAsDecimal } from '@tools/sdk/units'
import { DEFAULT_GOVERNANCE_PROGRAM_VERSION } from '@components/instructions/tools'
import {
  useRealmCommunityMintInfoQuery,
  useRealmCouncilMintInfoQuery,
} from '@hooks/queries/mintInfo'
import { useLegacyVoterWeight } from '@hooks/queries/governancePower'
import { useRealmConfigQuery } from '@hooks/queries/realmConfig'

const UNIX_SECOND = 1
const UNIX_MINUTE = UNIX_SECOND * 60
const UNIX_HOUR = UNIX_MINUTE * 60
const UNIX_DAY = UNIX_HOUR * 24

export function voteTippingText(voteTipping: VoteTipping) {
  switch (voteTipping) {
    case VoteTipping.Disabled:
      return 'Disabled'
    case VoteTipping.Early:
      return 'Early'
    case VoteTipping.Strict:
      return 'Strict'
  }
}

export function durationStr(duration: number, short = false) {
  if (duration === 0) {
    return short ? '0d' : '0 days'
  }

  if (duration > UNIX_DAY) {
    const count = duration / UNIX_DAY
    return count + (short ? 'd' : ' ' + ntext(count, 'day'))
  }

  if (duration > UNIX_HOUR) {
    const count = duration / UNIX_HOUR
    return count + (short ? 'h' : ' ' + ntext(count, 'hour'))
  }

  if (duration > UNIX_MINUTE) {
    const count = duration / UNIX_MINUTE
    return count + (short ? 'm' : ' ' + ntext(count, 'minute'))
  }

  const count = duration / UNIX_SECOND
  return count + (short ? 's' : ' ' + ntext(count, 'second'))
}

function votingLengthText(time: number) {
  const hours = time / UNIX_HOUR
  const days = Math.floor(hours / 24)
  const remainingHours = (time - days * UNIX_DAY) / UNIX_HOUR

  return (
    durationStr(days * UNIX_DAY) +
    (remainingHours ? ` ${durationStr(remainingHours * UNIX_HOUR)}` : '')
  )
}

interface Props {
  className?: string
  wallet: Wallet
}

export default function Rules(props: Props) {
  const mint = useRealmCommunityMintInfoQuery().data?.result
  const councilMint = useRealmCouncilMintInfoQuery().data?.result
  const { result: ownVoterWeight } = useLegacyVoterWeight()
  const router = useRouter()
  const { symbol } = router.query
  const { fmtUrlWithCluster } = useQueryContext()
  const realmConfig = useRealmConfigQuery().data?.result

  const programVersion = useProgramVersion()

  const governanceConfig = props.wallet.governanceAccount?.account.config

  const communityEnabled =
    realmConfig?.account.communityTokenConfig.tokenType !==
    GoverningTokenType.Dormant
  const councilEnabled =
    realmConfig?.account.councilTokenConfig.tokenType !==
    GoverningTokenType.Dormant

  const canEditRules =
    ownVoterWeight &&
    props.wallet.governanceAccount &&
    ownVoterWeight.canCreateProposal(
      props.wallet.governanceAccount.account.config
    )

  return (
    <section className={props.className}>
      {props.wallet.governanceAccount && (
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center space-x-2 text-fgd-1">
              <LibraryIcon className="h-5 w-5" />
              <div className="text-xl font-bold">Wallet Rules</div>
            </div>
            <Address
              address={props.wallet.governanceAccount.pubkey}
              className="mt-1 text-sm"
            />
          </div>
          <Tooltip
            content={
              !canEditRules
                ? 'Please connect a wallet with enough voting power to create governance config proposals'
                : ''
            }
          >
            <button
              className={cx(
                'flex',
                'items-center',
                'mb-8',
                'space-x-1',
                'text-primary-light',
                'text-sm',
                'transition-opacity',
                'disabled:cursor-not-allowed',
                'disabled:opacity-50'
              )}
              disabled={!canEditRules}
              onClick={() => {
                if (props.wallet.governanceAccount) {
                  router.push(
                    fmtUrlWithCluster(
                      `/dao/${symbol}/treasury/governance/${props.wallet.governanceAccount.pubkey.toBase58()}/edit`
                    )
                  )
                }
              }}
            >
              <PencilIcon className="h-4 w-4 stroke-primary-light" />
              <div>Edit Rules</div>
            </button>
          </Tooltip>
        </div>
      )}
      {governanceConfig !== undefined ? (
        <div>
          {props.wallet.rules.common && (
            <div className="mt-12">
              <div className="grid grid-cols-2 gap-8">
                <Section
                  icon={<CalendarIcon />}
                  name="Unrestricted Voting Time"
                  value={votingLengthText(governanceConfig.baseVotingTime)}
                />
                <Section
                  icon={<CalendarIcon />}
                  name="Voting Cool-Off Time"
                  value={durationStr(governanceConfig.votingCoolOffTime)}
                />
                <Section
                  icon={<ClockIcon />}
                  name="Min Instruction Holdup Time"
                  value={durationStr(governanceConfig.minInstructionHoldUpTime)}
                />
                {/** Under versions < 3, vote tipping is just one field for both **/}
                {(programVersion ?? DEFAULT_GOVERNANCE_PROGRAM_VERSION) <=
                  2 && (
                  <Section
                    icon={<HandIcon />}
                    name="Vote Tipping"
                    value={voteTippingText(
                      governanceConfig.communityVoteTipping
                    )}
                  />
                )}
                {/** Under versions < 3, approval quorum is just one field for both **/}
                {(programVersion ?? DEFAULT_GOVERNANCE_PROGRAM_VERSION) <=
                  2 && (
                  <Section
                    icon={<ScaleIcon />}
                    name="Approval Quorum"
                    value={
                      governanceConfig.communityVoteThreshold.value !==
                      undefined
                        ? governanceConfig.communityVoteThreshold.value + '%'
                        : 'Disabled'
                    }
                  />
                )}
              </div>
            </div>
          )}

          <div
            className={
              'mt-12 grid gap-x-8 ' +
              (communityEnabled && councilEnabled
                ? 'grid-cols-2'
                : 'grid-cols-1')
            }
          >
            {([
              ...(communityEnabled ? ['community'] : []),
              ...(councilEnabled ? ['council'] : []),
            ] as const).map((govpop) => {
              const governingTokenMintInfo =
                govpop === 'community' ? mint : councilMint

              const minTokensToCreateProposal =
                govpop === 'community'
                  ? governanceConfig.minCommunityTokensToCreateProposal
                  : governanceConfig.minCouncilTokensToCreateProposal

              const voteTipping =
                govpop === 'community'
                  ? governanceConfig.communityVoteTipping
                  : governanceConfig.councilVoteTipping

              const voteThreshold =
                govpop === 'community'
                  ? governanceConfig.communityVoteThreshold
                  : governanceConfig.councilVoteThreshold

              const vetoVoteThreshold =
                govpop === 'community'
                  ? governanceConfig.communityVetoVoteThreshold
                  : governanceConfig.councilVetoVoteThreshold

              return governingTokenMintInfo === undefined ? null : (
                <div key={govpop} className="border-t border-white/10 pt-6">
                  <div className="flex items-center space-x-2 text-fgd-1 mb-4">
                    {govpop === 'community' ? (
                      <UserGroupIcon className="h-5 w-5" />
                    ) : (
                      <OfficeBuildingIcon className="h-5 w-5" />
                    )}
                    <div className="font-bold">
                      {govpop === 'community' ? 'Community' : 'Council'} Rules
                    </div>
                  </div>
                  <div
                    className={
                      'grid grid-cols-1 gap-8 ' +
                      (communityEnabled && councilEnabled
                        ? 'grid-cols-1'
                        : 'grid-cols-2')
                    }
                  >
                    <Section
                      icon={<TokenIcon />}
                      name="Min Governance Power to Create a Proposal"
                      value={
                        DISABLED_VOTER_WEIGHT.eq(minTokensToCreateProposal)
                          ? 'Disabled'
                          : formatMintNaturalAmountAsDecimal(
                              governingTokenMintInfo,
                              minTokensToCreateProposal
                            )
                      }
                    />
                    {(programVersion ?? DEFAULT_GOVERNANCE_PROGRAM_VERSION) >=
                      3 && (
                      <Section
                        icon={<HandIcon />}
                        name="Vote Tipping"
                        value={voteTippingText(voteTipping)}
                      />
                    )}
                    {/** Under versions < 3, approval quorum is just one field for both **/}
                    {(programVersion ?? DEFAULT_GOVERNANCE_PROGRAM_VERSION) >=
                      3 && (
                      <Section
                        icon={<ScaleIcon />}
                        name="Approval Quorum"
                        value={
                          voteThreshold.value !== undefined
                            ? voteThreshold.value + '%'
                            : 'Disabled'
                        }
                      />
                    )}
                    {/** Under versions < 3, vetos dont exist **/}
                    {(programVersion ?? DEFAULT_GOVERNANCE_PROGRAM_VERSION) >=
                      3 && (
                      <Section
                        icon={<ScaleIcon />}
                        name="Veto Quorum"
                        value={
                          vetoVoteThreshold.value !== undefined
                            ? vetoVoteThreshold.value + '%'
                            : 'Disabled'
                        }
                      />
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ) : (
        <div>This Wallet has no rules</div>
      )}
    </section>
  )
}
