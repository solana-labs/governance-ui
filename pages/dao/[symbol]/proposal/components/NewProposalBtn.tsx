import Link from 'next/link'
import { PlusCircleIcon } from '@heroicons/react/outline'
import useQueryContext from '@hooks/useQueryContext'
import useRealm from '@hooks/useRealm'
import React from 'react'
import useWalletStore from 'stores/useWalletStore'
import Tooltip from '@components/Tooltip'

const NewProposalBtn = () => {
  const { fmtUrlWithCluster } = useQueryContext()

  const connected = useWalletStore((s) => s.connected)

  const {
    symbol,
    realm,
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
    <>
      <Tooltip content={tooltipContent}>
        <div
          className={!canCreateProposal ? 'cursor-not-allowed opacity-60' : ''}
        >
          <Link href={fmtUrlWithCluster(`/dao/${symbol}/proposal/new`)}>
            <a
              className={`${
                !canCreateProposal
                  ? 'cursor-not-allowed pointer-events-none'
                  : ''
              } flex items-center cursor-pointer text-primary-light hover:text-primary-dark text-sm`}
            >
              <PlusCircleIcon className="flex-shrink-0 h-5 mr-1 w-5" />
              New Proposal
            </a>
          </Link>
        </div>
      </Tooltip>
    </>
  )
}

export default NewProposalBtn
