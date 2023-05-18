import React from 'react'
import useRealm from 'hooks/useRealm'
import { ChartPieIcon, CogIcon, UsersIcon } from '@heroicons/react/outline'
import { ChevronLeftIcon } from '@heroicons/react/solid'
import Link from 'next/link'
import useQueryContext from 'hooks/useQueryContext'
import { ExternalLinkIcon } from '@heroicons/react/outline'
import { getRealmExplorerHost } from 'tools/routing'

import useMembersStore from 'stores/useMembersStore'
import { tryParsePublicKey } from '@tools/core/pubkey'
import { useRealmQuery } from '@hooks/queries/realm'
import { useRealmConfigQuery } from '@hooks/queries/realmConfig'

const RealmHeader = () => {
  const { fmtUrlWithCluster } = useQueryContext()
  const realm = useRealmQuery().data?.result
  const config = useRealmConfigQuery().data?.result

  const { realmInfo, symbol, vsrMode } = useRealm()
  const { REALM } = process.env
  const activeMembers = useMembersStore((s) => s.compact.activeMembers)
  const isBackNavVisible = realmInfo?.symbol !== REALM // hide backnav for the default realm

  const explorerHost = getRealmExplorerHost(realmInfo)
  const realmUrl = `https://${explorerHost}/#/realm/${realmInfo?.realmId.toBase58()}?programId=${realmInfo?.programId.toBase58()}`

  return (
    <div className="px-4 pt-4 pb-4 rounded-t-lg bg-bkg-2 md:px-6 md:pt-6">
      <div
        className={`flex items-center ${
          isBackNavVisible ? 'justify-between' : 'justify-end'
        } mb-2 md:mb-4`}
      >
        {isBackNavVisible ? (
          <Link href={fmtUrlWithCluster('/realms')}>
            <a className="flex items-center text-sm transition-all default-transition text-fgd-2 hover:text-fgd-3">
              <ChevronLeftIcon className="w-6 h-6 " />
              Back
            </a>
          </Link>
        ) : null}
      </div>
      <div className="flex flex-col items-center md:flex-row md:justify-between">
        {realmInfo?.displayName ? (
          <div className="flex items-center">
            <div className="flex flex-col items-center pb-3 md:flex-row md:pb-0">
              {realmInfo?.ogImage ? (
                <img
                  className="flex-shrink-0 w-8 mb-2 md:mb-0"
                  src={realmInfo?.ogImage}
                ></img>
              ) : (
                <div className="bg-[rgba(255,255,255,0.1)] h-14 w-14 flex font-bold items-center justify-center rounded-full text-fgd-3">
                  {realmInfo.displayName.charAt(0)}
                </div>
              )}
              <div className="flex items-center">
                <h1 className="ml-3">{realmInfo.displayName}</h1>
              </div>
            </div>
          </div>
        ) : (
          <div className="w-40 h-10 rounded-md animate-pulse bg-bkg-3" />
        )}
        <div className="flex items-center space-x-4">
          {!config?.account.communityTokenConfig.voterWeightAddin && (
            <Link href={fmtUrlWithCluster(`/dao/${symbol}/members`)}>
              <a className="flex items-center text-sm cursor-pointer default-transition text-fgd-2 hover:text-fgd-3">
                <UsersIcon className="flex-shrink-0 w-5 h-5 mr-1" />
                Members ({activeMembers.length})
              </a>
            </Link>
          )}
          {vsrMode === 'default' && (
            <Link href={fmtUrlWithCluster(`/dao/${symbol}/token-stats`)}>
              <a className="flex items-center text-sm cursor-pointer default-transition text-fgd-2 hover:text-fgd-3">
                <ChartPieIcon className="flex-shrink-0 w-5 h-5 mr-1" />
                {typeof symbol === 'string' && tryParsePublicKey(symbol)
                  ? realm?.account.name
                  : symbol}{' '}
                stats
              </a>
            </Link>
          )}
          <Link href={fmtUrlWithCluster(`/dao/${symbol}/params`)}>
            <a className="flex items-center text-sm cursor-pointer default-transition text-fgd-2 hover:text-fgd-3">
              <CogIcon className="flex-shrink-0 w-5 h-5 mr-1" />
              Params
            </a>
          </Link>
          <a
            className="flex items-center text-sm default-transition text-fgd-2 hover:text-fgd-3"
            href={realmUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            <ExternalLinkIcon className="flex-shrink-0 w-5 h-5" />
          </a>
        </div>
      </div>
    </div>
  )
}

export default RealmHeader
