import React from 'react'
import Link from 'next/link'
import cx from 'classnames'

import { ExternalLinkIcon, DotsVerticalIcon } from '@heroicons/react/outline'
import { ArrowsHorizontal } from '@carbon/icons-react'

import DropdownMenu from '@components/DropdownMenu/DropdownMenu'
import Tooltip from '@components/Tooltip'

import useRealm from '@hooks/useRealm'
import useQueryContext from '@hooks/useQueryContext'

import { Domain as DomainModel } from '@models/treasury/Domain'
import useWalletOnePointOh from '@hooks/useWalletOnePointOh'
import { useRealmQuery } from '@hooks/queries/realm'

interface Props {
  domain: DomainModel
}

const Domain: React.FC<Props> = (props) => {
  const { fmtUrlWithCluster } = useQueryContext()
  const wallet = useWalletOnePointOh()
  const connected = !!wallet?.connected
  const realm = useRealmQuery().data?.result
  const {
    symbol,
    governances,
    ownVoterWeight,
    toManyCommunityOutstandingProposalsForUser,
    toManyCouncilOutstandingProposalsForUse,
  } = useRealm()

  const governanceItems = Object.values(governances)

  const canCreateProposal =
    realm &&
    governanceItems.some((g) =>
      ownVoterWeight.canCreateProposal(g.account.config)
    ) &&
    !toManyCommunityOutstandingProposalsForUser &&
    !toManyCouncilOutstandingProposalsForUse

  const tooltipContent = !connected
    ? 'Connect your wallet to create new proposal'
    : governanceItems.length === 0
    ? 'There is no governance configuration to create a new proposal'
    : !governanceItems.some((g) =>
        ownVoterWeight.canCreateProposal(g.account.config)
      )
    ? "You don't have enough governance power to create a new proposal"
    : toManyCommunityOutstandingProposalsForUser
    ? 'Too many community outstanding proposals. You need to finalize them before creating a new one.'
    : toManyCouncilOutstandingProposalsForUse
    ? 'Too many council outstanding proposals. You need to finalize them before creating a new one.'
    : ''

  return (
    <div className="flex justify-between items-center px-2 py-6 border-b-[0.5px] border-white/50">
      <span className="block text-base font-medium">
        {`${props.domain.name}.sol`}
      </span>
      <div className="flex gap-4 ">
        <Link
          href={`https://explorer.solana.com/address/${props.domain.address}`}
        >
          <a
            target="_blank"
            rel="noreferrer"
            className={cx(
              'text-primary-light',
              'transition-all',
              'flex',
              'text-xs',
              'items-center',
              'gap-1'
            )}
          >
            <ExternalLinkIcon className="h-3 w-3" />
            Visit
          </a>
        </Link>
        <DropdownMenu
          triggerButton={
            <button aria-label="Further Options">
              <DotsVerticalIcon className="h-4 w-4" />
            </button>
          }
        >
          <Tooltip content={tooltipContent}>
            <div className={cx(!canCreateProposal ? 'cursor-not-allowed' : '')}>
              <Link href={fmtUrlWithCluster(`/dao/${symbol}/proposal/new`)}>
                <a
                  className={cx(
                    !canCreateProposal ? 'pointer-events-none' : '',
                    'flex items-center text-fgd-3 hover:text-fgd-2 gap-2 text-sm'
                  )}
                >
                  <ArrowsHorizontal className="h-4 w-4" />
                  Transfer Domain
                </a>
              </Link>
            </div>
          </Tooltip>
        </DropdownMenu>
      </div>
    </div>
  )
}

export default Domain
