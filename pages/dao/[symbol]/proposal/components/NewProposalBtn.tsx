import Link from 'next/link'
import { PlusCircleIcon } from '@heroicons/react/outline'
import useQueryContext from '@hooks/useQueryContext'
import useRealm from '@hooks/useRealm'
import Tooltip from '@components/Tooltip'
import { useCanCreateProposal } from '@hooks/useCreateProposal'

const NewProposalBtn = () => {
  const { fmtUrlWithCluster } = useQueryContext()

  const { symbol } = useRealm()

  const { canCreateProposal, error: tooltipContent } = useCanCreateProposal()

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
