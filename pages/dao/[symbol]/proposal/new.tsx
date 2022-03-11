import Link from 'next/link'
import { useRouter } from 'next/router'
import React, { createContext, useEffect, useLayoutEffect, useState } from 'react'
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
import { sendTransaction } from '@utils/send'
import { ARWEAVE_PAYMENT_WALLET } from '../../../../scripts/arweave/lib/constants'
import * as anchor from '@project-serum/anchor'
import { uploadToArweave, fetchAssetCostToStore, estimateManifestSize } from '../../../../scripts/arweave/lib/arweave'
import FormData from 'form-data'
import { Transaction } from '@solana/web3.js'
import Loader from '@components/Loader'

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

const New = (props) => {
	const _prepopulateForDemos = false
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
	const [propertyName, setPropertyName] = useState('')
	const [proposalType, setProposalType] = useState<any>(2)
	const [liteMode, setLiteMode] = useState<boolean>(false)
	const [form, setForm] = useState({
		title: propertyName,
		description: '',
	})
	const [proposalUri, setProposalUri] = useState<string>()
	const [formErrors, setFormErrors] = useState({})
	const [governance, setGovernance] = useState<ProgramAccount<Governance> | null>(null)
	const [isLoadingSignedProposal, setIsLoadingSignedProposal] = useState(false)
	const [isLoadingDraft, setIsLoadingDraft] = useState(false)
	const isLoading = isLoadingSignedProposal || isLoadingDraft
	const [arWeaveLink, setArWeaveLink] = useState<string>('')
	const [submitting, setSubmitting] = useState<boolean>(false)
	const [submittingStep, setSubmittingStep] = useState<any>([])

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
		image: '',
		uri: arWeaveLink || '',
	})

	const [descriptionLink, setDescriptionLink] = useState({})
	const [metaplexDataObj, setMetaplexDataObj] = useState({
		name: '',
		symbol: '',
		description: '',
		image: '',
		attributes: [
			{
				trait_type: 'name',
				value: '',
			},
			{
				trait_type: 'description',
				value: '',
			},
			{
				trait_type: 'property_address',
				value: '',
			},
			{
				trait_type: 'lat_long',
				value: '',
			},
			{
				trait_type: 'acres',
				value: '',
			},
			{
				trait_type: 'land_record_auditor',
				value: '',
			},
			{
				trait_type: 'deed_record_recorder',
				value: '',
			},
			{
				trait_type: 'mortgage_record_recorder',
				value: '',
			},
			{
				trait_type: 'legal_description',
				value: '',
			},
			{
				trait_type: 'mortgage_record',
				value: '',
			},
			{
				trait_type: 'title_method',
				value: '',
			},
			{
				trait_type: 'title_held_by',
				value: '',
			},
			{
				trait_type: 'ein',
				value: '',
			},
			{
				trait_type: 'transfer_restrictions',
				value: '',
			},
			{
				trait_type: 'marketing_name',
				value: '',
			},
			{
				trait_type: 'type',
				value: '',
			},
			{
				trait_type: 'sq_ft',
				value: '',
			},
			{
				trait_type: 'property_description',
				value: '',
			},
			{
				trait_type: 'deed',
				value: '',
			},
			{
				trait_type: 'mortgage',
				value: '',
			},
			{
				trait_type: 'title_insurance',
				value: '',
			},
			{
				trait_type: 'articles_of_organization',
				value: '',
			},
			{
				trait_type: 'certificate_of_organization_from_secretary_of_state',
				value: '',
			},
			{
				trait_type: 'operating_agreement',
				value: '',
			},
			{
				trait_type: 'membership_interest_transfer_agreement',
				value: '',
			},
			{
				trait_type: 'ein_letter_from_irs',
				value: '',
			},
			{
				trait_type: 'appraisal',
				value: '',
			},
			{
				trait_type: 'submitted_by',
				value: '',
			},
		],
	})

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

				setSubmittingStep([...submittingStep, `Proposal for ${propertyData.name} has been added to the Tokr Realm`])
				setSubmittingStep([...submittingStep, `Congrats! Your ${propertyData.name} Proposal has been successfully created!`])

				setProposalUri(url)
			} catch (ex) {
				setSubmittingStep([...submittingStep, 'Uh oh! Something went wrong...'])
				notify({ type: 'error', message: `${ex}` })
			}
		} else {
			setSubmittingStep([...submittingStep, 'Uh oh! Something went wrong...'])
			setFormErrors(validationErrors)
		}
		handleTurnOffLoaders()

		// setSubmitting(false)
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

	useLayoutEffect(() => {
		if (router.query?.type) {
			const numberType = parseInt(router.query?.type.toString());
			setProposalType(numberType)
		}

		if (router.query?.property) {
			setProposalType(1)
			setLiteMode(true)
		}

		if (router.query?.uri) {
			setProposalType(2)
			setLiteMode(false)

			fetch(`https://arweave.net/${router.query?.uri}`, {
				method: 'GET'
			})
			.then((res) => res.json())
			.then((res) => {

				const temp = res.attributes.map( (attribute) => {
					res[attribute.trait_type] = attribute.value;
				})

				setPropertyData({
					...res
				})


				return res
			})
			.catch((error) => {
				console.log('error', error)
			})
		}

	}, [router])


	const upload = async () => {
		setSubmittingStep([...submittingStep, `Accessing Arweave for file upload...`])

		const metadataFile = new File([JSON.stringify(metaplexDataObj)], 'metadata.json')
		const storageCost = await fetchAssetCostToStore([metadataFile.size])

		const transaction = new Transaction()
		const instructions = [
			anchor.web3.SystemProgram.transfer({
				fromPubkey: wallet!.publicKey!,
				toPubkey: ARWEAVE_PAYMENT_WALLET,
				lamports: storageCost,
			}),
		]
		transaction.add(...instructions)

		setSubmittingStep([...submittingStep, `Fund account for upload processs...`])

		const tx = await sendTransaction({
			connection: connection.current,
			wallet,
			transaction,
			sendingMessage: 'Funding arweave',
			successMessage: 'Success Funding arweave',
		})

		const data = new FormData()
		data.append('transaction', tx)
		data.append('file[]', metadataFile)

		setSubmittingStep([...submittingStep, `Uploading ${propertyData.name} data...`])
		const result = await uploadToArweave(data)
		const metadataResultFile = result.messages?.find((m) => m.filename === 'manifest.json')

		setSubmittingStep([...submittingStep, `Data uploaded.`])
		if (metadataResultFile?.transactionId) {
			const link = `https://arweave.net/${metadataResultFile.transactionId}`
			setArWeaveLink(link)

			return link
		} else {
			throw new Error(`No transaction ID for upload: ${tx}`)
		}
	}

	const handleSetPropertyData = ({ propertyName, value }) => {
		// setFormErrors({})
		setPropertyData({ ...propertyData, [propertyName]: value })
	}

	useEffect(() => {
		if (liteMode) {
			setMetaplexDataObj({
				name: propertyData.name,
				symbol: 'TOKR-g1',
				description: propertyData.description,
				image: propertyData.image,
				attributes: [
					{
						trait_type: 'name',
						value: propertyData.name,
					},
					{
						trait_type: 'description',
						value: propertyData.description,
					},
					{
						trait_type: 'property_address',
						value: propertyData.property_address,
					},
					{
						trait_type: 'lat_long',
						value: propertyData.lat_long,
					},
					{
						trait_type: 'acres',
						value: propertyData.acres,
					},
				],
			})
		} else {
			setMetaplexDataObj({
				name: propertyData.name,
				symbol: 'TOKR-g1',
				description: propertyData.description,
				image: propertyData.image,
				attributes: [
					{
						trait_type: 'name',
						value: propertyData.name,
					},
					{
						trait_type: 'description',
						value: propertyData.description,
					},
					{
						trait_type: 'property_address',
						value: propertyData.property_address,
					},
					{
						trait_type: 'lat_long',
						value: propertyData.lat_long,
					},
					{
						trait_type: 'acres',
						value: propertyData.acres,
					},
					{
						trait_type: 'land_record_auditor',
						value: propertyData.land_record_auditor,
					},
					{
						trait_type: 'deed_record_recorder',
						value: propertyData.deed_record_recorder,
					},
					{
						trait_type: 'mortgage_record_recorder',
						value: propertyData.mortgage_record_recorder,
					},
					{
						trait_type: 'legal_description',
						value: propertyData.legal_description,
					},
					{
						trait_type: 'mortgage_record',
						value: propertyData.mortgage_record,
					},
					{
						trait_type: 'title_method',
						value: propertyData.title_method,
					},
					{
						trait_type: 'title_held_by',
						value: propertyData.title_held_by,
					},
					{
						trait_type: 'ein',
						value: propertyData.ein,
					},
					{
						trait_type: 'transfer_restrictions',
						value: propertyData.transfer_restrictions,
					},
					{
						trait_type: 'marketing_name',
						value: propertyData.marketing_name,
					},
					{
						trait_type: 'type',
						value: propertyData.type,
					},
					{
						trait_type: 'sq_ft',
						value: propertyData.sq_ft,
					},
					{
						trait_type: 'property_description',
						value: propertyData.property_description,
					},
					{
						trait_type: 'deed',
						value: propertyData.deed,
					},
					{
						trait_type: 'mortgage',
						value: propertyData.mortgage,
					},
					{
						trait_type: 'title_insurance',
						value: propertyData.title_insurance,
					},
					{
						trait_type: 'articles_of_organization',
						value: propertyData.articles_of_organization,
					},
					{
						trait_type: 'certificate_of_organization_from_secretary_of_state',
						value: propertyData.certificate_of_organization_from_secretary_of_state,
					},
					{
						trait_type: 'operating_agreement',
						value: propertyData.operating_agreement,
					},
					{
						trait_type: 'membership_interest_transfer_agreement',
						value: propertyData.membership_interest_transfer_agreement,
					},
					{
						trait_type: 'ein_letter_from_irs',
						value: propertyData.ein_letter_from_irs,
					},
					{
						trait_type: 'appraisal',
						value: propertyData.appraisal,
					},
					{
						trait_type: 'submitted_by',
						value: propertyData.submitted_by,
					},
				],
			})
		}
	}, [propertyData])

	useLayoutEffect(() => {
		if (_prepopulateForDemos) {
			setMetaplexDataObj({
				name: 'White House',
				symbol: 'tokr_',
				description: 'The White House is the official residence and workplace of the president of the United States.',
				image: 'https://ipfs.io/ipfs/QmPZR8h2CUY8CZW77oLDQ51ctPqZEbZXKVaC5xYQgPPbzX?filename=white-house_photo.png',
				attributes: [
					{
						trait_type: 'name',
						value: 'White House',
					},
					{
						trait_type: 'description',
						value: 'The White House is the official residence and workplace of the president of the United States.',
					},
					{
						trait_type: 'property_address',
						value: '1600 Pennsylvania Avenue NW, Washington, DC 20500',
					},
					{
						trait_type: 'lat_long',
						value: '38.898819, -77.036690',
					},
					{
						trait_type: 'acres',
						value: '18',
					},
					{
						trait_type: 'land_record_auditor',
						value: 'lorem ipsum',
					},
					{
						trait_type: 'deed_record_recorder',
						value: 'lorem ipsum',
					},
					{
						trait_type: 'mortgage_record_recorder',
						value: 'lorem ipsum',
					},
					{
						trait_type: 'legal_description',
						value: 'Legal description of the White House pulled from official record',
					},
					{
						trait_type: 'mortgage_record',
						value: 'lorem ipsum',
					},
					{
						trait_type: 'title_method',
						value: 'Sole ownership',
					},
					{
						trait_type: 'title_held_by',
						value: 'The People',
					},
					{
						trait_type: 'ein',
						value: '123445555',
					},
					{
						trait_type: 'transfer_restrictions',
						value: 'None',
					},
					{
						trait_type: 'marketing_name',
						value: 'White House',
					},
					{
						trait_type: 'type',
						value: 'Building',
					},
					{
						trait_type: 'sq_ft',
						value: '54,900',
					},
					{
						trait_type: 'property_description',
						value: 'The White House is the official residence and workplace of the president of the United States.',
					},
					{
						trait_type: 'deed',
						value: 'https://ipfs.io/ipfs/QmaHoFcUyHdd1ZE55gtqeJAKqif7k53sLusyaaPzXA6n8N?filename=tokr_screenshot_1.png',
					},
					{
						trait_type: 'mortgage',
						value: 'https://ipfs.io/ipfs/QmaHoFcUyHdd1ZE55gtqeJAKqif7k53sLusyaaPzXA6n8N?filename=tokr_screenshot_1.png',
					},
					{
						trait_type: 'title_insurance',
						value: 'https://ipfs.io/ipfs/QmaHoFcUyHdd1ZE55gtqeJAKqif7k53sLusyaaPzXA6n8N?filename=tokr_screenshot_1.png',
					},
					{
						trait_type: 'articles_of_organization',
						value: 'https://ipfs.io/ipfs/QmaHoFcUyHdd1ZE55gtqeJAKqif7k53sLusyaaPzXA6n8N?filename=tokr_screenshot_1.png',
					},
					{
						trait_type: 'certificate_of_organization_from_secretary_of_state',
						value: 'https://ipfs.io/ipfs/QmaHoFcUyHdd1ZE55gtqeJAKqif7k53sLusyaaPzXA6n8N?filename=tokr_screenshot_1.png',
					},
					{
						trait_type: 'operating_agreement',
						value: 'https://ipfs.io/ipfs/QmaHoFcUyHdd1ZE55gtqeJAKqif7k53sLusyaaPzXA6n8N?filename=tokr_screenshot_1.png',
					},
					{
						trait_type: 'membership_interest_transfer_agreement',
						value: 'https://ipfs.io/ipfs/QmaHoFcUyHdd1ZE55gtqeJAKqif7k53sLusyaaPzXA6n8N?filename=tokr_screenshot_1.png',
					},
					{
						trait_type: 'ein_letter_from_irs',
						value: 'https://ipfs.io/ipfs/QmaHoFcUyHdd1ZE55gtqeJAKqif7k53sLusyaaPzXA6n8N?filename=tokr_screenshot_1.png',
					},
					{
						trait_type: 'appraisal',
						value: 'https://ipfs.io/ipfs/QmaHoFcUyHdd1ZE55gtqeJAKqif7k53sLusyaaPzXA6n8N?filename=tokr_screenshot_1.png',
					},
					{
						trait_type: 'submitted_by',
						value: 'John Adams',
					},
				],
			})

			setPropertyData({
				name: 'White House',
				description: 'The White House is the official residence and workplace of the president of the United States.',
				property_address: '1600 Pennsylvania Avenue NW, Washington, DC 20500',
				lat_long: '38.898819, -77.036690',
				acres: '18',
				land_record_auditor: 'lorem ipsum',
				deed_record_recorder: 'lorem ipsum',
				mortgage_record_recorder: 'lorem ipsum',
				legal_description: 'Legal description of the White House pulled from official record',
				mortgage_record: 'lorem ipsum',
				title_method: 'Sole ownership',
				title_held_by: 'The People',
				ein: '123445555',
				transfer_restrictions: 'None',
				marketing_name: 'White House',
				type: 'Building',
				sq_ft: '59,900',
				property_description: 'The White House is the official residence and workplace of the president of the United States. It is located at 1600 Pennsylvania Avenue NW in Washington, D.C., and has been the residence of every U.S. president since John Adams in 1800. The term "White House" is often used as a metonym for the president and his advisers.',
				deed: 'https://ipfs.io/ipfs/QmaHoFcUyHdd1ZE55gtqeJAKqif7k53sLusyaaPzXA6n8N?filename=tokr_screenshot_1.png',
				mortgage: 'https://ipfs.io/ipfs/QmaHoFcUyHdd1ZE55gtqeJAKqif7k53sLusyaaPzXA6n8N?filename=tokr_screenshot_1.png',
				title_insurance: 'https://ipfs.io/ipfs/QmaHoFcUyHdd1ZE55gtqeJAKqif7k53sLusyaaPzXA6n8N?filename=tokr_screenshot_1.png',
				articles_of_organization: 'https://ipfs.io/ipfs/QmaHoFcUyHdd1ZE55gtqeJAKqif7k53sLusyaaPzXA6n8N?filename=tokr_screenshot_1.png',
				certificate_of_organization_from_secretary_of_state: 'https://ipfs.io/ipfs/QmaHoFcUyHdd1ZE55gtqeJAKqif7k53sLusyaaPzXA6n8N?filename=tokr_screenshot_1.png',
				operating_agreement: 'https://ipfs.io/ipfs/QmaHoFcUyHdd1ZE55gtqeJAKqif7k53sLusyaaPzXA6n8N?filename=tokr_screenshot_1.png',
				membership_interest_transfer_agreement: 'https://ipfs.io/ipfs/QmaHoFcUyHdd1ZE55gtqeJAKqif7k53sLusyaaPzXA6n8N?filename=tokr_screenshot_1.png',
				ein_letter_from_irs: 'https://ipfs.io/ipfs/QmaHoFcUyHdd1ZE55gtqeJAKqif7k53sLusyaaPzXA6n8N?filename=tokr_screenshot_1.png',
				appraisal: 'https://ipfs.io/ipfs/QmaHoFcUyHdd1ZE55gtqeJAKqif7k53sLusyaaPzXA6n8N?filename=tokr_screenshot_1.png',
				submitted_by: 'John Adams',
				image: 'https://ipfs.io/ipfs/QmPZR8h2CUY8CZW77oLDQ51ctPqZEbZXKVaC5xYQgPPbzX?filename=white-house_photo.png',
				uri: '',
			})
		}
	}, [_prepopulateForDemos])

	const setProposalForSubmit = async (link) => {
		const descriptionObj = {
			// TODO: maybe a type to render details?
			description: (proposalType === 0 ? (propertyName + " Proposal") : `Proposal to ${proposalType === 1 ? 'Purchase Real Estate and Begin Syndication' : 'Request Tokr DAO to mint rNFT'}`),
			type: proposalType,
			// description: `Proposal to Purchase ${propertyData.property_address ? `${propertyData.property_address}` : 'Real Estate'}`,
			uri: link,
		}

		setForm({
			title: (proposalType === 0 ? propertyName : `${propertyName} ${proposalType === 1 ? 'Purchase Request' : 'rNFT Request'}`),
			description: JSON.stringify(descriptionObj),
		})

		return descriptionObj
	}

	const prepareProposalSubmit = async () => {
		setSubmitting(true)
		setSubmittingStep([...submittingStep, 'Saving data...'])
		const uploadMetaData = await upload()
		setSubmittingStep([...submittingStep, 'Proposal being created on Solana...'])
		const proposalDataForSubmit = await setProposalForSubmit(uploadMetaData)
	}

	const submitProposal = async () => {
		const submit = await prepareProposalSubmit()
	}

	useEffect(() => {
		if (form.title && form.description) {
			handleCreate(false)
		}
	}, [form])

	const [initalLoad, setInitalLoad] = useState<boolean>(true)
	useEffect(() => {
		if (realmDisplayName) setInitalLoad(false)
	}, [realmDisplayName])

	return initalLoad ? (
		<Loader />
	) : (
		<>
			{submitting && (
				<>
					<div className="fixed inset-0 z-50 bg-dark min-h-screen flex items-center justify-center">
						<ul className="w-full text-center">
							<li>Submitting {propertyData.name} Proposal...</li>
							{submittingStep.map((step, index) => {
								return <li key={`submittingStep_${index}_${step.replaceAll(' ', '_')}`}>{step}</li>
							})}
							{proposalUri && (
								<li className="mt-16 mb-8">
									<a
										href={proposalUri}
										onClick={(e) => {
											router.push(proposalUri)
											e.preventDefault()
										}}
									>
										View your proposal
									</a>
								</li>
							)}
						</ul>
					</div>
				</>
			)}
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
						<span className="ml-4 pr-8 text-xl uppercase">{proposalType === 1 ? `Property Proposal ${realmDisplayName ? ` for ${realmDisplayName}` : ''}` : 'rNFT Propsal'}</span>
					</h1>
				</div>
				<div className="grid grid-cols-12 gap-4">
					<div className={`border border-fgd-1 bg-bkg-2 col-span-12 md:col-span-7 md:order-first lg:col-span-8 order-last p-4 md:p-6 space-y-3 ${isLoading ? 'pointer-events-none' : ''}`}>
						<p className="pt-8">Instruction/Intro here ~ Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam libero at sit vitae maxime quod nemo vero eum mollitia quae.</p>

						<>
							<div className="pt-8 mb-20">
								<div className="space-y-16">
									{proposalType === 0 ? (
										<>
											<div className="space-y-4">
												<h3>
													<span className="text-lg">Property Information</span>
												</h3>

												<div className="xpb-4">
													<Input
														label="Name"
														placeholder="Name"
														value={propertyData.name}
														id="name"
														name="name"
														type="text"
														error={formErrors['title']}
														// error={propertyDataErrors['name']}
														onChange={(evt) => {
															handleSetPropertyData({
																value: evt.target.value,
																propertyName: 'name',
															})

															setPropertyName(evt.target.value)
														}}
													/>
												</div>

												<div className="xpb-4">
													<Textarea
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
										</>
									) : (
										<>
											<div className="space-y-4">
												<h3>
													<span className="text-lg">Property Information</span>
												</h3>

												<div className="xpb-4">
													<Input
														label="Name"
														placeholder="Name"
														value={propertyData.name}
														id="name"
														name="name"
														type="text"
														error={formErrors['title']}
														// error={propertyDataErrors['name']}
														onChange={(evt) => {
															handleSetPropertyData({
																value: evt.target.value,
																propertyName: 'name',
															})

															setPropertyName(evt.target.value)
														}}
													/>
												</div>

												<div className="xpb-4">
													<Textarea
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

												<div className="xpb-4">
													<Input
														label="Image"
														placeholder="URL to image"
														value={propertyData.image}
														id="image"
														name="image"
														type="url"
														// error={propertyDataErrors['description']}
														onChange={(evt) =>
															handleSetPropertyData({
																value: evt.target.value,
																propertyName: 'image',
															})
														}
													/>
												</div>
											</div>

											<div className="space-y-4">
												<h3>
													<span className="text-lg">Parcel Attributes</span>
												</h3>

												<div className="xpb-4">
													<Input
														label="Property Address"
														placeholder="Property Address"
														value={propertyData.property_address}
														id="property_address"
														name="property_address"
														type="text"
														// error={propertyDataErrors['property_address']}
														onChange={(evt) =>
															handleSetPropertyData({
																value: evt.target.value,
																propertyName: 'property_address',
															})
														}
													/>
												</div>

												<div className="xpb-4">
													<Input
														label="Lat Long"
														placeholder="Lat, Long"
														value={propertyData.lat_long}
														id="lat_long"
														name="lat_long"
														type="text"
														// error={propertyDataErrors['lat_long']}
														onChange={(evt) =>
															handleSetPropertyData({
																value: evt.target.value,
																propertyName: 'lat_long',
															})
														}
													/>

													<div className="text-xs pt-2">
														Find Latitude and Longitude of your property:{' '}
														<a target="_target" href="https://www.latlong.net/convert-address-to-lat-long.html">
															click here
														</a>
													</div>
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

											{!liteMode && (
												<>
													<div className="space-y-4">
														<h3>
															<span className="text-lg">Public Registries of Parcel Record </span>
														</h3>

														<div className="xpb-4">
															<Input
																label="Land Record Auditor"
																placeholder="Land Record Auditor"
																value={propertyData.land_record_auditor}
																id="land_record_auditor"
																name="land_record_auditor"
																type="text"
																// error={propertyDataErrors['land_record_auditor']}
																onChange={(evt) =>
																	handleSetPropertyData({
																		value: evt.target.value,
																		propertyName: 'land_record_auditor',
																	})
																}
															/>
														</div>

														<div className="xpb-4">
															<Input
																label="Deed Record Recorder"
																placeholder="Deed Record Recorder"
																value={propertyData.deed_record_recorder}
																id="deed_record_recorder"
																name="deed_record_recorder"
																type="text"
																// error={propertyDataErrors['deed_record_recorder']}
																onChange={(evt) =>
																	handleSetPropertyData({
																		value: evt.target.value,
																		propertyName: 'deed_record_recorder',
																	})
																}
															/>
														</div>

														<div className="xpb-4">
															<Input
																label="Mortgage Record Recorder"
																placeholder="Mortgage Record Recorder"
																value={propertyData.mortgage_record_recorder}
																id="mortgage_record_recorder"
																name="mortgage_record_recorder"
																type="text"
																// error={propertyDataErrors['mortgage_record_recorder']}
																onChange={(evt) =>
																	handleSetPropertyData({
																		value: evt.target.value,
																		propertyName: 'mortgage_record_recorder',
																	})
																}
															/>
														</div>

														<div className="xpb-4">
															<Textarea
																label="Legal Description"
																placeholder="Legal Description"
																value={propertyData.legal_description}
																id="legal_description"
																name="legal_description"
																type="text"
																// error={propertyDataErrors['legal_description']}
																onChange={(evt) =>
																	handleSetPropertyData({
																		value: evt.target.value,
																		propertyName: 'legal_description',
																	})
																}
															/>
														</div>

														<div className="xpb-4">
															<Input
																label="Mortgage Record"
																placeholder="Mortgage Record"
																value={propertyData.mortgage_record}
																id="mortgage_record"
																name="mortgage_record"
																type="text"
																// error={propertyDataErrors['mortgage_record']}
																onChange={(evt) =>
																	handleSetPropertyData({
																		value: evt.target.value,
																		propertyName: 'mortgage_record',
																	})
																}
															/>
														</div>
													</div>

													<div className="space-y-4">
														<h3>
															<span className="text-lg">Title Attributes</span>
														</h3>
														<div className="xpb-4">
															<Input
																label="Title Method"
																placeholder="Title Method"
																value={propertyData.title_method}
																id="title_method"
																name="title_method"
																type="text"
																// error={propertyDataErrors['title_method']}
																onChange={(evt) =>
																	handleSetPropertyData({
																		value: evt.target.value,
																		propertyName: 'title_method',
																	})
																}
															/>
														</div>

														<div className="xpb-4">
															<Input
																label="Title Held By"
																placeholder="Title Held By"
																value={propertyData.title_held_by}
																id="title_held_by"
																name="title_held_by"
																type="text"
																// error={propertyDataErrors['title_held_by']}
																onChange={(evt) =>
																	handleSetPropertyData({
																		value: evt.target.value,
																		propertyName: 'title_held_by',
																	})
																}
															/>
														</div>

														<div className="xpb-4">
															<Input
																label="EIN #"
																placeholder="EIN #"
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
																value={propertyData.transfer_restrictions}
																id="transfer_restrictions"
																name="transfer_restrictions"
																type="text"
																// error={propertyDataErrors['transfer_restrictions']}
																onChange={(evt) =>
																	handleSetPropertyData({
																		value: evt.target.value,
																		propertyName: 'transfer_restrictions',
																	})
																}
															/>
														</div>
													</div>

													<div className="space-y-4">
														<h3>
															<span className="text-lg">Property Record</span>
														</h3>
														<div className="xpb-4">
															<Input
																label="Marketing Name"
																placeholder="Marketing Name"
																value={propertyData.marketing_name}
																id="marketing_name"
																name="marketing_name"
																type="text"
																// error={propertyDataErrors['marketing_name']}
																onChange={(evt) =>
																	handleSetPropertyData({
																		value: evt.target.value,
																		propertyName: 'marketing_name',
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
																value={propertyData.sq_ft}
																id="sq_ft"
																name="sq_ft"
																type="text"
																// error={propertyDataErrors['sq_ft']}
																onChange={(evt) =>
																	handleSetPropertyData({
																		value: evt.target.value,
																		propertyName: 'sq_ft',
																	})
																}
															/>
														</div>

														<div className="xpb-4">
															<Textarea
																label="Property Description"
																placeholder="Property Description"
																value={propertyData.property_description}
																id="property_description"
																name="property_description"
																type="text"
																// error={propertyDataErrors['property_description']}
																onChange={(evt) =>
																	handleSetPropertyData({
																		value: evt.target.value,
																		propertyName: 'property_description',
																	})
																}
															/>
														</div>
													</div>

													<div className="space-y-4">
														<h3>
															<span className="text-lg">Material Agreements &amp; Documentation</span>
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
																value={propertyData.title_insurance}
																id="title_insurance"
																name="title_insurance"
																type="text"
																// error={propertyDataErrors['title_insurance']}
																onChange={(evt) =>
																	handleSetPropertyData({
																		value: evt.target.value,
																		propertyName: 'title_insurance',
																	})
																}
															/>
														</div>

														<div className="xpb-4">
															<Input
																label="Articles Of Organization"
																placeholder="Articles Of Organization"
																value={propertyData.articles_of_organization}
																id="articles_of_organization"
																name="articles_of_organization"
																type="text"
																// error={propertyDataErrors['articles_of_organization']}
																onChange={(evt) =>
																	handleSetPropertyData({
																		value: evt.target.value,
																		propertyName: 'articles_of_organization',
																	})
																}
															/>
														</div>

														<div className="xpb-4">
															<Input
																label="Certificate Of Organization From Secretary Of State"
																placeholder="Certificate Of Organization From Secretary Of State"
																value={propertyData.certificate_of_organization_from_secretary_of_state}
																id="certificate_of_organization_from_secretary_of_state"
																name="certificate_of_organization_from_secretary_of_state"
																type="text"
																// error={propertyDataErrors['certificate_of_organization_from_secretary_of_state']}
																onChange={(evt) =>
																	handleSetPropertyData({
																		value: evt.target.value,
																		propertyName: 'certificate_of_organization_from_secretary_of_state',
																	})
																}
															/>
														</div>

														<div className="xpb-4">
															<Input
																label="Operating Agreement"
																placeholder="Operating Agreement"
																value={propertyData.operating_agreement}
																id="operating_agreement"
																name="operating_agreement"
																type="text"
																// error={propertyDataErrors['operating_agreement']}
																onChange={(evt) =>
																	handleSetPropertyData({
																		value: evt.target.value,
																		propertyName: 'operating_agreement',
																	})
																}
															/>
														</div>

														<div className="xpb-4">
															<Input
																label="Membership Interest Transfer Agreement"
																placeholder="Membership Interest Transfer Agreement"
																value={propertyData.membership_interest_transfer_agreement}
																id="membership_interest_transfer_agreement"
																name="membership_interest_transfer_agreement"
																type="text"
																// error={propertyDataErrors['membership_interest_transfer_agreement']}
																onChange={(evt) =>
																	handleSetPropertyData({
																		value: evt.target.value,
																		propertyName: 'membership_interest_transfer_agreement',
																	})
																}
															/>
														</div>

														<div className="xpb-4">
															<Input
																label="Ein Letter From Irs"
																placeholder="Ein Letter From Irs"
																value={propertyData.ein_letter_from_irs}
																id="ein_letter_from_irs"
																name="ein_letter_from_irs"
																type="text"
																// error={propertyDataErrors['ein_letter_from_irs']}
																onChange={(evt) =>
																	handleSetPropertyData({
																		value: evt.target.value,
																		propertyName: 'ein_letter_from_irs',
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

													<div className="space-y-4 pb-16">
														<h3>
															<span className="text-lg">Submitted By</span>
														</h3>
														<div className="xpb-4">
															<Input
																label="Your Legal Name"
																placeholder="Your Legal Name"
																value={propertyData.submitted_by}
																id="submitted_by"
																name="submitted_by"
																type="text"
																// error={propertyDataErrors['submitted_by']}
																onChange={(evt) =>
																	handleSetPropertyData({
																		value: evt.target.value,
																		propertyName: 'submitted_by',
																	})
																}
															/>
														</div>
													</div>
												</>
											)}
										</>
									)}
								</div>
							</div>

							<div className="pt-2">
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
									<Empty index={0} governance={governance} />
								</NewProposalContext.Provider>
								<div className="border-t border-fgd-4 flex justify-end mt-6 pt-6 space-x-4">
									{/* <SecondaryButton
										disabled={isLoading}
										isLoading={isLoadingDraft}
										onClick={() => {
											upload()
											handleCreate(true)
										}}
									>
										Save draft
									</SecondaryButton> */}
									<Button
										isLoading={isLoadingSignedProposal}
										disabled={isLoading}
										onClick={() => {
											submitProposal()
										}}
									>
										{proposalType === 1 ? 'Propose Property' : 'Propose rNFT'}
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
		</>
	)
}

export default New
