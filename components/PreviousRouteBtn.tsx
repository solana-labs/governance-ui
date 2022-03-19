import { ChevronLeftIcon } from '@heroicons/react/solid'
import useRouterHistory from '@hooks/useRouterHistory'
import Link from 'next/link'
import React from 'react'

const PreviousRouteBtn = () => {
  const { getLastRoute } = useRouterHistory()
  const lastUrl = getLastRoute() as string
  return lastUrl ? (
    <Link href={lastUrl ? lastUrl : ''}>
      <a className="default-transition flex items-center text-fgd-2 text-sm transition-all hover:text-fgd-3">
        <ChevronLeftIcon className="h-6 w-6 " />
        Back
      </a>
    </Link>
  ) : null
}
export default PreviousRouteBtn
