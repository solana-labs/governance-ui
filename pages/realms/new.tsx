import React from 'react'
import { ArrowLeftIcon } from '@heroicons/react/outline'
import useQueryContext from '@hooks/useQueryContext'
import RealmWizard from '@components/RealmWizard/RealmWizard'
import Link from 'next/link'

const New: React.FC = () => {
  const isLoading = false
  const { fmtUrlWithCluster } = useQueryContext()

  return (
    <div
      className={`bg-bkg-2 col-span-12 md:col-span-7 md:order-first lg:col-span-8 order-last p-4 md:p-6 rounded-lg space-y-3 ${
        isLoading ? 'pointer-events-none' : ''
      }`}
    >
      <>
        <Link href={fmtUrlWithCluster('/realms')}>
          <a className="flex items-center text-fgd-3 text-sm transition-all hover:text-fgd-1">
            <ArrowLeftIcon className="h-4 w-4 mr-1 text-primary-light" />
            Back
          </a>
        </Link>
      </>
      <RealmWizard />
    </div>
  )
}

export default New
