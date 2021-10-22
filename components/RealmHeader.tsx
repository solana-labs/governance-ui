import React from 'react'
import useRealm from '../hooks/useRealm'
import { GlobeAltIcon } from '@heroicons/react/outline'
import { ArrowLeftIcon } from '@heroicons/react/solid'
import Link from 'next/link'
import { TwitterIcon } from './icons'
import useQueryContext from '../hooks/useQueryContext'
import { ExternalLinkIcon } from '@heroicons/react/outline'

const RealmHeader = () => {
  const { fmtUrlWithCluster } = useQueryContext()
  const { realmInfo, realmDisplayName } = useRealm()
  const { REALM } = process.env

  const isBackNavVisible = realmInfo?.symbol !== REALM // hide backnav for the default realm

  const mvpUrl = `https://dao.mango.markets/#/realm/${realmInfo?.realmId.toBase58()}?programId=${realmInfo?.programId.toBase58()}`

  return (
    <div className="pb-4">
      {isBackNavVisible ? (
        <Link href={fmtUrlWithCluster('/realms')}>
          <a className="default-transition flex items-center mb-2 md:mb-6 text-fgd-3 text-sm transition-all hover:text-fgd-1">
            <ArrowLeftIcon className="h-4 w-4 mr-1 text-primary-light" />
            Back
          </a>
        </Link>
      ) : null}
      <div className="border-b border-fgd-4 flex flex-col md:flex-row items-center justify-between pb-3">
        {realmDisplayName && (
          <a href={mvpUrl} target="_blank" rel="noopener noreferrer">
            <div className="flex items-start cursor-pointer">
              <div className="flex flex-col md:flex-row items-center pb-3 md:pb-0">
                {realmInfo?.ogImage ? (
                  <img
                    className="flex-shrink-0 mb-2 md:mb-0 w-8"
                    src={realmInfo?.ogImage}
                  ></img>
                ) : (
                  <div className="bg-[rgba(255,255,255,0.1)] h-14 w-14 flex font-bold items-center justify-center rounded-full text-fgd-3">
                    {realmDisplayName?.charAt(0)}
                  </div>
                )}
                <h1 className="ml-3">{realmDisplayName}</h1>
              </div>
              <ExternalLinkIcon
                className={`flex-shrink-0 h-4 w-4 ml-2 text-primary-light`}
              />
            </div>
          </a>
        )}
        <div className="flex items-center space-x-6">
          {realmInfo?.website ? (
            <a
              className="default-transition flex items-center text-fgd-1 text-sm hover:text-primary-light"
              href={realmInfo?.website}
              target="_blank"
              rel="noopener noreferrer"
            >
              <GlobeAltIcon className="mr-1.5 h-4 text-primary-light w-4" />
              Website
            </a>
          ) : null}
          {realmInfo?.twitter ? (
            <a
              className="default-transition flex items-center text-fgd-1 text-sm hover:text-primary-light"
              href={`https://twitter.com/${realmInfo?.twitter}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <TwitterIcon className="mr-1.5 h-4 text-primary-light w-4" />
              Twitter
            </a>
          ) : null}
        </div>
      </div>
    </div>
  )
}

export default RealmHeader
