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
import { TOKR_DAO } from '@components/instructions/tools'
import useRouterHistory from '@hooks/useRouterHistory'
import { constructUri } from '@utils/resolveUri'
import { route } from 'next/dist/server/router'
import { getData, removeData, storeData } from '@hooks/useLocalStorage'

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
	const router = useRouter()
	const { history, getPathName } = useRouterHistory()
	const client = useVoteStakeRegistryClientStore((s) => s.state.client)
	const { fmtUrlWithCluster } = useQueryContext()
	const { symbol, realm, realmInfo, realmDisplayName, ownVoterWeight, mint, councilMint, canChooseWhoVote, governances } = useRealm()

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
		symbol: 'rNFT',
		name: '',
		property_address: '',
		description: '',
		image: '',
		lat_long: '',
		sq_ft: '',
		acres: '',
		type: '',
		tax_parcel_numbers: '',
		title_held_by: '',
		ein_number: '',
		title_method: 'Sole Ownership',
		transfer_restrictions: '',
		title_insurance: '',
		deed: '',
		purchase_contract: '',
		mortgage: '',
		lao_articles_of_organization_from_secretary_of_state: '',
		spv_articles_of_organization_from_secretary_of_state: '',
		spv_operating_agreement: '',
		ein_letter_from_irs: '',
		assignment_of_membership_interests_agreement: '',
		submitted_by_authorized_representative: '',
		legal: `Buyer and Seller hereby acknowledge and agree that each have become a party to the Assignment of Membership Interests by purchasing or selling this rNFT, which Assignment of Membership Interests is linked in the rNFT metadata and is effective as of the date and time of the transfer of the rNFT. Buyer and Seller hereby acknowledge and agree that, by signing the smart contract to transfer this rNFT for the consideration documented on the blockchain, each are effectuating the transfer of the Membership Interest described in the Assignment of Membership Interest from Seller to Buyer upon the terms and subject to the conditions contained therein. \nThe Current Owner, Tokr DAO, and any Tokr affiliates or contributors to the open source software and systems involved in the Tokr Protocol and the minting of this rNFT hereby disclaim any representation or warranty relating to the sufficiency or adequacy of the title to the real estate owned by the entity specified in the rNFT metadata, and, by purchasing this rNFT, you hereby acknowledge that you are not relying on any such representations or warranties. Linked in the metadata is a copy of the Owner's Title Insurance Policy that was obtained at the time of acquisition (or subsequently as amended in the metadata, if applicable). The metadata and documentation submitted as part of rNFT certification and verification process is intended to make data collection easier to assist you in conducting your own due diligence. It is strongly encouraged that you conduct your own research and additional due diligence as it relates to the sufficiency and adequacy of the title to such real estate prior to acquiring this rNFT, which may include obtaining a title insurance policy. Any validations or certifications made by the Current Owner or Tokr DAO and any affiliates or contributors relating to the rNFT do not relate to the title of such real estate.`,
		uri: arWeaveLink || '',
	})

	const [descriptionLink, setDescriptionLink] = useState({})
	const [metaplexDataObj, setMetaplexDataObj] = useState({
		name: '',
		symbol: 'rNFT',
		description: '',
		image: '',
		attributes: [
			{
				trait_type: 'name',
				value: '',
			},
			{
				trait_type: 'property_address',
				value: '',
			},
			{
				trait_type: 'description',
				value: '',
			},
			{
				trait_type: 'lat_long',
				value: '',
			},
			{
				trait_type: 'sq_ft',
				value: '',
			},
			{
				trait_type: 'acres',
				value: '',
			},
			{
				trait_type: 'type',
				value: '',
			},
			{
				trait_type: 'tax_parcel_numbers',
				value: '',
			},
			{
				trait_type: 'title_held_by',
				value: '',
			},
			{
				trait_type: 'ein_number',
				value: '',
			},
			{
				trait_type: 'title_method',
				value: '',
			},
			{
				trait_type: 'transfer_restrictions',
				value: '',
			},
			{
				trait_type: 'title_insurance',
				value: '',
			},
			{
				trait_type: 'deed',
				value: '',
			},
			{
				trait_type: 'purchase_contract',
				value: '',
			},
			{
				trait_type: 'mortgage',
				value: '',
			},
			{
				trait_type: 'lao_articles_of_organization_from_secretary_of_state',
				value: '',
			},
			{
				trait_type: 'spv_articles_of_organization_from_secretary_of_state',
				value: '',
			},
			{
				trait_type: 'spv_operating_agreement',
				value: '',
			},
			{
				trait_type: 'ein_letter_from_irs',
				value: '',
			},
			{
				trait_type: 'assignment_of_membership_interests_agreement',
				value: '',
			},
			{
				trait_type: 'submitted_by_authorized_representative',
				value: '',
			},
			{
				trait_type: 'legal',
				value: `Buyer and Seller hereby acknowledge and agree that each have become a party to the Assignment of Membership Interests by purchasing or selling this rNFT, which Assignment of Membership Interests is linked in the rNFT metadata and is effective as of the date and time of the transfer of the rNFT. Buyer and Seller hereby acknowledge and agree that, by signing the smart contract to transfer this rNFT for the consideration documented on the blockchain, each are effectuating the transfer of the Membership Interest described in the Assignment of Membership Interest from Seller to Buyer upon the terms and subject to the conditions contained therein. \nThe Current Owner, Tokr DAO, and any Tokr affiliates or contributors to the open source software and systems involved in the Tokr Protocol and the minting of this rNFT hereby disclaim any representation or warranty relating to the sufficiency or adequacy of the title to the real estate owned by the entity specified in the rNFT metadata, and, by purchasing this rNFT, you hereby acknowledge that you are not relying on any such representations or warranties. Linked in the metadata is a copy of the Owner's Title Insurance Policy that was obtained at the time of acquisition (or subsequently as amended in the metadata, if applicable). The metadata and documentation submitted as part of rNFT certification and verification process is intended to make data collection easier to assist you in conducting your own due diligence. It is strongly encouraged that you conduct your own research and additional due diligence as it relates to the sufficiency and adequacy of the title to such real estate prior to acquiring this rNFT, which may include obtaining a title insurance policy. Any validations or certifications made by the Current Owner or Tokr DAO and any affiliates or contributors relating to the rNFT do not relate to the title of such real estate.`,
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

				const url = fmtUrlWithCluster(`/dao/${symbol}/proposal/${proposalAddress}?initial=true`)

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
			const numberType = parseInt(router.query?.type.toString())
			setProposalType(numberType)
		}

		if (router.query?.property) {
			setProposalType(1)
			setLiteMode(true)
		}

		if (router.query?.uri) {
			setProposalType(2)
			setLiteMode(false)


			const url = constructUri(router.query?.uri.toString(), true);

			fetch(url, {
				method: 'GET',
			})
			.then((res) => res.json())
			.then((res) => {
				const temp = res.attributes.map((attribute) => {
					res[attribute.trait_type] = attribute.value
				})

				setPropertyData({
					...res,
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

		// try {
		// 	console.log("trying....")
		const result = await uploadToArweave(data, JSON.stringify(metaplexDataObj))
		// } catch {
		// 	// TODO: if fails store localstorage version for recovery....
		// }
		console.log("result", result);

		const metadataResultFile = result.messages?.find((m) => m.filename === 'manifest.json') || {
			aws: true,
			transactionId: result
		};

		console.log("metadataResultFile", metadataResultFile);

		setSubmittingStep([...submittingStep, `Data uploaded.`])
		if (metadataResultFile?.transactionId) {
			const link = metadataResultFile.aws? result : `https://arweave.net/${metadataResultFile.transactionId}`
			setArWeaveLink(link)

			console.log(link);

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
		if (proposalType !== 0) {
			if (proposalType === 1) {
				setMetaplexDataObj({
					name: propertyData.name,
					symbol: 'rNFT',
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
					symbol: 'rNFT',
					description: propertyData.description,
					image: propertyData.image,
					attributes: [
						{
							trait_type: 'name',
							value: propertyData.name,
						},
						{
							trait_type: 'property_address',
							value: propertyData.property_address,
						},
						{
							trait_type: 'description',
							value: propertyData.description,
						},
						{
							trait_type: 'lat_long',
							value: propertyData.lat_long,
						},
						{
							trait_type: 'sq_ft',
							value: propertyData.sq_ft,
						},
						{
							trait_type: 'acres',
							value: propertyData.acres,
						},
						{
							trait_type: 'type',
							value: propertyData.type,
						},
						{
							trait_type: 'tax_parcel_numbers',
							value: propertyData.tax_parcel_numbers,
						},
						{
							trait_type: 'title_held_by',
							value: propertyData.title_held_by,
						},
						{
							trait_type: 'ein_number',
							value: propertyData.ein_number,
						},
						{
							trait_type: 'title_method',
							value: propertyData.title_method,
						},
						{
							trait_type: 'transfer_restrictions',
							value: propertyData.transfer_restrictions,
						},
						{
							trait_type: 'title_insurance',
							value: propertyData.title_insurance,
						},
						{
							trait_type: 'deed',
							value: propertyData.deed,
						},
						{
							trait_type: 'purchase_contract',
							value: propertyData.purchase_contract,
						},
						{
							trait_type: 'mortgage',
							value: propertyData.mortgage,
						},
						{
							trait_type: 'lao_articles_of_organization_from_secretary_of_state',
							value: propertyData.lao_articles_of_organization_from_secretary_of_state,
						},
						{
							trait_type: 'spv_articles_of_organization_from_secretary_of_state',
							value: propertyData.spv_articles_of_organization_from_secretary_of_state,
						},
						{
							trait_type: 'spv_operating_agreement',
							value: propertyData.spv_operating_agreement,
						},
						{
							trait_type: 'ein_letter_from_irs',
							value: propertyData.ein_letter_from_irs,
						},
						{
							trait_type: 'assignment_of_membership_interests_agreement',
							value: propertyData.assignment_of_membership_interests_agreement,
						},
						{
							trait_type: 'submitted_by_authorized_representative',
							value: propertyData.submitted_by_authorized_representative,
						},
						{
							trait_type: 'legal',
							value: propertyData.legal,
						},
					],
				})
			}
		} else {
			setMetaplexDataObj({
				name: propertyData.name,
				symbol: propertyData.symbol,
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
				],
			})
		}
	}, [propertyData])

	const setProposalForSubmit = async (link) => {
		const descriptionObj = {
			description: proposalType === 0 ? propertyName + ' Proposal' : `Proposal to ${proposalType === 1 ? 'Purchase Real Estate and Begin Syndication' : 'Proposal to Request Tokr DAO to certify property and mint rNFT'}`,
			type: proposalType,
			// description: `Proposal to Purchase ${propertyData.property_address ? `${propertyData.property_address}` : 'Real Estate'}`,
			uri: link,
		}

		setForm({
			title: proposalType === 0 ? propertyName : `${propertyName} ${proposalType === 1 ? 'Purchase Request' : 'Certification Request'}`,
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

	useEffect(() => {
		if ((router?.query?.type || proposalType === 1 || proposalType === 2) && realmInfo && (propertyData && propertyData?.name)) {
			const typeId = router?.query?.type || proposalType;
			storeData(`${realmInfo?.realmId.toBase58()}${typeId ? "_" + typeId : ''}`, JSON.stringify(propertyData))
		}
	}, [propertyData, router, realmInfo, proposalType])

	const [initalLoad, setInitalLoad] = useState<boolean>(true)
	useEffect(() => {
		if (realmDisplayName) setInitalLoad(false)
	}, [realmDisplayName])

	const [canCreateAction, setcanCreateAction] = useState(false)
	const governanceItems = Object.values(governances)
	useEffect(() => {
		setcanCreateAction(governanceItems.some((g) => ownVoterWeight.canCreateProposal(g.account.config)))
	}, [governanceItems, history])

	const [formIsValid, setFormIsValid] = useState<boolean>(false)

	const checkFormValidity = (): boolean => {
		if (!canCreateAction) return false
		if (process?.browser && document) {
			const formInputs = document.querySelectorAll(`.field-validate:not(:valid)`) || []
			// console.log('checkFormValidity', formInputs)
			return formInputs.length > 0 || !governance ? false : true
		} else {
			return false
		}
	}

	useEffect(() => {
		if (!initalLoad) setFormIsValid(checkFormValidity())
	}, [propertyData, governance, canCreateAction])


	const [loadedLS, setLoadedLS] = useState<boolean>(false)
	useEffect(() => {
		if (((router?.query?.type || proposalType === 1 || proposalType === 2) && (realmInfo && (initalLoad === false)))) {
			const typeId = router?.query?.type || proposalType;
			const temp = getData(`${realmInfo?.realmId.toBase58()}${typeId ? "_" + typeId : ''}`);
			if (JSON.parse(temp)?.name) {
				setPropertyData(JSON.parse(temp));
				setLoadedLS(true);
			}
			console.log(proposalType)
		}
	}, [router, realmInfo, initalLoad, proposalType])


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
				<div className="mt-8 ml-4 -mb-3 relative z-10 m-width-full">
					{/* <a href={realmUrl} target="_blank" rel="noopener noreferrer" className="bg-dark inline-block">
					<span className="flex items-center cursor-pointer">
						<span className="flex flex-col md:flex-row items-center pb-3 md:pb-0">
							<span className="ml-4 pr-8 text-3xl uppercase">{realmDisplayName}</span>
						</span>
					</span>
				</a> */}

					<h1 className="bg-dark inline-block">
						<span className="ml-4 pr-8 text-sm uppercase">{proposalType === 0 ? <>{realmDisplayName} Proposal</> : <>{proposalType === 1 ? `Property Proposal ${realmDisplayName ? ` for ${realmDisplayName}` : ''}` : `${propertyData?.name ? `${propertyData.name}` : ' Property'} Certification Propsal`}</>}</span>
					</h1>
				</div>
				<div className="grid grid-cols-12 gap-4">
					<div className={`border border-fgd-1 bg-bkg-2 col-span-12 md:col-span-7 md:order-first lg:col-span-8 order-last p-4 md:p-6 space-y-3 ${isLoading ? 'pointer-events-none' : ''}`}>
						<p className="pt-8">
							{proposalType === 0 && `Proposal for the ${realmDisplayName} to vote on any topic or item.`}
							{proposalType === 1 && `Proposal for the ${realmDisplayName} to vote on the purchase of Real Estate and begin syndication.`}
							{proposalType === 2 && <span dangerouslySetInnerHTML={{ __html: `Proposal for the ${realmDisplayName} to vote on the request for the <a href="/dao/${TOKR_DAO}" class="hover:underline">Tokr DAO</a> to certify ${propertyData?.name ? `<span class="font-bold">${propertyData.name}</span> (property) ` : ' a property '} and mint the rNFT.` }} />}
						</p>

						{((loadedLS && (router?.query?.type || proposalType === 2 || proposalType === 1) && realmInfo)) && (
							<p className="mt-16 py-4 border-t border-b border-green">
								We restored your past entry. Want to start fresh?{' '}
								<a
									href="#"
									onClick={(e) => {
										setLoadedLS(false)
										setPropertyData({
											symbol: '',
											name: '',
											description: '',
											property_address: '',
											lat_long: '',
											acres: '',
											title_method: '',
											title_held_by: '',
											ein_number: '',
											transfer_restrictions: '',
											type: '',
											sq_ft: '',
											tax_parcel_numbers: '',
											deed: '',
											title_insurance: '',
											purchase_contract: '',
											mortgage: '',
											lao_articles_of_organization_from_secretary_of_state: '',
											spv_articles_of_organization_from_secretary_of_state: '',
											spv_operating_agreement: '',
											ein_letter_from_irs: '',
											assignment_of_membership_interests_agreement: '',
											submitted_by_authorized_representative: '',
											legal: '',
											image: '',
											uri: arWeaveLink || '',
										})
										removeData(`${realmInfo?.realmId.toBase58()}${router?.query?.type ? '_' + router?.query?.type : proposalType === 1 || proposalType === 2 ? '_' + proposalType : ''}`)
										e.preventDefault()
									}}
								>
									Click here.
								</a>
							</p>
						)}

						<>
							<div className="pt-8 mb-20">
								<div className="space-y-16">
									{proposalType === 0 ? (
										<>
											<div className="space-y-4">
												<div className="xpb-4">
													<Input
														label="Name"
														placeholder="Name"
														value={propertyData?.name}
														id="name"
														name="name"
														type="text"
														className="field-validate"
														required
														max
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
														value={propertyData?.description}
														id="description"
														name="description"
														type="text"
														className="field-validate"
														required
														// error={propertyDataErrors['description']}
														onChange={(evt) =>
															handleSetPropertyData({
																value: evt.target.value,
																propertyName: 'description',
															})
														}
													/>
													<div className="text-xs pt-2">Did you know? You can use Markdown!</div>
												</div>
											</div>
										</>
									) : (
										<>
											<div className="space-y-4">
												<h3>
													<span className="text-lg">Property Information</span>
												</h3>

												<div className="pb-4 hidden">
													<Input
														label="Symbol"
														placeholder="Symbol"
														value={propertyData.symbol}
														id="symbol"
														name="symbol"
														type="hidden"
														// error={propertyDataErrors['symbol']}
														onChange={(evt) =>
															handleSetPropertyData({
																value: evt.target.value,
																propertyName: 'symbol',
															})
														}
													/>
												</div>

												<div className="xpb-4">
													<Input
														label="Property Name"
														placeholder="Name representing the property"
														value={propertyData?.name}
														id="name"
														name="name"
														type="text"
														error={formErrors['title']}
														className="field-validate"
														required
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
													<Input
														label="Property Address"
														placeholder="Enter full address of property"
														value={propertyData.property_address}
														id="property_address"
														name="property_address"
														type="search"
														className="field-validate"
														required
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
													<Textarea
														label="Property Description"
														value={propertyData?.description}
														id="description"
														name="description"
														type="text"
														className="field-validate"
														required
														// error={propertyDataErrors['description']}
														onChange={(evt) =>
															handleSetPropertyData({
																value: evt.target.value,
																propertyName: 'description',
															})
														}
													/>
													<div className="text-xs pt-2 pb-4">Did you know? You can use Markdown!</div>
												</div>

												<div className="xpb-4">
													<Input
														label="Image"
														placeholder="https://..."
														value={propertyData?.image}
														id="image"
														name="image"
														type="url"
														className="field-validate"
														required
														// error={propertyDataErrors['description']}
														onChange={(evt) =>
															handleSetPropertyData({
																value: evt.target.value,
																propertyName: 'image',
															})
														}
													/>
												</div>

												<div className="xpb-4">
													<Input
														label="Coordinates"
														placeholder="Latitude, Longitude"
														value={propertyData?.lat_long}
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

													<div className="text-xs pt-2 pb-4">
														Find Latitude and Longitude of your property:{' '}
														<a target="_target" href="https://www.latlong.net/convert-address-to-lat-long.html">
															click here
														</a>
													</div>
												</div>

												<div className="xpb-4">
													<Input
														label="Square Feet"
														placeholder="#"
														value={propertyData.sq_ft}
														id="sq_ft"
														name="sq_ft"
														type="tel"
														className="field-validate"
														required
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
													<Input
														label="Acres"
														placeholder="#"
														value={propertyData.acres}
														id="acres"
														name="acres"
														type="tel"
														className="field-validate"
														required
														// error={propertyDataErrors['acres']}
														onChange={(evt) =>
															handleSetPropertyData({
																value: evt.target.value,
																propertyName: 'acres',
															})
														}
													/>
												</div>
												{proposalType === 2 && (
													<>
														<div className="xpb-4">
															<Input
																label="Type"
																placeholder="e.g. Lot, Commercial, Multi-Family, Single-Family, Other"
																value={propertyData.type}
																id="type"
																name="type"
																type="text"
																className="field-validate"
																required
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
																label="Tax Parcel Numbers"
																placeholder="(Located in your Deed or Title Insurance Docs)"
																value={propertyData.tax_parcel_numbers}
																id="tax_parcel_numbers"
																name="tax_parcel_numbers"
																type="text"
																className="field-validate"
																required
																// error={propertyDataErrors['tax_parcel_numbers']}
																onChange={(evt) =>
																	handleSetPropertyData({
																		value: evt.target.value,
																		propertyName: 'tax_parcel_numbers',
																	})
																}
															/>
														</div>
													</>
												)}
											</div>

											{proposalType === 2 && (
												<>
													<div className="space-y-4">
														<h3>
															<span className="text-lg">Title Attributes</span>
														</h3>

														<div className="xpb-4">
															<Input
																label="Title Held By"
																placeholder="The SPV LLC"
																value={propertyData.title_held_by}
																id="title_held_by"
																name="title_held_by"
																type="text"
																className="field-validate"
																required
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
																label="EIN Number"
																placeholder="EIN of the SPV LLC"
																value={propertyData.ein_number}
																id="ein_number"
																name="ein_number"
																type="text"
																className="field-validate"
																required
																// error={propertyDataErrors['ein_number']}
																onChange={(evt) =>
																	handleSetPropertyData({
																		value: evt.target.value,
																		propertyName: 'ein_number',
																	})
																}
															/>
														</div>

														<div className="xpb-4">
															<Input
																label="Title Method"
																placeholder="e.g. Sole Ownership"
																value={propertyData.title_method}
																id="title_method"
																name="title_method"
																type="text"
																className="field-validate"
																required
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
																label="Transfer Restrictions"
																placeholder="Transfer Restrictions"
																value={propertyData.transfer_restrictions}
																id="transfer_restrictions"
																name="transfer_restrictions"
																type="text"
																className="field-validate"
																required
																// error={propertyDataErrors['transfer_restrictions']}
																onChange={(evt) =>
																	handleSetPropertyData({
																		value: evt.target.value,
																		propertyName: 'transfer_restrictions',
																	})
																}
															/>
														</div>

														<div className="xpb-4">
															<Input
																label="Title Insurance"
																placeholder="Title Insuranced By"
																value={propertyData.title_insurance}
																id="title_insurance"
																name="title_insurance"
																type="text"
																className="field-validate"
																required
																// error={propertyDataErrors['title_insurance']}
																onChange={(evt) =>
																	handleSetPropertyData({
																		value: evt.target.value,
																		propertyName: 'title_insurance',
																	})
																}
															/>
														</div>
													</div>

													<div className="space-y-4">
														<h3>
															<span className="text-lg">Documentation</span>
														</h3>
														<div className="xpb-4">
															<Input
																label="Deed"
																placeholder="https://...."
																value={propertyData.deed}
																id="deed"
																name="deed"
																type="url"
																className="field-validate"
																required
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
																label="Purchase Contract"
																placeholder="https://...."
																value={propertyData.purchase_contract}
																id="purchase_contract"
																name="purchase_contract"
																type="url"
																className="field-validate"
																required
																// error={propertyDataErrors['purchase_contract']}
																onChange={(evt) =>
																	handleSetPropertyData({
																		value: evt.target.value,
																		propertyName: 'purchase_contract',
																	})
																}
															/>
														</div>

														<div className="xpb-4">
															<Input
																label="Mortgage"
																placeholder="https://...."
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
																label="LAO Articles Of Organization From Secretary Of State"
																placeholder="https://...."
																value={propertyData.lao_articles_of_organization_from_secretary_of_state}
																id="lao_articles_of_organization_from_secretary_of_state"
																name="lao_articles_of_organization_from_secretary_of_state"
																type="url"
																className="field-validate"
																required
																// error={propertyDataErrors['lao_articles_of_organization_from_secretary_of_state']}
																onChange={(evt) =>
																	handleSetPropertyData({
																		value: evt.target.value,
																		propertyName: 'lao_articles_of_organization_from_secretary_of_state',
																	})
																}
															/>
														</div>

														<div className="xpb-4">
															<Input
																label="SPV Articles Of Organization From Secretary Of State"
																placeholder="https://...."
																value={propertyData.spv_articles_of_organization_from_secretary_of_state}
																id="spv_articles_of_organization_from_secretary_of_state"
																name="spv_articles_of_organization_from_secretary_of_state"
																type="url"
																className="field-validate"
																required
																// error={propertyDataErrors['spv_articles_of_organization_from_secretary_of_state']}
																onChange={(evt) =>
																	handleSetPropertyData({
																		value: evt.target.value,
																		propertyName: 'spv_articles_of_organization_from_secretary_of_state',
																	})
																}
															/>
														</div>

														<div className="xpb-4">
															<Input
																label="SPV Operating Agreement"
																placeholder="https://...."
																value={propertyData.spv_operating_agreement}
																id="spv_operating_agreement"
																name="spv_operating_agreement"
																type="url"
																className="field-validate"
																required
																// error={propertyDataErrors['spv_operating_agreement']}
																onChange={(evt) =>
																	handleSetPropertyData({
																		value: evt.target.value,
																		propertyName: 'spv_operating_agreement',
																	})
																}
															/>
														</div>

														<div className="xpb-4">
															<Input
																label="EIN Letter from IRS"
																placeholder="https://...."
																value={propertyData.ein_letter_from_irs}
																id="ein_letter_from_irs"
																name="ein_letter_from_irs"
																type="url"
																className="field-validate"
																required
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
																label="Assignment Of Membership Interests Agreement"
																placeholder="https://...."
																value={propertyData.assignment_of_membership_interests_agreement}
																id="assignment_of_membership_interests_agreement"
																name="assignment_of_membership_interests_agreement"
																type="url"
																className="field-validate"
																required
																// error={propertyDataErrors['assignment_of_membership_interests_agreement']}
																onChange={(evt) =>
																	handleSetPropertyData({
																		value: evt.target.value,
																		propertyName: 'assignment_of_membership_interests_agreement',
																	})
																}
															/>
														</div>
													</div>

													<div className="u-offset-2-sm u-offset-4-sm o-flex-1">
														<div className="space-y-4 pb-16">
															<h3>
																<span className="text-lg">Submitted By</span>
															</h3>
															<div className="xpb-4">
																<Input
																	label="Authorized Representative Name"
																	placeholder="Legal Full Name"
																	value={propertyData.submitted_by_authorized_representative}
																	id="submitted_by_authorized_representative"
																	name="submitted_by_authorized_representative"
																	type="text"
																	className="field-validate"
																	required
																	// error={propertyDataErrors['submitted_by_authorized_representative']}
																	onChange={(evt) =>
																		handleSetPropertyData({
																			value: evt.target.value,
																			propertyName: 'submitted_by_authorized_representative',
																		})
																	}
																/>
															</div>
														</div>

														<div className="pb-4 hidden">
															<Input
																label="Legal"
																placeholder="Legal"
																value={propertyData.legal}
																id="legal"
																name="legal"
																type="hidden"
																// error={propertyDataErrors['legal']}
																onChange={(evt) =>
																	handleSetPropertyData({
																		value: evt.target.value,
																		propertyName: 'legal',
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

							<div className={`pt-2${canCreateAction ? '' : ' opacity-30 grayscale pointer-events-none'}`}>
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
								<div className={`border-t border-fgd-4 flex justify-end mt-6 pt-6 space-x-4${formIsValid ? '' : ' opacity-30 grayscale pointer-events-none'}`}>
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
										disabled={!formIsValid || isLoading}
										onClick={() => {
											submitProposal()
										}}
									>
										{proposalType === 0 ? <>Create Proposal</> : <>{proposalType === 1 ? 'Propose Property' : 'Propose Certification'}</>}
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
