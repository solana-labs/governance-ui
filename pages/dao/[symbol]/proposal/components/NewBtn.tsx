import Link from 'next/link'
import { Disclosure } from '@headlessui/react'
import useQueryContext from '@hooks/useQueryContext'
import useRealm from '@hooks/useRealm'
import React from 'react'
import { BN } from '@project-serum/anchor'

const NewBtn = () => {
  const { generateUrlWithClusterParam } = useQueryContext()
  const { symbol, ownTokenRecord, realm } = useRealm()
  const canCreateProposal =
    ownTokenRecord &&
    realm &&
    ownTokenRecord.info.governingTokenDepositAmount.cmp(
      new BN(realm.info.config.minCommunityTokensToCreateGovernance)
    ) >= 0
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
        <Link href={generateUrlWithClusterParam(`/dao/${symbol}/proposal/new`)}>
          + New
        </Link>
      </Disclosure.Button>
    </Disclosure>
  )
}

export default NewBtn
