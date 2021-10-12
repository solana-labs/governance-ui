import React from 'react'
import useRealm from '../hooks/useRealm'
import { GlobeAltIcon } from '@heroicons/react/outline'
import { ArrowLeftIcon } from '@heroicons/react/solid'
import Link from 'next/link'
import { TwitterIcon } from '../components/icons'
import useRealmContext from '../hooks/useRealmContext'
import useRealmContextStore from '../stores/useRealmContextStore'

const OrganzationsBackNav = () => {
  const { generateUrlWithClusterParam } = useRealmContext()
  const { isRealmContext } = useRealmContextStore((s) => s)
  const { realm, realmInfo } = useRealm()

  const realmName = realmInfo?.displayName ?? realm?.info?.name
  const backNavLink = generateUrlWithClusterParam('/realms')

  return (
    <div className="pb-4">
      {isRealmContext ? (
        <Link href={backNavLink}>
          <a className="default-transition flex items-center mb-6 text-fgd-3 text-sm transition-all hover:text-fgd-1">
            <ArrowLeftIcon className="h-4 w-4 mr-1 text-primary-light" />
            Back
          </a>
        </Link>
      ) : null}
      <div className="border-b border-bkg-4 flex items-center justify-between pb-4">
        {realmName && (
          <div className="flex items-center">
            {realmInfo?.ogImage ? (
              <div className="bg-[rgba(255,255,255,0.1)] rounded-full h-14 w-14 flex items-center justify-center">
                <img className="w-8" src={realmInfo?.ogImage}></img>
              </div>
            ) : (
              <div className="bg-[rgba(255,255,255,0.1)] h-14 w-14 flex font-bold items-center justify-center rounded-full text-fgd-3">
                {realmName?.charAt(0)}
              </div>
            )}
            <h1 className="ml-3">{realmName}</h1>
          </div>
        )}
        <div className="flex items-center space-x-6">
          {realmInfo?.website ? (
            <a
              className="default-transition flex items-center text-fgd-2 text-sm hover:text-fgd-1"
              href={realmInfo?.website}
              target="_blank"
              rel="noopener noreferrer"
            >
              <GlobeAltIcon className="mr-1.5 h-4 w-4" />
              Website
            </a>
          ) : null}
          {realmInfo?.twitter ? (
            <a
              className="default-transition flex items-center text-fgd-2 text-sm hover:text-fgd-1"
              href={`https://twitter.com/${realmInfo?.twitter}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <TwitterIcon className="mr-1.5 h-4 w-4" />
              Twitter
            </a>
          ) : null}
        </div>
      </div>
    </div>
  )
}

export default OrganzationsBackNav
