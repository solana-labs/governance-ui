import Link from 'next/link'
import { PlusCircleIcon } from '@heroicons/react/outline'
import useQueryContext from '@hooks/useQueryContext'
import useRealm from '@hooks/useRealm'
import React, { useEffect } from 'react'
import useWalletStore from 'stores/useWalletStore'
import Tooltip from '@components/Tooltip'

const NewProposalBtn = (props) => {
	const { fmtUrlWithCluster } = useQueryContext()

	const connected = useWalletStore((s) => s.connected)

	const { symbol, realm, governances, ownVoterWeight, toManyCommunityOutstandingProposalsForUser, toManyCouncilOutstandingProposalsForUse } = useRealm()

	const governanceItems = Object.values(governances)

	const canCreateProposal = realm && governanceItems.some((g) => ownVoterWeight.canCreateProposal(g.account.config)) && !toManyCommunityOutstandingProposalsForUser && !toManyCouncilOutstandingProposalsForUse

	const tooltipContent = !connected ? 'Connect your wallet to create new proposal' : governanceItems.length === 0 ? 'There is no governance configuration to create a new proposal' : !governanceItems.some((g) => ownVoterWeight.canCreateProposal(g.account.config)) ? "You don't have enough governance power to create a new proposal" : toManyCommunityOutstandingProposalsForUser ? 'Too many community outstanding proposals. You need to finalize them before creating a new one.' : toManyCouncilOutstandingProposalsForUse ? 'Too many council outstanding proposals. You need to finalize them before creating a new one.' : ''


	useEffect(() => {
		if (props.canCreateProposal && canCreateProposal) props.canCreateProposal(canCreateProposal);
	}, [canCreateProposal])

	return ( props.basic ? <>
		<Link href={fmtUrlWithCluster(`/dao/${symbol}/proposal/new${props.type ? '-' + props.type : ''}${props.string ? '?' + props.string : ''}`)}>
			<a className={`${props.className ? props.className : '' }${!canCreateProposal ? ' cursor-not-allowed pointer-events-none' : 'hover:bg-bkg-3'}`}>
				{props.children || 'New'}
			</a>
		</Link>
	</> :
		<>
			<Tooltip content={tooltipContent}>
				<div className={!canCreateProposal ? 'cursor-not-allowed opacity-60' : ''}>
					<Link href={fmtUrlWithCluster(`/dao/${symbol}/proposal/new${props.type ? '-' + props.type : ''}${props.string ? '?' + props.string : ''}`)}>
						<a className={`${!canCreateProposal ? 'cursor-not-allowed pointer-events-none' : 'hover:bg-bkg-3'} default-transition flex items-center ring-1 ring-fgd-3 px-3 py-2.5 text-fgd-1 text-sm focus:outline-none${props.linkClasses ? ' ' + props.linkClasses : '' }`}>
							{ !props.hideIcon && <PlusCircleIcon className="h-5 mr-1.5 text-primary-light w-5" /> }
							{props.children || 'New'}
						</a>
					</Link>
				</div>
			</Tooltip>
		</>
	)
}

export default NewProposalBtn
