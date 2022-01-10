import { ArrowLeftIcon } from '@heroicons/react/solid'
import useRouterHistory from '@hooks/useRouterHistory'
import Link from 'next/link'
import React from 'react'

const PreviousRouteBtn = () => {
  const { getLastRoute } = useRouterHistory()
  const lastUrl = getLastRoute() as string
  return lastUrl ? (
    <Link href={lastUrl ? lastUrl : ''}>
      <a className="flex items-center text-fgd-3 text-sm transition-all hover:text-fgd-1 cursor-pointer">
        <ArrowLeftIcon className="h-4 w-4 mr-1 text-primary-light" />
        Back
      </a>
    </Link>
  ) : null
}
export default PreviousRouteBtn
