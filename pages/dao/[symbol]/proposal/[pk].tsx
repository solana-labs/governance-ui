import Link from 'next/link'
import ReactMarkdown from 'react-markdown/react-markdown.min'
import { ArrowLeftIcon, ExternalLinkIcon } from '@heroicons/react/outline'
import useProposal from 'hooks/useProposal'
import ProposalStateBadge from 'components/ProposalStatusBadge'
import { InstructionPanel } from 'components/instructions/instructionPanel'
import DiscussionPanel from 'components/chat/DiscussionPanel'
import VotePanel from 'components/VotePanel'
import ApprovalQuorum from 'components/ApprovalQuorum'
import useRealm from 'hooks/useRealm'
import useProposalVotes from 'hooks/useProposalVotes'
import ProposalTimeStatus from 'components/ProposalTimeStatus'
import { option } from 'tools/core/option'
import useQueryContext from 'hooks/useQueryContext'
import React, { useEffect, useLayoutEffect, useState } from 'react'
import ProposalActionsPanel from '@components/ProposalActions'
import { getRealmExplorerHost } from 'tools/routing'
import TokenBalanceCardWrapper from '@components/TokenBalance/TokenBalanceCardWrapper'
import { ProposalState } from '@solana/spl-governance'
import VoteResultStatus from '@components/VoteResultStatus'
import VoteResults from '@components/VoteResults'
import { resolveProposalDescription } from '@utils/helpers'
import PropertyDataOutput from '@components/PropertyDataOutput'

const Proposal = () => {
	const { fmtUrlWithCluster } = useQueryContext()
	const { symbol, realmInfo } = useRealm()
	const { proposal, descriptionLink } = useProposal()
	const [description, setDescription] = useState('')
	const [descriptionObj, setDescriptionObj] = useState<[any]>()
	const { yesVoteProgress, yesVotesRequired } = useProposalVotes(proposal?.account)
	const [propertyDetails, setPropertyDetails] = useState<any>();

	const showResults = proposal && proposal.account.state !== ProposalState.Cancelled && proposal.account.state !== ProposalState.Draft

	const votePassed = proposal && (proposal.account.state === ProposalState.Completed || proposal.account.state === ProposalState.Executing || proposal.account.state === ProposalState.SigningOff || proposal.account.state === ProposalState.Succeeded)

	useEffect(() => {
		if (descriptionObj && descriptionObj[0].uri) {
			fetch(descriptionObj[0].uri, {
				method: 'GET',
				Accept: 'application/json',
			})
			.then((res) => res.json())
			.then((res) => {
				setPropertyDetails(res);
				return res
			})
			.catch((error) => {
				alert(`Something went wrong. \Please verify the format of the data in ${descriptionObj[0].uri}`)
				console.log('error', error)
			})
		}
	}, [descriptionObj])

	useEffect(() => {
		console.log("hi?")
		const handleResolveDescription = async () => {
			const description = await resolveProposalDescription(descriptionLink)
			setDescription(description)
			console.log("\n\n\n\n\n !!!\n\ndescription", description);
		}
		if (descriptionLink) {
			handleResolveDescription()
			if (descriptionLink.charAt(0) === '{') setDescriptionObj([JSON.parse(descriptionLink)])
			console.log("\n\n\n\n\n !!!\n\ndescription", descriptionLink);
		}
	}, [descriptionLink])

	useEffect(() => {
		console.log("\n\n\n\n\n !!!\n\nproposal", proposal);
	}, [proposal])

	return (
		<div className="grid grid-cols-12 gap-4">
			<div className="bg-bkg-2 p-4 md:p-6 col-span-12 md:col-span-7 lg:col-span-8 space-y-3">
				{proposal ? (
					<>
						<div className="flex flex-items justify-between">
							<Link href={fmtUrlWithCluster(`/dao/${symbol}/`)}>
								<a className="flex items-center text-fgd-3 text-sm transition-all hover:text-fgd-1">&lt; Back</a>
							</Link>

							<div className="flex items-center">
								<a href={`https://${getRealmExplorerHost(realmInfo)}/#/proposal/${proposal.pubkey.toBase58()}?programId=${proposal.owner.toBase58()}`} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
									<ExternalLinkIcon className="flex-shrink-0 h-4 ml-2 mt-0.5 text-primary-light w-4" />
								</a>
							</div>
						</div>

						<div className="py-4">
							<div className="flex items-center justify-between mb-1">
								<h1 className="mr-2">{proposal?.account.name}</h1>
								<ProposalStateBadge proposalPk={proposal.pubkey} proposal={proposal.account} open={true} />
							</div>
						</div>


						{description && (
							<div className="pb-2">
								{ console.log(propertyDetails) }
								{ `Proposal to Request Tokr DAO to mint${(propertyDetails && propertyDetails.name) ? ' the "' + propertyDetails.name : '"' } rNFT.` }
							</div>
						)}


						{ propertyDetails && <>
							<h2 className="mb-4 mt-8">Property Details</h2>
							<PropertyDataOutput className="p-8 border border-green bg-back text-green" propertyDetails={ propertyDetails } />
						</> }

						{ descriptionObj?.map((item, index) => {
							return (
								<div key={'descriptionOutput_' + index} className="pb-8">
									<ul className="list-disc list-inside space-y-2 pt-4">
										{item.uri && (
											<li>
												<span className="inline-flex align-center">
													<b className="inline mr-1">Property Uri:</b>{' '}
													<a className="inline" href={item.uri} target="blank">
														<span className="flex">
															Download <ExternalLinkIcon className="flex-shrink-0 h-4 ml-2 mt-0.5 text-primary-light w-4" />
														</span>
													</a>
												</span>
											</li>
										)}
									</ul>
								</div>
							)
						}) }

						<InstructionPanel />
						<DiscussionPanel />
					</>
				) : (
					<>
						<div className="animate-pulse bg-bkg-3 h-12" />
						<div className="animate-pulse bg-bkg-3 h-64" />
						<div className="animate-pulse bg-bkg-3 h-64" />
					</>
				)}
			</div>

			<div className="col-span-12 md:col-span-5 lg:col-span-4 space-y-4">
				<TokenBalanceCardWrapper proposal={option(proposal?.account)} />
				{showResults ? (
					<div className="bg-bkg-2">
						<div className="p-4 md:p-6">
							{proposal?.account.state === ProposalState.Voting ? (
								<div className="flex items-end justify-between mb-4">
									<h3 className="mb-0">Voting Now</h3>
									<ProposalTimeStatus proposal={proposal?.account} />
								</div>
							) : (
								<h3 className="mb-4">Results</h3>
							)}
							{proposal?.account.state === ProposalState.Voting ? (
								<div className="pb-3">
									<ApprovalQuorum yesVotesRequired={yesVotesRequired} progress={yesVoteProgress} showBg />
								</div>
							) : (
								<div className="pb-3">
									<VoteResultStatus progress={yesVoteProgress} votePassed={votePassed} yesVotesRequired={yesVotesRequired} />
								</div>
							)}
							<VoteResults proposal={proposal.account} />
						</div>
					</div>
				) : null}

				<VotePanel />
				<ProposalActionsPanel />
			</div>
		</div>
	)
}

export default Proposal
