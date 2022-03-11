import useWalletStore from 'stores/useWalletStore'
import useRealm from 'hooks/useRealm'
import React, { useEffect, useLayoutEffect, useState } from 'react'
import ProposalFilter from 'components/ProposalFilter'
import ProposalCard from 'components/ProposalCard'
import { Governance, ProgramAccount, Proposal, ProposalState } from '@solana/spl-governance'
import NewProposalBtn from './proposal/components/NewProposalBtn'
import RealmHeader from 'components/RealmHeader'
import { PublicKey } from '@solana/web3.js'
import AccountsCompactWrapper from '@components/TreasuryAccount/AccountsCompactWrapper'
import MembersCompactWrapper from '@components/Members/MembersCompactWrapper'
import AssetsCompactWrapper from '@components/AssetsList/AssetsCompactWrapper'
import NFTSCompactWrapper from '@components/NFTS/NFTSCompactWrapper'
import useGovernanceAssets from '@hooks/useGovernanceAssets'
import useTreasuryAccountStore from 'stores/useTreasuryAccountStore'
import { usePrevious } from '@hooks/usePrevious'
import TokenBalanceCardWrapper from '@components/TokenBalance/TokenBalanceCardWrapper'
import DepositLabel from '@components/TreasuryAccount/DepositLabel'
import Loader from '@components/Loader'
import { isSolanaBrowser } from '@utils/browserInfo'
import useRouterHistory from '@hooks/useRouterHistory'
import { buttonStyles } from '@components/Button'

const compareProposals = (
	p1: Proposal,
	p2: Proposal,
	governances: {
		[governance: string]: ProgramAccount<Governance>
	}
) => {
	const p1Rank = p1.getStateSortRank()
	const p2Rank = p2.getStateSortRank()

	if (p1Rank > p2Rank) {
		return 1
	} else if (p1Rank < p2Rank) {
		return -1
	}

	if (p1.state === ProposalState.Voting && p2.state === ProposalState.Voting) {
		const p1VotingRank = getVotingStateRank(p1, governances)
		const p2VotingRank = getVotingStateRank(p2, governances)

		if (p1VotingRank > p2VotingRank) {
			return 1
		} else if (p1VotingRank < p2VotingRank) {
			return -1
		}

		// Show the proposals in voting state expiring earlier at the top
		return p2.getStateTimestamp() - p1.getStateTimestamp()
	}

	return p1.getStateTimestamp() - p2.getStateTimestamp()
}

/// Compares proposals in voting state to distinguish between Voting and Finalizing states
function getVotingStateRank(
	proposal: Proposal,
	governances: {
		[governance: string]: ProgramAccount<Governance>
	}
) {
	// Show proposals in Voting state before proposals in Finalizing state
	const governance = governances[proposal.governance.toBase58()]?.account
	return proposal.hasVoteTimeEnded(governance) ? 0 : 1
}

const REALM = () => {
	const [initalLoad, setInitalLoad] = useState<boolean>(true)
	const { history } = useRouterHistory()

	const { realm, realmInfo, proposals, realmTokenAccount, ownTokenRecord, governances, realmDisplayName, ownVoterWeight, toManyCommunityOutstandingProposalsForUser, toManyCouncilOutstandingProposalsForUse } = useRealm()
	const { nftsGovernedTokenAccounts } = useGovernanceAssets()
	const prevStringifyNftsGovernedTokenAccounts = usePrevious(JSON.stringify(nftsGovernedTokenAccounts))
	const connection = useWalletStore((s) => s.connection.current)
	const { getNfts } = useTreasuryAccountStore()
	const [filters, setFilters] = useState<ProposalState[]>([])
	const [displayedProposals, setDisplayedProposals] = useState(Object.entries(proposals))
	const [filteredProposals, setFilteredProposals] = useState(displayedProposals)
	const wallet = useWalletStore((s) => s.current)
	const [realmName, setRealmName] = useState()

	const allProposals = Object.entries(proposals).sort((a, b) => compareProposals(b[1].account, a[1].account, governances))

	const governanceItems = Object.values(governances)
	const canCreateProposal = realm && governanceItems.some((g) => ownVoterWeight.canCreateProposal(g.account.config)) && !toManyCommunityOutstandingProposalsForUser && !toManyCouncilOutstandingProposalsForUse
	const [canCreate, setCanCreate] = useState(canCreateProposal)

	const [solanaBrowser, setSolanaBrowser] = useState<boolean>(false)
	const connected = useWalletStore((s) => s.connected)

	const [canCreateAction, setcanCreateAction] = useState(false)

	useEffect(() => {
		setcanCreateAction(governanceItems.some((g) => ownVoterWeight.canCreateProposal(g.account.config)))
	}, [canCreateProposal, governanceItems, history])

	useLayoutEffect(() => {
		setSolanaBrowser(isSolanaBrowser())
	}, [])

	useLayoutEffect(() => {
		if (!solanaBrowser) setCanCreate(false)
	}, [solanaBrowser])

	useEffect(() => {
		setCanCreate(canCreateProposal)
	}, [canCreateProposal])

	useEffect(() => {
		if (filters.length > 0) {
			const proposals = displayedProposals.filter(([, v]) => !filters.includes(v.account.state))
			setFilteredProposals(proposals)
		} else {
			setFilteredProposals(allProposals)
		}
	}, [filters])

	useEffect(() => {
		const proposals = filters.length > 0 ? allProposals.filter(([, v]) => !filters.includes(v.account.state)) : allProposals
		setDisplayedProposals(proposals)
		setFilteredProposals(proposals)
	}, [proposals])

	useEffect(() => {
		if (prevStringifyNftsGovernedTokenAccounts !== JSON.stringify(nftsGovernedTokenAccounts)) {
			getNfts(nftsGovernedTokenAccounts, connection)
		}
	}, [JSON.stringify(nftsGovernedTokenAccounts)])

	// DEBUG print remove
	// console.log('governance page tokenAccount', realmTokenAccount && realmTokenAccount.publicKey.toBase58())

	// console.log('governance page wallet', wallet?.connected && wallet?.publicKey?.toBase58())

	// console.log('governance page tokenRecord', wallet?.connected && ownTokenRecord)

	const [tokrProposals, setTokrProposals] = useState<any>([])

	const tokrProposalsTemp = async () =>
		filteredProposals.filter((proposal) => {
			const extendedProposalData = proposal[1].account.descriptionLink.charAt(0) === '{' ? JSON.parse(proposal[1].account.descriptionLink) : null
			if (extendedProposalData) {
				const tempObj = Object.assign(proposal[1].account, { meta: extendedProposalData })
				const tempProposal = extendedProposalData && [proposal[0], tempObj, [extendedProposalData]]
				return tempProposal
			}
		})

	const start = async () => {
		const getTokrProposals = await tokrProposalsTemp()
		setTokrProposals(getTokrProposals)
		if (realmName || realmDisplayName) setInitalLoad(false)
	}

	useLayoutEffect(() => {
		if (filteredProposals?.length) {
			start()
		} else {
			if (realmName || realmDisplayName) setInitalLoad(false)
		}
	}, [filteredProposals, realmName])

	const [proposalType0, setProposalType0] = useState<any>([])
	const [proposalType1, setProposalType1] = useState<any>([])
	const [proposalType2, setProposalType2] = useState<any>([])
	// const [proposalType3, setProposalType3] = useState<any>([])
	// const [proposalType4, setProposalType4] = useState<any>([])

	useLayoutEffect(() => {
		setProposalType0(
			tokrProposals.filter((proposal) => {
				if (proposal[1].account?.meta?.type === 0) return proposal
			})
		)

		setProposalType1(
			tokrProposals.filter((proposal) => {
				if (proposal[1].account?.meta?.type === 1) return proposal
			})
		)
		setProposalType2(
			tokrProposals.filter((proposal) => {
				if (proposal[1].account?.meta?.type === 2) return proposal
			})
		)
		// setProposalType3(
		// 	tokrProposals.filter((proposal) => {
		// 		if (proposal[1].account?.meta?.type === 3) return proposal
		// 	})
		// )
		// setProposalType4(
		// 	tokrProposals.filter((proposal) => {
		// 		if (proposal[1].account?.meta?.type === 4) return proposal
		// 	})
		// )
	}, [tokrProposals])

	return initalLoad ? (
		<Loader />
	) : (
		<>
			<div>
				<RealmHeader getRealmDisplayName={(name) => setRealmName(name)} />
				<div className="grid grid-cols-12 gap-4">
					<div className="border border-fgd-1 bg-bkg-2 col-span-12 md:col-span-7 md:order-first lg:col-span-8 order-last pt-10 pb-8 px-8">
						{/* <div>
						{realmInfo?.bannerImage ? (
							<>
								<img className="mb-10 h-80" src={realmInfo?.bannerImage}></img>
								{ temp. setup for Ukraine.SOL}
								{realmInfo.realmId.equals(new PublicKey('5piGF94RbCqaogoFFWA9cYmt29qUpQejGCEjRKuwCz7d')) ? (
									<div>
										<div className="mb-10">
											<DepositLabel abbreviatedAddress={false} header="Wallet Address" transferAddress={new PublicKey('66pJhhESDjdeBBDdkKmxYYd7q6GUggYPWjxpMKNX39KV')}></DepositLabel>
										</div>
									</div>
								) : null}
							</>
						) : null}
					</div> */}

						{tokrProposals.length > 0 ? (
							<>
								<div className={`space-y-16${canCreate ? ' mt-16' : ''}`}>
									{proposalType1.length > 0 && (
										<div>
											<div>
												<div className="flex items-center justify-between">
													<h2 className="text-2xl uppercase">{`Purchase Real Estate Proposal${proposalType1.length > 0 ? 's' : ''}`}</h2>
													{canCreate && (<div className="flex-shrink-0">
														<NewProposalBtn string={`property=true`} addIcon title="Propose Another Property">
															Propose Another Property
														</NewProposalBtn>
													</div> ) }
												</div>


												{proposalType1.map(([k, v]) => {
													return <ProposalCard cta={<NewProposalBtn linkClasses={`inline-flex text-xs py-1 px-2 ${ buttonStyles }`} basic string={`uri=${v.account?.meta?.uri?.split('.net/')[1]}`} hideIcon children="Request Certification" />} key={k} proposalPk={new PublicKey(k)} proposal={v.account} />
												})}
											</div>
										</div>
									)}
									{proposalType2.length > 0 && (
										<div>
											<h2 className="text-2xl uppercase">{`Request Tokr DAO to mint rNFT Proposal${proposalType2.length > 0 ? 's' : ''}`}</h2>
											{proposalType2.map(([k, v]) => {
												return <ProposalCard cta={<NewProposalBtn linkClasses={`inline-flex text-xs py-1 px-2 ${ buttonStyles }`} basic string={`uri=${v.account?.meta?.uri?.split('.net/')[1]}`} hideIcon children="Tokrize" type={`tokrize`} />} key={k} proposalPk={new PublicKey(k)} proposal={v.account} />
											})}
										</div>
									)}
								</div>
							</>
						) : (
							<div className="pb-4">
								{realmDisplayName} has no proposals
								{canCreate ? (
									<>
										{` `}get started by{' '}
										<NewProposalBtn string={`property=true`} basic className={`underline`}>
											submitting your first property
										</NewProposalBtn>
										!{' '}
									</>
								) : (
									<>.</>
								)}
							</div>
						)}

						{canCreate && tokrProposals.length === 0 && (
							<NewProposalBtn string={`property=true`} hideIcon linkClasses="text-center text-lg flex flex-grow items-center justify-center border border-green w-full max-w-xs bg-green text-black hover:text-green">
								{tokrProposals.length > 0 ? 'Propose Another Property' : 'Propose Your First Property'}
							</NewProposalBtn>
						)}

						{(proposalType0?.length === 0 && !solanaBrowser) || (proposalType0?.length === 0 && !canCreateAction) ? (
							<></>
						) : (
							<div className="mt-16">
								<h2 className="text-2xl uppercase">{`General DAO Proposals`}</h2>
								{proposalType0.map(([k, v]) => {
									return <ProposalCard key={k} proposalPk={new PublicKey(k)} proposal={v.account} />
								})}

								<p className="pb-4">General proposals for the {realmDisplayName} DAO to discuss and vote.</p>

								{solanaBrowser && connected && (
									<NewProposalBtn string={`type=0`} hideIcon linkClasses="text-center text-lg flex flex-grow items-center justify-center border border-green w-full max-w-xs bg-green text-black hover:text-green">
										Create a General Proposal
									</NewProposalBtn>
								)}
							</div>
						)}
					</div>
					<div className="col-span-12 md:col-span-5 lg:col-span-4 space-y-4 border border-fgd-1">
						<TokenBalanceCardWrapper />
						<NFTSCompactWrapper></NFTSCompactWrapper>
						<AccountsCompactWrapper />
						{!realm?.account.config.useCommunityVoterWeightAddin && <MembersCompactWrapper></MembersCompactWrapper>}
						{/* <AssetsCompactWrapper></AssetsCompactWrapper> */}
					</div>
				</div>
			</div>
		</>
	)
}

export default REALM
