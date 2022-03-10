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
	const governance = governances[proposal.governance.toBase58()].account
	return proposal.hasVoteTimeEnded(governance) ? 0 : 1
}

const REALM = () => {
	const [initalLoad, setInitalLoad] = useState<boolean>(true)
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
	const [canCreate, setCanCreate] = useState(canCreateProposal);

	useEffect(() => {
		setCanCreate(canCreateProposal);
	}, [canCreateProposal]);

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

	const [tokrProposals, setTokrProposals] = useState<[any]>([])

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
	}, [filteredProposals, realmName]);


	const [proposalType1, setProposalType1] = useState<any>([])
	const [proposalType2, setProposalType2] = useState<any>([])
	// const [proposalType3, setProposalType3] = useState<any>([])
	// const [proposalType4, setProposalType4] = useState<any>([])

	useLayoutEffect(() => {
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
				<RealmHeader
					getRealmDisplayName={(name) => setRealmName(name)}
				/>
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
						<div className="flex items-center justify-between pb-3 hidden">
							<h4 className="text-fgd-2">{`${tokrProposals.length} proposals`}</h4>
							<div className="flex items-center">
								<div className="mr-4">
									<NewProposalBtn>Request rNFT</NewProposalBtn>
								</div>
								<div className="mr-4">
									<NewProposalBtn type={`tokrize`}>Tokrize</NewProposalBtn>
								</div>
								{/* <ProposalFilter filters={filters} setFilters={setFilters} /> */}
							</div>
						</div>

						{ canCreate && <NewProposalBtn string={`property=true`} hideIcon linkClasses="text-center text-lg flex flex-grow items-center justify-center border border-green">{tokrProposals.length > 0 ? 'Propose Another Property' : 'Propose Your First Property'}</NewProposalBtn> }

						{tokrProposals.length > 0 ? (
							<>
								<div className={`space-y-16${ canCreate ? ' mt-16': ''}`}>
									{proposalType1.length > 0 && (
										<div>
											<h2 className="text-2xl uppercase">{`Purchase Real Estate Proposal${proposalType1.length > 0 ? 's' : ''}`}</h2>
											{proposalType1.map(([k, v]) => {
												return <ProposalCard cta={ <NewProposalBtn string={ `uri=${v.account?.meta?.uri?.split('.net/')[1]}` } hideIcon children="Request rNFT" /> } key={k} proposalPk={new PublicKey(k)} proposal={v.account} />
											})}
										</div>
									)}
									{proposalType2.length > 0 && (
										<div>
											<h2 className="text-2xl uppercase">{`Request Tokr DAO to mint rNFT Proposal${proposalType2.length > 0 ? 's' : ''}`}</h2>
											{proposalType2.map(([k, v]) => {
												return <ProposalCard key={k} proposalPk={new PublicKey(k)} proposal={v.account} />
											})}
										</div>
									)}
								</div>
							</>
						) : <>
							{realmDisplayName} has no proposals{ canCreate ? <>{` `}get started by <NewProposalBtn string={`property=true`} basic className={`underline`}>submitting your first property</NewProposalBtn>! </> : <>.</>}
						</>}
					</div>
					<div className="col-span-12 md:col-span-5 lg:col-span-4 space-y-4 border border-fgd-1">
						<TokenBalanceCardWrapper />
						<NFTSCompactWrapper></NFTSCompactWrapper>
						<AccountsCompactWrapper />
						{!realm?.account.config.useCommunityVoterWeightAddin && <MembersCompactWrapper></MembersCompactWrapper>}
						<AssetsCompactWrapper></AssetsCompactWrapper>
					</div>
				</div>
			</div>
		</>
	)
}

export default REALM
