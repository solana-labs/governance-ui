import React from 'react'
import useRealm from 'hooks/useRealm'
import { CogIcon } from '@heroicons/react/outline'
import { ChevronLeftIcon, BadgeCheckIcon } from '@heroicons/react/solid'
import Link from 'next/link'
import useQueryContext from 'hooks/useQueryContext'
import { ExternalLinkIcon } from '@heroicons/react/outline'
import { getRealmExplorerHost } from 'tools/routing'
import Tooltip from './Tooltip'

const RealmHeader = () => {
  const { fmtUrlWithCluster } = useQueryContext()
  const { realmInfo, realmDisplayName, symbol } = useRealm()
  const { REALM } = process.env

  const isBackNavVisible = realmInfo?.symbol !== REALM // hide backnav for the default realm

  const explorerHost = getRealmExplorerHost(realmInfo)
  const realmUrl = `https://${explorerHost}/#/realm/${realmInfo?.realmId.toBase58()}?programId=${realmInfo?.programId.toBase58()}`

  return (
    <div className="bg-bkg-3 px-4 md:px-6 pb-4 pt-4 md:pt-6 rounded-t-lg">
      <div
        className={`flex items-center ${
          isBackNavVisible ? 'justify-between' : 'justify-end'
        } mb-2 md:mb-4`}
      >
        {isBackNavVisible ? (
          <Link href={fmtUrlWithCluster('/realms')}>
            <a className="default-transition flex items-center text-fgd-2 text-sm transition-all hover:text-fgd-3">
              <ChevronLeftIcon className="h-6 w-6 " />
              Back
            </a>
          </Link>
        ) : null}
      </div>
      <div className="flex flex-col md:flex-row items-center  md:justify-between">
        {realmDisplayName ? (
          <div className="flex items-center">
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
              <div className="flex items-center">
                <h1 className="ml-3">{realmDisplayName}</h1>
                {realmInfo?.isCertified ? (
                  <Tooltip content="Certified DAO">
                    <BadgeCheckIcon className="cursor-help h-5 ml-1.5 text-green w-5" />
                  </Tooltip>
                ) : null}
              </div>
            </div>
          </div>
        ) : (
          <div className="animate-pulse bg-bkg-3 h-10 w-40 rounded-md" />
        )}
        <div className="flex items-center space-x-4">
          <Link href={fmtUrlWithCluster(`/dao/${symbol}/params`)}>
            <a className="default-transition flex items-center cursor-pointer text-fgd-2 hover:text-fgd-3 text-sm">
              <CogIcon className="flex-shrink-0 h-5 mr-1 w-5" />
              Params
            </a>
          </Link>

          <a
            className="default-transition flex items-center text-fgd-2 hover:text-fgd-3 text-sm"
            href={realmUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            <ExternalLinkIcon className="flex-shrink-0 h-5 w-5" />
          </a>
        </div>
      </div>
    </div>
  )
}

export default RealmHeader
