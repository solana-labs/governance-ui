import React from 'react'
import useRealm from 'hooks/useRealm'
import { GlobeAltIcon } from '@heroicons/react/outline'
import { ArrowLeftIcon } from '@heroicons/react/solid'
import Link from 'next/link'
import { TwitterIcon } from './icons'
import useQueryContext from 'hooks/useQueryContext'
import { ExternalLinkIcon } from '@heroicons/react/outline'
import { getRealmExplorerHost } from 'tools/routing'

const RealmHeader = () => {
	const { fmtUrlWithCluster } = useQueryContext()
	const { realmInfo, realmDisplayName } = useRealm()
	const { REALM } = process.env

	const isBackNavVisible = realmInfo?.symbol !== REALM // hide backnav for the default realm

	const explorerHost = getRealmExplorerHost(realmInfo)
	const realmUrl = `https://${explorerHost}/#/realm/${realmInfo?.realmId.toBase58()}?programId=${realmInfo?.programId.toBase58()}`

	return (
		<>
			{isBackNavVisible ? (
				<Link href={fmtUrlWithCluster('/realms')}>
					<a className="uppercase default-transition flex items-center mb-2 md:mb-6 text-fgd-3 text-sm transition-all hover:text-fgd-1">&lt; Back</a>
				</Link>
			) : null}
			<div className="ml-4 -mb-5 relative z-10 m-width-full">
				<a href={realmUrl} target="_blank" rel="noopener noreferrer" className="bg-dark inline-block">
					<span className="flex items-center cursor-pointer">
						<span className="flex flex-col md:flex-row items-center pb-3 md:pb-0">
							<span className="ml-4 pr-8 text-3xl uppercase">{realmDisplayName}</span>
						</span>
					</span>
				</a>
			</div>
		</>
	)
}

export default RealmHeader
