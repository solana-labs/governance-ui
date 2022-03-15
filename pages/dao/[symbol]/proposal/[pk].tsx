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
import VoteResults, { getVotingResults } from '@components/VoteResults'
import { resolveProposalDescription } from '@utils/helpers'
import PropertyDataOutput from '@components/PropertyDataOutput'
import Loader from '@components/Loader'
import { isSolanaBrowser } from '@utils/browserInfo'
import useRouterHistory from '@hooks/useRouterHistory'
import useInterval from '@hooks/useInterval'
import { checkArDataKey, getArData, setArData } from '@hooks/useLocalStorage'
import useWalletStore from 'stores/useWalletStore'
import { useHasVoteTimeExpired } from '@hooks/useHasVoteTimeExpired'

const Proposal = () => {
	const [initalLoad, setInitalLoad] = useState<boolean>(true)
	const { fmtUrlWithCluster } = useQueryContext()
	const { governance } = useWalletStore((s) => s.selectedProposal)
	const { symbol, realmInfo, realmDisplayName, governances, ownVoterWeight  } = useRealm()
	const { history } = useRouterHistory()
	const { proposal, descriptionLink } = useProposal()
	const [description, setDescription] = useState<any>('')
	const [descriptionObj, setDescriptionObj] = useState<[any]>()
	const [proposalType, setProposalType] = useState<Number>(0)
	const { yesVoteProgress, yesVotesRequired } = useProposalVotes(proposal?.account)
	const [propertyDetails, setPropertyDetails] = useState<any>()

	const showResults = proposal && proposal.account.state !== ProposalState.Cancelled && proposal.account.state !== ProposalState.Draft

	const votePassed = proposal && (proposal.account.state === ProposalState.Completed || proposal.account.state === ProposalState.Executing || proposal.account.state === ProposalState.SigningOff || proposal.account.state === ProposalState.Succeeded)

	const hasVoteTimeExpired = useHasVoteTimeExpired(governance, proposal!);
	const isVoting = proposal?.account.state === ProposalState.Voting && !hasVoteTimeExpired

	const [solanaBrowser, setSolanaBrowser] = useState<boolean>(false)

	useLayoutEffect(() => {
		setSolanaBrowser(isSolanaBrowser())
	}, [])

	useLayoutEffect(() => {
		if (propertyDetails && proposalType) {
			setInitalLoad(false)
		}
	}, [propertyDetails, proposalType])

	const getDataObj = async (retry?:boolean) => {
		if (!descriptionObj) return false
		if (descriptionObj && descriptionObj[0].uri) {
			const tempId = descriptionObj[0].uri.split('.net/')[1].toString();
			if (checkArDataKey(tempId) && !retry) {
				return getArData(tempId);
			} else {
				return fetch(descriptionObj[0].uri, {
					method: 'GET',
				}).then((res) => res.json())
				.then(res => {
					setArData(tempId, res);
					console.log("not LOCAL!")
					return res;
				})
			}
		}
	}

	useLayoutEffect(() => {
		if (descriptionObj && descriptionObj[0].uri) {
			getDataObj()
				.then((res) => {
					setPropertyDetails(res)
					return res
				})
				.catch((error) => {
					console.log(`Something went wrong.\nPlease verify the format of the data in ${descriptionObj[0].uri}`)
					console.log('error', error)
				})
		}

		if (descriptionObj && descriptionObj[0].type) {
			setProposalType(descriptionObj[0].type)

			if (descriptionObj[0].type) {
				setInitalLoad(true)
			}
		}
	}, [descriptionObj])

	useLayoutEffect(() => {
		const handleResolveDescription = async () => {
			const description = await resolveProposalDescription(descriptionLink)
			setDescription(description)
		}
		if (descriptionLink) {
			handleResolveDescription()
			if (descriptionLink.charAt(0) === '{') setDescriptionObj([JSON.parse(descriptionLink)])
		}
	}, [descriptionLink])


	const [canCreateAction, setcanCreateAction] = useState(false)
	const governanceItems = Object.values(governances)
	useEffect(() => {
		setcanCreateAction(governanceItems.some((g) => ownVoterWeight.canCreateProposal(g.account.config)))
	}, [governanceItems, history])

	const [delay, setDelay] = useState<number>(3000)
	const [isPolling, setPolling] = useState<boolean>(true)
	const [pollingCount, setPollingCount] = useState<number>(0)

	useEffect(() => {
		if (pollingCount >= 6) {
			setPolling(false);
			setInitalLoad(false);
		} else {
			const msg = `Something went wrong. Please try to refresh the page.\nIf the issue persists, please contact support@rhove.com`
			if (pollingCount === 10) {
				alert(msg)
			} else {
				console.log(`Attempt [${pollingCount}]` + msg)
			}
		}
	}, [pollingCount])

	useInterval(
		() => {
			setInitalLoad(true)
			if (propertyDetails && typeof propertyDetails === 'object' && propertyDetails?.name) {
				setPolling(false)
				setInitalLoad(false)
			} else {
				setPollingCount(pollingCount + 1)

				if (descriptionObj && descriptionObj[0].uri) {
					getDataObj(true)
						.then((res) => {
							setPropertyDetails(res);
							setPolling(false);
							setInitalLoad(false);
							return res
						})
						.then((res) => {
							return res
						})
						.catch((error) => {
							const msg = `Something went wrong. \Please verify the format of the data in ${descriptionObj && descriptionObj[0].uri} or refresh the page.`
							if (pollingCount === 10) {
								alert(msg)
							} else {
								console.log(`Attempt [${pollingCount}]` + msg)
							}
							setPolling(false)
							setInitalLoad(false)
							console.log('error', error)
						})
				}
			}
		},
		isPolling ? delay : null
	)

	useEffect(() => {
		console.log("votePassed", votePassed);
	}, [])

	return initalLoad ? (
		<Loader />
	) : (
		<>
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
							{proposalType === 0 ? (
								<div>
									{propertyDetails?.description && (
										<div className="p-8 border border-green bg-back text-green -mb-px">
											<ReactMarkdown>{propertyDetails?.description}</ReactMarkdown>
										</div>
									)}

									{canCreateAction && (
										<div className="border border-green p-8 text-center">
											{isVoting && <p className="pb-8">Cast Your Vote</p>}
											<VotePanel simple className="" />
										</div>
									)}
								</div>
							) : (
								<>
									{description && propertyDetails?.name && <div className="pb-2">{proposalType === 1 ? <>{`Proposal to Purchase Real Estate and Begin Syndication for ${propertyDetails.name}${propertyDetails.property_address ? ` at ${propertyDetails.property_address}` : ''}.`}</> : <>{`Proposal to Request Tokr DAO to certify and mint${propertyDetails && propertyDetails.name ? ' the "' + propertyDetails.name : '"'} rNFT.`}</>}</div>}
									{canCreateAction && (
										<div className="border border-green p-8 text-center">
											<p className="pb-8">
												Should the {realmDisplayName ? realmDisplayName : 'DAO'} purchase &quot;{propertyDetails?.name ? propertyDetails?.name : 'property'}&quot;?
											</p>
											<VotePanel simple className="" />
										</div>
									)}
									{propertyDetails && (
										<div>
											<h2 className="mb-4 mt-8">Property Details</h2>
											<PropertyDataOutput className="p-8 border border-green bg-back text-green" propertyDetails={propertyDetails} />
											{descriptionObj?.map((item, index) => {
												return (
													<div key={'descriptionOutput_' + index} className="relative bg-green text-dark">
														<ul className="list-disc list-inside pl-8 pr-4 space-y-2 py-2 text-xs">
															{item.uri && (
																<li>
																	<span className="inline-flex align-center">
																		<a className="inline" href={item.uri} target="blank">
																			<span className="flex items-start">
																				Download <ExternalLinkIcon className="flex-shrink-0 h-3 ml-2 mt-0.5 text-dark w-3" />
																			</span>
																		</a>
																	</span>
																</li>
															)}
														</ul>
													</div>
												)
											})}
										</div>
									)}
								</>
							)}

							<InstructionPanel />
							<DiscussionPanel canCreateAction={canCreateAction} solanaBrowser={solanaBrowser} />
						</>
					) : (
						<>
							<div className="animate-pulse bg-bkg-3 h-12" />
							<div className="animate-pulse bg-bkg-3 h-64" />
							<div className="animate-pulse bg-bkg-3 h-64" />
						</>
					)}
				</div>

				<div className="col-span-12 md:col-span-5 lg:col-span-4">
					<div className="pb-4">
						<TokenBalanceCardWrapper proposal={option(proposal?.account)} />
					</div>
					{showResults ? (
						<div className="pt-14">
							<div className="border border-green mt-4 py-4 md:py-6">
								<div className="px-4 md:px-6">
									{proposal?.account.state === ProposalState.Voting ? (
										<div className="flex items-end justify-between pb-2 border-b border-green">
											<h3 className="mb-0">Voting Now</h3>
											<ProposalTimeStatus proposal={proposal?.account} />
										</div>
									) : (
										<h3 className="flex items-end justify-between pb-2 border-b border-green">Results</h3>
									)}
									{proposal?.account.state === ProposalState.Voting ? (
										<div className="pt-6">
											<ApprovalQuorum yesVotesRequired={yesVotesRequired} progress={yesVoteProgress} showBg />
										</div>
									) : (
										<div className="pt-6">
											<VoteResultStatus progress={yesVoteProgress} votePassed={votePassed} yesVotesRequired={yesVotesRequired} />
										</div>
									)}
									<VoteResults proposal={proposal.account} />
								</div>
							</div>
						</div>
					) : null}

					{canCreateAction && (
						<>
							<div className="border border-green p-4 md:p-6 -mt-px">
								<VotePanel className={!isVoting === true ? 'text-center' : ''} isVoting={isVoting ? true : false} />
							</div>
							<div className="hidden">
								<ProposalActionsPanel />
							</div>{' '}
						</>
					)}
				</div>
			</div>
		</>
	)
}

export default Proposal
