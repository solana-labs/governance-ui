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
import { VoteTipping } from '@solana/spl-governance'
import cx from 'classnames'
import React, { useState } from 'react'
import { BigNumber } from 'bignumber.js'

import { formatNumber } from '@utils/formatNumber'
import { ntext } from '@utils/ntext'
import { Wallet } from '@models/treasury/Wallet'
import GovernanceConfigModal from 'pages/dao/[symbol]/params/GovernanceConfigModal'
import useRealm from '@hooks/useRealm'
import Tooltip from '@components/Tooltip'
import { DISABLED_VOTER_WEIGHT } from '@tools/constants'
import Address from '@components/Address'

import Section from './Section'
import TokenIcon from '../../../../icons/TokenIcon'

const UNIX_SECOND = 1
const UNIX_MINUTE = UNIX_SECOND * 60
const UNIX_HOUR = UNIX_MINUTE * 60
const UNIX_DAY = UNIX_HOUR * 24

function voteTippingText(voteTipping: VoteTipping) {
  switch (voteTipping) {
    case VoteTipping.Disabled:
      return 'Disabled'
    case VoteTipping.Early:
      return 'Early'
    case VoteTipping.Strict:
      return 'Strict'
  }
}

function durationStr(duration: number) {
  if (duration === 0) {
    return '0 days'
  }

  if (duration > UNIX_DAY) {
    const count = duration / UNIX_DAY
    return count + ' ' + ntext(count, 'day')
  }

  if (duration > UNIX_HOUR) {
    const count = duration / UNIX_HOUR
    return count + ' ' + ntext(count, 'hour')
  }

  if (duration > UNIX_MINUTE) {
    const count = duration / UNIX_MINUTE
    return count + ' ' + ntext(count, 'minute')
  }

  const count = duration / UNIX_SECOND
  return count + ' ' + ntext(count, 'second')
}

interface Props {
  className?: string
  wallet: Wallet
}

export default function Rules(props: Props) {
  const [editRulesOpen, setEditRulesOpen] = useState(false)
  const { ownVoterWeight } = useRealm()

  const hasCommon = !!props.wallet.rules.common
  const hasCommunity = !!props.wallet.rules.community
  const hasCouncil = !!props.wallet.rules.council
  const hasRules = hasCommon || hasCommunity || hasCouncil

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
              onClick={() => setEditRulesOpen(true)}
            >
              <PencilIcon className="h-4 w-4 stroke-primary-light" />
              <div>Edit Rules</div>
            </button>
          </Tooltip>
        </div>
      )}
      {hasRules ? (
        <div>
          {props.wallet.rules.common && (
            <div className="mt-12">
              <div className="grid grid-cols-2 gap-8">
                <Section
                  icon={<CalendarIcon />}
                  name="Max Voting Time"
                  value={durationStr(props.wallet.rules.common.maxVotingTime)}
                />
                <Section
                  icon={<ClockIcon />}
                  name="Min Instruction Holdup Time"
                  value={durationStr(
                    props.wallet.rules.common.minInstructionHoldupTime
                  )}
                />
                <Section
                  icon={<HandIcon />}
                  name="Vote Tipping"
                  value={voteTippingText(props.wallet.rules.common.voteTipping)}
                />
                <Section
                  icon={<ScaleIcon />}
                  name="Approval Quorum"
                  value={
                    props.wallet.rules.common.voteThresholdPercentage + '%'
                  }
                />
                {!(
                  props.wallet.rules.community && props.wallet.rules.council
                ) &&
                  (props.wallet.rules.community ? (
                    <Section
                      icon={<TokenIcon />}
                      name="Min Governance Power to Create a Proposal"
                      value={
                        new BigNumber(DISABLED_VOTER_WEIGHT.toString())
                          .shiftedBy(
                            -(props.wallet.rules.community?.decimals || 0)
                          )
                          .isLessThanOrEqualTo(
                            props.wallet.rules.community
                              .minTokensToCreateProposal
                          )
                          ? 'Disabled'
                          : formatNumber(
                              props.wallet.rules.community
                                .minTokensToCreateProposal,
                              undefined,
                              { maximumFractionDigits: 0 }
                            )
                      }
                    />
                  ) : props.wallet.rules.council ? (
                    <Section
                      icon={<TokenIcon />}
                      name="Min Governance Power to Create a Proposal"
                      value={
                        new BigNumber(DISABLED_VOTER_WEIGHT.toString())
                          .shiftedBy(
                            -(props.wallet.rules.council?.decimals || 0)
                          )
                          .isLessThanOrEqualTo(
                            props.wallet.rules.council.minTokensToCreateProposal
                          )
                          ? 'Disabled'
                          : formatNumber(
                              props.wallet.rules.council
                                .minTokensToCreateProposal,
                              undefined,
                              { maximumFractionDigits: 0 }
                            )
                      }
                    />
                  ) : null)}
              </div>
            </div>
          )}
          {props.wallet.rules.community && props.wallet.rules.council && (
            <div className="mt-12 grid grid-cols-2 gap-x-8">
              <div className="border-t border-white/10 pt-6">
                <div className="flex items-center space-x-2 text-fgd-1 mb-4">
                  <UserGroupIcon className="h-5 w-5" />
                  <div className="font-bold">Community Rules</div>
                </div>
                <div className="grid grid-cols-1 gap-8">
                  <Section
                    icon={<TokenIcon />}
                    name="Min Governance Power to Create a Proposal"
                    value={
                      new BigNumber(DISABLED_VOTER_WEIGHT.toString())
                        .shiftedBy(
                          -(props.wallet.rules.community?.decimals || 0)
                        )
                        .isLessThanOrEqualTo(
                          props.wallet.rules.community.minTokensToCreateProposal
                        )
                        ? 'Disabled'
                        : formatNumber(
                            props.wallet.rules.community
                              .minTokensToCreateProposal,
                            undefined,
                            { maximumFractionDigits: 0 }
                          )
                    }
                  />
                </div>
              </div>
              <div className="border-t border-white/10 pt-6">
                <div className="flex items-center space-x-2 text-fgd-1 mb-4">
                  <OfficeBuildingIcon className="h-5 w-5" />
                  <div className="font-bold">Council Rules</div>
                </div>
                <div className="grid grid-cols-1 gap-8">
                  <Section
                    icon={<TokenIcon />}
                    name="Min Governance Power to Create a Proposal"
                    value={
                      new BigNumber(DISABLED_VOTER_WEIGHT.toString())
                        .shiftedBy(-(props.wallet.rules.council?.decimals || 0))
                        .isLessThanOrEqualTo(
                          props.wallet.rules.council.minTokensToCreateProposal
                        )
                        ? 'Disabled'
                        : formatNumber(
                            props.wallet.rules.council
                              .minTokensToCreateProposal,
                            undefined,
                            { maximumFractionDigits: 0 }
                          )
                    }
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div>This Wallet has no rules</div>
      )}
      {editRulesOpen && props.wallet.governanceAccount && (
        <GovernanceConfigModal
          isProposalModalOpen
          governance={props.wallet.governanceAccount}
          closeProposalModal={() => setEditRulesOpen(false)}
        />
      )}
    </section>
  )
}
