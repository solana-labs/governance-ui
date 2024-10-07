import Link from 'next/link'
import { PlusCircleIcon } from '@heroicons/react/outline'
import useQueryContext from '@hooks/useQueryContext'
import useRealm from '@hooks/useRealm'
import Tooltip from '@components/Tooltip'
import useWalletOnePointOh from '@hooks/useWalletOnePointOh'
import { useRealmQuery } from '@hooks/queries/realm'
import { useRealmVoterWeightPlugins } from '@hooks/useRealmVoterWeightPlugins'

const NewProposalBtn = () => {
  const { fmtUrlWithCluster } = useQueryContext()

  const wallet = useWalletOnePointOh()
  const connected = !!wallet?.connected

  const realm = useRealmQuery().data?.result
  // const { result: ownVoterWeight } = useLegacyVoterWeight()
  const {
    ownVoterWeight: communityOwnVoterWeight,
  } = useRealmVoterWeightPlugins('community')
  const {
    isReady,
    ownVoterWeight: councilOwnVoterWeight,
  } = useRealmVoterWeightPlugins('council')
  const {
    symbol,
    toManyCommunityOutstandingProposalsForUser,
    toManyCouncilOutstandingProposalsForUse,
  } = useRealm()

  const hasVotingPower =
    (communityOwnVoterWeight && communityOwnVoterWeight.value?.gtn(0)) ||
    (councilOwnVoterWeight && councilOwnVoterWeight.value?.gtn(0))

  const canCreateProposal =
    realm &&
    hasVotingPower &&
    !toManyCommunityOutstandingProposalsForUser &&
    !toManyCouncilOutstandingProposalsForUse

  const tooltipContent = !connected
    ? 'Connect your wallet to create new proposal'
    : isReady && !communityOwnVoterWeight && !councilOwnVoterWeight
    ? 'There is no governance configuration to create a new proposal'
    : !hasVotingPower
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
