import React from 'react'
import useRealm from 'hooks/useRealm'
import { ChatIcon, CogIcon, UsersIcon } from '@heroicons/react/outline'
import Link from 'next/link'
import useQueryContext from 'hooks/useQueryContext'
import { ExternalLinkIcon } from '@heroicons/react/outline'
import { getRealmExplorerHost } from 'tools/routing'

import useMembersStore from 'stores/useMembersStore'

const RealmHeader = () => {
  const { fmtUrlWithCluster } = useQueryContext()
  const { realmInfo, realmDisplayName, symbol, config } = useRealm()
  const activeMembers = useMembersStore((s) => s.compact.activeMembers)

  const explorerHost = getRealmExplorerHost(realmInfo)
  const realmUrl = `https://${explorerHost}/#/realm/${realmInfo?.realmId.toBase58()}?programId=${realmInfo?.programId.toBase58()}`

  return (
    <div className="px-4 pt-4 pb-4 rounded-t-lg bg-bkg-2 md:px-6 md:pt-6">
      <div className="flex flex-col items-center md:flex-row md:justify-between">
        {realmDisplayName ? (
          <div className="flex items-center">
            <div className="flex flex-col items-center pb-3 md:flex-row md:pb-0">
              <div className="flex items-center">
                <h1 className="ml-3">Orca Governance</h1>
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
          <Link href={fmtUrlWithCluster(`/dao/${symbol}/params`)}>
            <a className="flex items-center text-sm cursor-pointer default-transition text-fgd-2 hover:text-fgd-3">
              <CogIcon className="flex-shrink-0 w-5 h-5 mr-1" />
              Params
            </a>
          </Link>
          <Link href={fmtUrlWithCluster(`/dao/${symbol}/params`)}>
            <a className="flex items-center text-sm cursor-pointer default-transition text-fgd-2 hover:text-fgd-3">
              <ChatIcon className="flex-shrink-0 w-5 h-5 mr-1" />
              Forum
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
