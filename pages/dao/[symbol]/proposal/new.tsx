import Link from 'next/link'
import { useRouter } from 'next/router'
import React, { createContext, useEffect, useState } from 'react'
import * as yup from 'yup'
import { ArrowLeftIcon, PlusCircleIcon, XCircleIcon } from '@heroicons/react/outline'
import { getInstructionDataFromBase64, Governance, GovernanceAccountType, ProgramAccount, RpcContext } from '@solana/spl-governance'
import { PublicKey } from '@solana/web3.js'
import Button, { LinkButton, SecondaryButton } from '@components/Button'
import Input from '@components/inputs/Input'
import Select from '@components/inputs/Select'
import Textarea from '@components/inputs/Textarea'
import TokenBalanceCardWrapper from '@components/TokenBalance/TokenBalanceCardWrapper'
import useGovernanceAssets from '@hooks/useGovernanceAssets'
import useQueryContext from '@hooks/useQueryContext'
import useRealm from '@hooks/useRealm'
import { getProgramVersionForRealm } from '@models/registry/api'

import { getTimestampFromDays } from '@tools/sdk/units'
import { formValidation, isFormValid } from '@utils/formValidation'
import { ComponentInstructionData, Instructions, InstructionsContext, UiInstruction } from '@utils/uiTypes/proposalCreationTypes'

import { createProposal } from 'actions/createProposal'
import useWalletStore from 'stores/useWalletStore'
import { notify } from 'utils/notifications'
import Clawback from 'VoteStakeRegistry/components/instructions/Clawback'
import Grant from 'VoteStakeRegistry/components/instructions/Grant'
import useVoteStakeRegistryClientStore from 'VoteStakeRegistry/stores/voteStakeRegistryClientStore'

import InstructionContentContainer from './components/InstructionContentContainer'
import ProgramUpgrade from './components/instructions/bpfUpgradeableLoader/ProgramUpgrade'
import CreateAssociatedTokenAccount from './components/instructions/CreateAssociatedTokenAccount'
import CustomBase64 from './components/instructions/CustomBase64'
import Empty from './components/instructions/Empty'
import MakeChangeMaxAccounts from './components/instructions/Mango/MakeChangeMaxAccounts'
import MakeChangeReferralFeeParams from './components/instructions/Mango/MakeChangeReferralFeeParams'
import Mint from './components/instructions/Mint'
import CreateObligationAccount from './components/instructions/Solend/CreateObligationAccount'
import DepositReserveLiquidityAndObligationCollateral from './components/instructions/Solend/DepositReserveLiquidityAndObligationCollateral'
import InitObligationAccount from './components/instructions/Solend/InitObligationAccount'
import RefreshObligation from './components/instructions/Solend/RefreshObligation'
import RefreshReserve from './components/instructions/Solend/RefreshReserve'
import WithdrawObligationCollateralAndRedeemReserveLiquidity from './components/instructions/Solend/WithdrawObligationCollateralAndRedeemReserveLiquidity'
import SplTokenTransfer from './components/instructions/SplTokenTransfer'
import VoteBySwitch from './components/VoteBySwitch'
import TokrizeContract from './components/instructions/Tokrize'

const schema = yup.object().shape({
	title: yup.string().required('Title is required'),
})
const defaultGovernanceCtx: InstructionsContext = {
	instructionsData: [],
	handleSetInstructions: () => null,
	governance: null,
	setGovernance: () => null,
}
export const NewProposalContext = createContext<InstructionsContext>(defaultGovernanceCtx)

// Takes the first encountered governance account
function extractGovernanceAccountFromInstructionsData(instructionsData: ComponentInstructionData[]): ProgramAccount<Governance> | null {
	return instructionsData.find((itx) => itx.governedAccount)?.governedAccount ?? null
}

const New = () => {
	const router = useRouter()
	const client = useVoteStakeRegistryClientStore((s) => s.state.client)
	const { fmtUrlWithCluster } = useQueryContext()
	const { symbol, realm, realmInfo, realmDisplayName, ownVoterWeight, mint, councilMint, canChooseWhoVote } = useRealm()

	const { getAvailableInstructions } = useGovernanceAssets()
	const availableInstructions = getAvailableInstructions()
	const wallet = useWalletStore((s) => s.current)
	const connection = useWalletStore((s) => s.connection)
	const { fetchRealmGovernance, fetchTokenAccountsForSelectedRealmGovernances } = useWalletStore((s) => s.actions)
	const [voteByCouncil, setVoteByCouncil] = useState(false)
	const [form, setForm] = useState({
		title: '',
		description: '',
	})
	const [formErrors, setFormErrors] = useState({})
	const [governance, setGovernance] = useState<ProgramAccount<Governance> | null>(null)
	const [isLoadingSignedProposal, setIsLoadingSignedProposal] = useState(false)
	const [isLoadingDraft, setIsLoadingDraft] = useState(false)
	const isLoading = isLoadingSignedProposal || isLoadingDraft

	const [propertyData, setPropertyData] = useState({
		name: '',
		description: '',
		property_address: '',
		lat_long: '',
		acres: '',
		land_record_auditor: '',
		deed_record_recorder: '',
		mortgage_record_recorder: '',
		legal_description: '',
		mortgage_record: '',
		title_method: '',
		title_held_by: '',
		ein: '',
		transfer_restrictions: '',
		marketing_name: '',
		type: '',
		sq_ft: '',
		property_description: '',
		deed: '',
		mortgage: '',
		title_insurance: '',
		articles_of_organization: '',
		certificate_of_organization_from_secretary_of_state: '',
		operating_agreement: '',
		membership_interest_transfer_agreement: '',
		ein_letter_from_irs: '',
		appraisal: '',
		submitted_by: '',
	})

	const [descriptionLink, setDescriptionLink] = useState()

	const customInstructionFilterForSelectedGovernance = (instructionType: Instructions) => {
		if (!governance) {
			return true
		} else {
			const governanceType = governance.account.accountType
			const instructionsAvailiableAfterProgramGovernance = [Instructions.Base64]
			switch (governanceType) {
				case GovernanceAccountType.ProgramGovernanceV1:
				case GovernanceAccountType.ProgramGovernanceV2:
					return instructionsAvailiableAfterProgramGovernance.includes(instructionType)
				default:
					return true
			}
		}
	}

	const getAvailableInstructionsForIndex = (index) => {
		if (index === 0) {
			return availableInstructions
		} else {
			return availableInstructions.filter((x) => customInstructionFilterForSelectedGovernance(x.id))
		}
	}
	const [instructionsData, setInstructions] = useState<ComponentInstructionData[]>([{ type: availableInstructions[0] }])
	const handleSetInstructions = (val: any, index) => {
		const newInstructions = [...instructionsData]
		newInstructions[index] = { ...instructionsData[index], ...val }
		setInstructions(newInstructions)
	}
	const handleSetForm = ({ propertyName, value }) => {
		setFormErrors({})
		setForm({ ...form, [propertyName]: value })
	}
	const setInstructionType = ({ value, idx }) => {
		const newInstruction = {
			type: value,
		}
		handleSetInstructions(newInstruction, idx)
	}
	const addInstruction = () => {
		setInstructions([...instructionsData, { type: undefined }])
	}
	const removeInstruction = (idx) => {
		setInstructions([...instructionsData.filter((x, index) => index !== idx)])
	}
	const handleGetInstructions = async () => {
		const instructions: UiInstruction[] = []
		for (const inst of instructionsData) {
			if (inst.getInstruction) {
				const instruction: UiInstruction = await inst?.getInstruction()
				instructions.push(instruction)
			}
		}
		return instructions
	}
	const handleTurnOffLoaders = () => {
		setIsLoadingSignedProposal(false)
		setIsLoadingDraft(false)
	}
	const handleCreate = async (isDraft) => {
		setFormErrors({})
		if (isDraft) {
			setIsLoadingDraft(true)
		} else {
			setIsLoadingSignedProposal(true)
		}

		const { isValid, validationErrors }: formValidation = await isFormValid(schema, form)

		const instructions: UiInstruction[] = await handleGetInstructions()
		let proposalAddress: PublicKey | null = null
		if (!realm) {
			handleTurnOffLoaders()
			throw 'No realm selected'
		}

		if (isValid && instructions.every((x: UiInstruction) => x.isValid)) {
			let selectedGovernance = governance
			if (!governance) {
				handleTurnOffLoaders()
				throw Error('No governance selected')
			}

			const rpcContext = new RpcContext(new PublicKey(realm.owner.toString()), getProgramVersionForRealm(realmInfo!), wallet!, connection.current, connection.endpoint)
			const instructionsData = instructions.map((x) => {
				return {
					data: x.serializedInstruction ? getInstructionDataFromBase64(x.serializedInstruction) : null,
					holdUpTime: x.customHoldUpTime ? getTimestampFromDays(x.customHoldUpTime) : selectedGovernance?.account?.config.minInstructionHoldUpTime,
					prerequisiteInstructions: x.prerequisiteInstructions || [],
					chunkSplitByDefault: x.chunkSplitByDefault || false,
				}
			})

			try {
				// Fetch governance to get up to date proposalCount
				selectedGovernance = (await fetchRealmGovernance(governance.pubkey)) as ProgramAccount<Governance>

				const ownTokenRecord = ownVoterWeight.getTokenRecordToCreateProposal(governance.account.config)
				const defaultProposalMint = !mint?.supply.isZero() ? realm.account.communityMint : !councilMint?.supply.isZero() ? realm.account.config.councilMint : undefined

				const proposalMint = canChooseWhoVote && voteByCouncil ? realm.account.config.councilMint : defaultProposalMint

				if (!proposalMint) {
					throw new Error('There is no suitable governing token for the proposal')
				}

				proposalAddress = await createProposal(rpcContext, realm, selectedGovernance.pubkey, ownTokenRecord.pubkey, form.title, form.description, proposalMint, selectedGovernance?.account?.proposalCount, instructionsData, isDraft, client)

				const url = fmtUrlWithCluster(`/dao/${symbol}/proposal/${proposalAddress}`)

				router.push(url)
			} catch (ex) {
				notify({ type: 'error', message: `${ex}` })
			}
		} else {
			setFormErrors(validationErrors)
		}
		handleTurnOffLoaders()
	}
	useEffect(() => {
		setInstructions([instructionsData[0]])
	}, [instructionsData[0].governedAccount?.pubkey])

	useEffect(() => {
		const governedAccount = extractGovernanceAccountFromInstructionsData(instructionsData)

		setGovernance(governedAccount)
	}, [instructionsData])

	useEffect(() => {
		//fetch to be up to date with amounts
		fetchTokenAccountsForSelectedRealmGovernances()
	}, [])

	const getCurrentInstruction = ({ typeId, idx }) => {
		switch (typeId) {
			case Instructions.Transfer:
				return <SplTokenTransfer index={idx} governance={governance}></SplTokenTransfer>
			case Instructions.ProgramUpgrade:
				return <ProgramUpgrade index={idx} governance={governance}></ProgramUpgrade>
			case Instructions.CreateAssociatedTokenAccount:
				return <CreateAssociatedTokenAccount index={idx} governance={governance} />
			case Instructions.CreateSolendObligationAccount:
				return <CreateObligationAccount index={idx} governance={governance} />
			case Instructions.InitSolendObligationAccount:
				return <InitObligationAccount index={idx} governance={governance} />
			case Instructions.DepositReserveLiquidityAndObligationCollateral:
				return <DepositReserveLiquidityAndObligationCollateral index={idx} governance={governance} />
			case Instructions.RefreshSolendObligation:
				return <RefreshObligation index={idx} governance={governance} />
			case Instructions.RefreshSolendReserve:
				return <RefreshReserve index={idx} governance={governance} />
			case Instructions.WithdrawObligationCollateralAndRedeemReserveLiquidity:
				return <WithdrawObligationCollateralAndRedeemReserveLiquidity index={idx} governance={governance} />
			case Instructions.Mint:
				return <Mint index={idx} governance={governance}></Mint>
			case Instructions.Base64:
				return <CustomBase64 index={idx} governance={governance}></CustomBase64>
			case Instructions.TokrizeContract:
				return <TokrizeContract index={idx} governance={governance}></TokrizeContract>
			case Instructions.None:
				return <Empty index={idx} governance={governance}></Empty>
			case Instructions.MangoMakeChangeMaxAccounts:
				return <MakeChangeMaxAccounts index={idx} governance={governance}></MakeChangeMaxAccounts>
			case Instructions.MangoChangeReferralFeeParams:
				return <MakeChangeReferralFeeParams index={idx} governance={governance}></MakeChangeReferralFeeParams>
			case Instructions.Grant:
				return <Grant index={idx} governance={governance}></Grant>
			case Instructions.Clawback:
				return <Clawback index={idx} governance={governance}></Clawback>
			default:
				null
		}
	}

	const handleSetPropertyData = ({ propertyName, value }) => {
		// setFormErrors({})
		setPropertyData({ ...propertyData, [propertyName]: value })
	}

	useEffect(() => {
		//TODO: remove this when complete
		console.log('descriptionLink', descriptionLink)
		console.log('form', form)

		handleSetForm({
			value: JSON.stringify(descriptionLink),
			propertyName: 'description',
		})
	}, [descriptionLink])

	useEffect(() => {
		//TODO: remove this when complete
		console.log('propertyData', propertyData)

		setDescriptionLink({
			...propertyData,
		})
	}, [propertyData])

	return (
		<div>
			<Link href={fmtUrlWithCluster(`/dao/${symbol}/`)}>
				<a className="flex items-center text-fgd-3 text-sm transition-all hover:text-fgd-1">&lt; Back</a>
			</Link>
			<div className="mt-8 ml-4 -mb-5 relative z-10 m-width-full">
				{/* <a href={realmUrl} target="_blank" rel="noopener noreferrer" className="bg-dark inline-block">
					<span className="flex items-center cursor-pointer">
						<span className="flex flex-col md:flex-row items-center pb-3 md:pb-0">
							<span className="ml-4 pr-8 text-3xl uppercase">{realmDisplayName}</span>
						</span>
					</span>
				</a> */}

				<h1 className="bg-dark inline-block">
					<span className="ml-4 pr-8 text-xl uppercase">
						Add a proposal
						{realmDisplayName ? ` to ${realmDisplayName}` : ``}{' '}
					</span>
				</h1>
			</div>
			<div className="grid grid-cols-12 gap-4">
				<div className={`border border-fgd-1 bg-bkg-2 col-span-12 md:col-span-7 md:order-first lg:col-span-8 order-last p-4 md:p-6 space-y-3 ${isLoading ? 'pointer-events-none' : ''}`}>
					<>
						<div className="mt-20 mb-20">
							<div className="space-y-8">
								<div className="space-y-4">
									<h3>
										<span className="text-2l uppercase">Property Information</span>
									</h3>

									<div className="xpb-4">
										<Input
											label="Name"
											placeholder="Name"
											value={propertyData.name}
											id="name"
											name="name"
											type="text"
											// error={propertyDataErrors['name']}
											onChange={(evt) =>
												handleSetPropertyData({
													value: evt.target.value,
													propertyName: 'name',
												})
											}
										/>
									</div>

									<div className="xpb-4">
										<Input
											label="Description"
											placeholder="Description"
											value={propertyData.description}
											id="description"
											name="description"
											type="text"
											// error={propertyDataErrors['description']}
											onChange={(evt) =>
												handleSetPropertyData({
													value: evt.target.value,
													propertyName: 'description',
												})
											}
										/>
									</div>
								</div>

								<div className="space-y-4">
									<h3>
										<span className="text-2l uppercase">Parcel Attributes</span>
									</h3>

									<div className="xpb-4">
										<Input
											label="Property Address"
											placeholder="Property Address"
											value={propertyData.propertyAddress}
											id="propertyAddress"
											name="propertyAddress"
											type="text"
											// error={propertyDataErrors['propertyAddress']}
											onChange={(evt) =>
												handleSetPropertyData({
													value: evt.target.value,
													propertyName: 'propertyAddress',
												})
											}
										/>
									</div>

									<div className="xpb-4">
										<Input
											label="Lat Long"
											placeholder="Lat Long"
											value={propertyData.latLong}
											id="latLong"
											name="latLong"
											type="text"
											// error={propertyDataErrors['latLong']}
											onChange={(evt) =>
												handleSetPropertyData({
													value: evt.target.value,
													propertyName: 'latLong',
												})
											}
										/>
									</div>

									<div className="xpb-4">
										<Input
											label="Acres"
											placeholder="Acres"
											value={propertyData.acres}
											id="acres"
											name="acres"
											type="text"
											// error={propertyDataErrors['acres']}
											onChange={(evt) =>
												handleSetPropertyData({
													value: evt.target.value,
													propertyName: 'acres',
												})
											}
										/>
									</div>
								</div>

								<div className="space-y-4">
									<h3>
										<span className="text-2l uppercase">Public Registries of Parcel Record </span>
									</h3>

									<div className="xpb-4">
										<Input
											label="Land Record Auditor"
											placeholder="Land Record Auditor"
											value={propertyData.landRecordAuditor}
											id="landRecordAuditor"
											name="landRecordAuditor"
											type="text"
											// error={propertyDataErrors['landRecordAuditor']}
											onChange={(evt) =>
												handleSetPropertyData({
													value: evt.target.value,
													propertyName: 'landRecordAuditor',
												})
											}
										/>
									</div>

									<div className="xpb-4">
										<Input
											label="Deed Record Recorder"
											placeholder="Deed Record Recorder"
											value={propertyData.deedRecordRecorder}
											id="deedRecordRecorder"
											name="deedRecordRecorder"
											type="text"
											// error={propertyDataErrors['deedRecordRecorder']}
											onChange={(evt) =>
												handleSetPropertyData({
													value: evt.target.value,
													propertyName: 'deedRecordRecorder',
												})
											}
										/>
									</div>

									<div className="xpb-4">
										<Input
											label="Mortgage Record Recorder"
											placeholder="Mortgage Record Recorder"
											value={propertyData.mortgageRecordRecorder}
											id="mortgageRecordRecorder"
											name="mortgageRecordRecorder"
											type="text"
											// error={propertyDataErrors['mortgageRecordRecorder']}
											onChange={(evt) =>
												handleSetPropertyData({
													value: evt.target.value,
													propertyName: 'mortgageRecordRecorder',
												})
											}
										/>
									</div>

									<div className="xpb-4">
										<Input
											label="Legal Description"
											placeholder="Legal Description"
											value={propertyData.legalDescription}
											id="legalDescription"
											name="legalDescription"
											type="text"
											// error={propertyDataErrors['legalDescription']}
											onChange={(evt) =>
												handleSetPropertyData({
													value: evt.target.value,
													propertyName: 'legalDescription',
												})
											}
										/>
									</div>

									<div className="xpb-4">
										<Input
											label="Mortgage Record"
											placeholder="Mortgage Record"
											value={propertyData.mortgageRecord}
											id="mortgageRecord"
											name="mortgageRecord"
											type="text"
											// error={propertyDataErrors['mortgageRecord']}
											onChange={(evt) =>
												handleSetPropertyData({
													value: evt.target.value,
													propertyName: 'mortgageRecord',
												})
											}
										/>
									</div>
								</div>

								<div className="space-y-4">
									<h3>
										<span className="text-2l uppercase">Title Attributes</span>
									</h3>
									<div className="xpb-4">
										<Input
											label="Title Method"
											placeholder="Title Method"
											value={propertyData.titleMethod}
											id="titleMethod"
											name="titleMethod"
											type="text"
											// error={propertyDataErrors['titleMethod']}
											onChange={(evt) =>
												handleSetPropertyData({
													value: evt.target.value,
													propertyName: 'titleMethod',
												})
											}
										/>
									</div>

									<div className="xpb-4">
										<Input
											label="Title Held By"
											placeholder="Title Held By"
											value={propertyData.titleHeldBy}
											id="titleHeldBy"
											name="titleHeldBy"
											type="text"
											// error={propertyDataErrors['titleHeldBy']}
											onChange={(evt) =>
												handleSetPropertyData({
													value: evt.target.value,
													propertyName: 'titleHeldBy',
												})
											}
										/>
									</div>

									<div className="xpb-4">
										<Input
											label="Ein"
											placeholder="Ein"
											value={propertyData.ein}
											id="ein"
											name="ein"
											type="text"
											// error={propertyDataErrors['ein']}
											onChange={(evt) =>
												handleSetPropertyData({
													value: evt.target.value,
													propertyName: 'ein',
												})
											}
										/>
									</div>

									<div className="xpb-4">
										<Input
											label="Transfer Restrictions"
											placeholder="Transfer Restrictions"
											value={propertyData.transferRestrictions}
											id="transferRestrictions"
											name="transferRestrictions"
											type="text"
											// error={propertyDataErrors['transferRestrictions']}
											onChange={(evt) =>
												handleSetPropertyData({
													value: evt.target.value,
													propertyName: 'transferRestrictions',
												})
											}
										/>
									</div>
								</div>

								<div className="space-y-4">
									<h3>
										<span className="text-2l uppercase">Property Record</span>
									</h3>
									<div className="xpb-4">
										<Input
											label="Marketing Name"
											placeholder="Marketing Name"
											value={propertyData.marketingName}
											id="marketingName"
											name="marketingName"
											type="text"
											// error={propertyDataErrors['marketingName']}
											onChange={(evt) =>
												handleSetPropertyData({
													value: evt.target.value,
													propertyName: 'marketingName',
												})
											}
										/>
									</div>

									<div className="xpb-4">
										<Input
											label="Type"
											placeholder="Type"
											value={propertyData.type}
											id="type"
											name="type"
											type="text"
											// error={propertyDataErrors['type']}
											onChange={(evt) =>
												handleSetPropertyData({
													value: evt.target.value,
													propertyName: 'type',
												})
											}
										/>
									</div>

									<div className="xpb-4">
										<Input
											label="Sq Ft"
											placeholder="Sq Ft"
											value={propertyData.sqFt}
											id="sqFt"
											name="sqFt"
											type="text"
											// error={propertyDataErrors['sqFt']}
											onChange={(evt) =>
												handleSetPropertyData({
													value: evt.target.value,
													propertyName: 'sqFt',
												})
											}
										/>
									</div>

									<div className="xpb-4">
										<Input
											label="Property Description"
											placeholder="Property Description"
											value={propertyData.propertyDescription}
											id="propertyDescription"
											name="propertyDescription"
											type="text"
											// error={propertyDataErrors['propertyDescription']}
											onChange={(evt) =>
												handleSetPropertyData({
													value: evt.target.value,
													propertyName: 'propertyDescription',
												})
											}
										/>
									</div>
								</div>

								<div className="space-y-4">
									<h3>
										<span className="text-2l uppercase">Material Agreements &amp; Documentation</span>
									</h3>

									<div className="xpb-4">
										<Input
											label="Deed"
											placeholder="Deed"
											value={propertyData.deed}
											id="deed"
											name="deed"
											type="text"
											// error={propertyDataErrors['deed']}
											onChange={(evt) =>
												handleSetPropertyData({
													value: evt.target.value,
													propertyName: 'deed',
												})
											}
										/>
									</div>

									<div className="xpb-4">
										<Input
											label="Mortgage"
											placeholder="Mortgage"
											value={propertyData.mortgage}
											id="mortgage"
											name="mortgage"
											type="text"
											// error={propertyDataErrors['mortgage']}
											onChange={(evt) =>
												handleSetPropertyData({
													value: evt.target.value,
													propertyName: 'mortgage',
												})
											}
										/>
									</div>

									<div className="xpb-4">
										<Input
											label="Title Insurance"
											placeholder="Title Insurance"
											value={propertyData.titleInsurance}
											id="titleInsurance"
											name="titleInsurance"
											type="text"
											// error={propertyDataErrors['titleInsurance']}
											onChange={(evt) =>
												handleSetPropertyData({
													value: evt.target.value,
													propertyName: 'titleInsurance',
												})
											}
										/>
									</div>

									<div className="xpb-4">
										<Input
											label="Articles Of Organization"
											placeholder="Articles Of Organization"
											value={propertyData.articlesOfOrganization}
											id="articlesOfOrganization"
											name="articlesOfOrganization"
											type="text"
											// error={propertyDataErrors['articlesOfOrganization']}
											onChange={(evt) =>
												handleSetPropertyData({
													value: evt.target.value,
													propertyName: 'articlesOfOrganization',
												})
											}
										/>
									</div>

									<div className="xpb-4">
										<Input
											label="Certificate Of Organization From Secretary Of State"
											placeholder="Certificate Of Organization From Secretary Of State"
											value={propertyData.certificateOfOrganizationFromSecretaryOfState}
											id="certificateOfOrganizationFromSecretaryOfState"
											name="certificateOfOrganizationFromSecretaryOfState"
											type="text"
											// error={propertyDataErrors['certificateOfOrganizationFromSecretaryOfState']}
											onChange={(evt) =>
												handleSetPropertyData({
													value: evt.target.value,
													propertyName: 'certificateOfOrganizationFromSecretaryOfState',
												})
											}
										/>
									</div>

									<div className="xpb-4">
										<Input
											label="Operating Agreement"
											placeholder="Operating Agreement"
											value={propertyData.operatingAgreement}
											id="operatingAgreement"
											name="operatingAgreement"
											type="text"
											// error={propertyDataErrors['operatingAgreement']}
											onChange={(evt) =>
												handleSetPropertyData({
													value: evt.target.value,
													propertyName: 'operatingAgreement',
												})
											}
										/>
									</div>

									<div className="xpb-4">
										<Input
											label="Membership Interest Transfer Agreement"
											placeholder="Membership Interest Transfer Agreement"
											value={propertyData.membershipInterestTransferAgreement}
											id="membershipInterestTransferAgreement"
											name="membershipInterestTransferAgreement"
											type="text"
											// error={propertyDataErrors['membershipInterestTransferAgreement']}
											onChange={(evt) =>
												handleSetPropertyData({
													value: evt.target.value,
													propertyName: 'membershipInterestTransferAgreement',
												})
											}
										/>
									</div>

									<div className="xpb-4">
										<Input
											label="Ein Letter From Irs"
											placeholder="Ein Letter From Irs"
											value={propertyData.einLetterFromIrs}
											id="einLetterFromIrs"
											name="einLetterFromIrs"
											type="text"
											// error={propertyDataErrors['einLetterFromIrs']}
											onChange={(evt) =>
												handleSetPropertyData({
													value: evt.target.value,
													propertyName: 'einLetterFromIrs',
												})
											}
										/>
									</div>

									<div className="xpb-4">
										<Input
											label="Appraisal"
											placeholder="Appraisal"
											value={propertyData.appraisal}
											id="appraisal"
											name="appraisal"
											type="text"
											// error={propertyDataErrors['appraisal']}
											onChange={(evt) =>
												handleSetPropertyData({
													value: evt.target.value,
													propertyName: 'appraisal',
												})
											}
										/>
									</div>
								</div>

								<div className="space-y-4">
									<h3>
										<span className="text-2l uppercase">Submitted By</span>
									</h3>
									<div className="xpb-4">
										<Input
											label="Your Full Legal Name"
											placeholder="Your Full Legal Name"
											value={propertyData.submittedBy}
											id="submittedBy"
											name="submittedBy"
											type="text"
											// error={propertyDataErrors['submittedBy']}
											onChange={(evt) =>
												handleSetPropertyData({
													value: evt.target.value,
													propertyName: 'submittedBy',
												})
											}
										/>
									</div>
								</div>

							</div>
						</div>

						<div className="pt-2">
							<div className="pb-4">
								<Input
									label="Title"
									placeholder="Title of your proposal"
									value={form.title}
									type="text"
									error={formErrors['title']}
									onChange={(evt) =>
										handleSetForm({
											value: evt.target.value,
											propertyName: 'title',
										})
									}
								/>
							</div>
							{/* <Textarea
								className="mb-3"
								label="Description"
								placeholder="Description of your proposal or use a github gist link (optional)"
								value={JSON.stringify(descriptionLink)}
								// value={form.description}
								onChange={(evt) =>
									handleSetForm({
										value: evt.target.value,
										propertyName: 'description',
									})
								}
							></Textarea> */}
							{canChooseWhoVote && (
								<VoteBySwitch
									checked={voteByCouncil}
									onChange={() => {
										setVoteByCouncil(!voteByCouncil)
									}}
								></VoteBySwitch>
							)}
							<NewProposalContext.Provider
								value={{
									instructionsData,
									handleSetInstructions,
									governance,
									setGovernance,
								}}
							>
								<h2>Instructions</h2>
								{instructionsData.map((instruction, idx) => {
									const availableInstructionsForIdx = getAvailableInstructionsForIndex(idx)
									return (
										<div key={idx} className="mb-3 border border-fgd-4 p-4 md:p-6">
											<Select className="h-12" disabled={!getAvailableInstructionsForIndex.length} placeholder={`${availableInstructionsForIdx.length ? 'Select instruction' : 'No available instructions'}`} label={`Instruction ${idx + 1}`} onChange={(value) => setInstructionType({ value, idx })} value={instruction.type?.name}>
												{availableInstructionsForIdx.map((inst) => (
													<Select.Option key={inst.id} value={inst}>
														<span>{inst.name}</span>
													</Select.Option>
												))}
											</Select>
											<div className="flex items-end pt-4">
												<InstructionContentContainer idx={idx} instructionsData={instructionsData}>
													{getCurrentInstruction({
														typeId: instruction.type?.id,
														idx,
													})}
												</InstructionContentContainer>
												{idx !== 0 && (
													<LinkButton className="flex font-bold items-center ml-4 text-fgd-1 text-sm" onClick={() => removeInstruction(idx)}>
														<XCircleIcon className="h-5 mr-1.5 text-red w-5" />
														Remove
													</LinkButton>
												)}
											</div>
										</div>
									)
								})}
							</NewProposalContext.Provider>
							<div className="flex justify-end mt-4 mb-8 px-6">
								<LinkButton className="flex font-bold items-center text-fgd-1 text-sm" onClick={addInstruction}>
									<PlusCircleIcon className="h-5 mr-1.5 text-green w-5" />
									Add instruction
								</LinkButton>
							</div>
							<div className="border-t border-fgd-4 flex justify-end mt-6 pt-6 space-x-4">
								<SecondaryButton disabled={isLoading} isLoading={isLoadingDraft} onClick={() => handleCreate(true)}>
									Save draft
								</SecondaryButton>
								<Button isLoading={isLoadingSignedProposal} disabled={isLoading} onClick={() => handleCreate(false)}>
									Add proposal
								</Button>
							</div>
						</div>
					</>
				</div>
				<div className="col-span-12 md:col-span-5 lg:col-span-4">
					<TokenBalanceCardWrapper />
				</div>
			</div>
		</div>
	)
}

export default New
