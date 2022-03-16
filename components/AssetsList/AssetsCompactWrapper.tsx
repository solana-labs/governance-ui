import React from 'react'
import AssetsList from './AssetsList'
import { ChevronRightIcon } from '@heroicons/react/solid'
import useRealm from '@hooks/useRealm'
import useQueryContext from '@hooks/useQueryContext'
import { useRouter } from 'next/router'
import { LinkButton } from '@components/Button'

const AssetsCompactWrapper = () => {
  const router = useRouter()
  const { symbol } = useRealm()
  const { fmtUrlWithCluster } = useQueryContext()

  return (
    <div className="bg-bkg-2 p-4 md:p-6 rounded-lg">
      <div className="flex items-center justify-between pb-4">
        <h3 className="mb-0">Assets</h3>
        <LinkButton
          className={`flex items-center text-primary-light`}
          onClick={() => {
            const url = fmtUrlWithCluster(`/dao/${symbol}/assets`)
            router.push(url)
          }}
        >
          View
          <ChevronRightIcon className="flex-shrink-0 h-6 w-6" />
        </LinkButton>
      </div>
      <div className="overflow-y-auto" style={{ maxHeight: '350px' }}>
        <AssetsList panelView />
      </div>
    </div>
  )
}

export default AssetsCompactWrapper
