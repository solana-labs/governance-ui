import Link from 'next/link'
import { PlusCircleIcon } from '@heroicons/react/outline'
import useQueryContext from '@hooks/useQueryContext'
import useRealm from '@hooks/useRealm'
import { useMemo } from 'react'
import Tooltip from '@components/Tooltip'
import useWalletOnePointOh from '@hooks/useWalletOnePointOh'
import { useRealmQuery } from '@hooks/queries/realm'
import { useRealmGovernancesQuery } from '@hooks/queries/governance'
import { useLegacyVoterWeight } from '@hooks/queries/governancePower'

const NewProposalBtn = () => {
  const { fmtUrlWithCluster } = useQueryContext()

  const wallet = useWalletOnePointOh()
  const connected = !!wallet?.connected

  const realm = useRealmQuery().data?.result
  const { result: ownVoterWeight } = useLegacyVoterWeight()
  const {
    symbol,
    toManyCommunityOutstandingProposalsForUser,
    toManyCouncilOutstandingProposalsForUse,
  } = useRealm()

  const governancesQuery = useRealmGovernancesQuery()
  const governanceItems = useMemo(() => governancesQuery.data ?? [], [
    governancesQuery.data,
  ])
  const canCreateProposal =
    realm &&
    governanceItems.some((g) =>
      ownVoterWeight?.canCreateProposal(g.account.config)
    ) &&
    !toManyCommunityOutstandingProposalsForUser &&
    !toManyCouncilOutstandingProposalsForUse

  const tooltipContent = !connected
    ? 'Connect your wallet to create new proposal'
    : governanceItems.length === 0
    ? 'There is no governance configuration to create a new proposal'
    : !governanceItems.some((g) =>
        ownVoterWeight?.canCreateProposal(g.account.config)
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
