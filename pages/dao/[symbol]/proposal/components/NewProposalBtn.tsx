import Link from 'next/link'
import { PlusCircleIcon } from '@heroicons/react/outline'
import useQueryContext from '@hooks/useQueryContext'
import useRealm from '@hooks/useRealm'
import React from 'react'

const NewProposalBtn = () => {
  const { fmtUrlWithCluster } = useQueryContext()
  const { symbol, realm, governances, ownVoterWeight } = useRealm()

  const canCreateProposal =
    realm &&
    Object.values(governances).some((g) =>
      ownVoterWeight.canCreateProposal(g.info.config)
    )

  return (
    <div
      className={
        !canCreateProposal
          ? 'cursor-not-allowed pointer-events-none opacity-60'
          : ''
      }
    >
      <Link href={fmtUrlWithCluster(`/dao/${symbol}/proposal/new`)}>
        <a
          className={`default-transition flex items-center rounded-full ring-1 ring-fgd-3 px-3 py-2.5 text-fgd-1 text-sm hover:bg-bkg-3 focus:outline-none`}
        >
          <PlusCircleIcon className="h-5 mr-1.5 text-primary-light w-5" />
          New
        </a>
      </Link>
    </div>
  )
}

export default NewProposalBtn
