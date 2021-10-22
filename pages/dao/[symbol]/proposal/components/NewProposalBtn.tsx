import Link from 'next/link'
import { Disclosure } from '@headlessui/react'
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
    <Disclosure
      as="div"
      className={`mr-5 ${
        !canCreateProposal
          ? 'cursor-not-allowed pointer-events-none opacity-60'
          : ''
      }`}
    >
      <Disclosure.Button
        className={`border border-fgd-4 default-transition font-normal pl-3 pr-3 py-2.5 rounded-md text-fgd-1 text-sm hover:bg-bkg-3 focus:outline-none`}
      >
        <Link href={fmtUrlWithCluster(`/dao/${symbol}/proposal/new`)}>
          + New
        </Link>
      </Disclosure.Button>
    </Disclosure>
  )
}

export default NewProposalBtn
