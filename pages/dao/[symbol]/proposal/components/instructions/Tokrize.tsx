import React, { useContext, useEffect, useState } from 'react'
import * as yup from 'yup'
import { serializeInstructionToBase64 } from '@solana/spl-governance'
import { ASSOCIATED_TOKEN_PROGRAM_ID, Token, TOKEN_PROGRAM_ID, u64 } from '@solana/spl-token'
import { WalletAdapter } from '@solana/wallet-adapter-base'
import { PublicKey, SystemProgram, TransactionInstruction } from '@solana/web3.js'
import { getInstructionDataFromBase64, Governance, ProgramAccount } from '@solana/spl-governance'
import Input from '@components/inputs/Input'
import Textarea from '@components/inputs/Textarea'
import { validateInstruction } from '@utils/instructionTools'
import useRealm from '@hooks/useRealm'
import { Base64InstructionForm, TokrizeForm, UiInstruction } from '@utils/uiTypes/proposalCreationTypes'
import useWalletStore from 'stores/useWalletStore'
import * as borsh from 'borsh'
import { NewProposalContext } from '../../new-tokrize'
import GovernedAccountSelect from '../GovernedAccountSelect'
import useGovernedMultiTypeAccounts from '@hooks/useGovernedMultiTypeAccounts'
import { getTokrInstruction } from 'utils/tokrTools'

const TokrizeContract = ({ index, governance, propertyDetails, lookupUri }: { index: number; governance: ProgramAccount<Governance> | null; propertyDetails: any; lookupUri: any }) => {
	const { realmInfo } = useRealm()
	const programId: PublicKey | undefined = realmInfo?.programId
	const connection = useWalletStore((s) => s.connection)
	const wallet = useWalletStore((s) => s.current)

	const { governedMultiTypeAccounts } = useGovernedMultiTypeAccounts()
	const shouldBeGoverned = index !== 0 && governance
	const [form, setForm] = useState<TokrizeForm>({
		governedAccount: undefined,
		name: '',
		symbol: '',
		metaDataUri: '',
		destinationAddress: '',
	})
	const [formErrors, setFormErrors] = useState({})
	const { handleSetInstructions } = useContext(NewProposalContext)
	const handleSetForm = ({ propertyName, value }) => {
		setFormErrors({})
		setForm({ ...form, [propertyName]: value })
	}
	async function getInstruction(): Promise<UiInstruction> {
		return getTokrInstruction({
			schema,
			form,
			programId,
			connection,
			wallet,
			currentAccount: form.governedAccount,
			setFormErrors,
		})
	}
	useEffect(() => {
		handleSetInstructions({ governedAccount: form.governedAccount?.governance, getInstruction }, index)
	}, [form])

	useEffect(() => {
		setForm({
			governedAccount: undefined,
			name: propertyDetails?.name,
			symbol: propertyDetails?.symbol || 'tokr_',
			metaDataUri: lookupUri || '',
			destinationAddress: '',
		})
	}, [propertyDetails])

	const schema = yup.object().shape({
		governedAccount: yup.object().nullable().required('Governed account is required'),
		base64: yup
			.string()
			.required('Instruction is required')
			.test('base64Test', 'Invalid base64', function (val: string) {
				if (val) {
					try {
						getInstructionDataFromBase64(val)
						return true
					} catch (e) {
						return false
					}
				} else {
					return this.createError({
						message: `Instruction is required`,
					})
				}
			}),
	})

	useEffect(() => {
		if (propertyDetails) {
			console.log('propertyDetails!!!', propertyDetails)
		}
	}, [propertyDetails])

	return (
		<>
			<div className="space-y-4">
				<GovernedAccountSelect
					label="Governance"
					governedAccounts={governedMultiTypeAccounts}
					onChange={(value) => {
						handleSetForm({ value, propertyName: 'governedAccount' })
					}}
					value={form.governedAccount}
					error={formErrors['governedAccount']}
					shouldBeGoverned={shouldBeGoverned}
					governance={governance}
				/>
				<Input
					label="Destination Address"
					value={form.destinationAddress}
					type="text"

					className="field-validate"
					required

					placeholder="DAO Treasury Address"
					onChange={(event) => {
						handleSetForm({
							value: event.target.value,
							propertyName: 'destinationAddress',
						})
					}}
					step={1}
					error={formErrors['destinationAddress']}
				/>
			</div>
			<div className="hidden">
				<Input
					label="Name"
					value={form.name}
					type="hidden"
					onChange={(event) => {
						handleSetForm({
							value: event.target.value,
							propertyName: 'name',
						})
					}}
					step={1}
					error={formErrors['name']}
				/>
				<Input
					label="Symbol"
					value={form.symbol}
					type="hidden"
					onChange={(event) => {
						handleSetForm({
							value: event.target.value,
							propertyName: 'symbol',
						})
					}}
					step={1}
					error={formErrors['symbol']}
				/>
				<Input
					label="Metadata Uri"
					value={form.metaDataUri}
					type="hidden"
					onChange={(event) => {
						handleSetForm({
							value: event.target.value,
							propertyName: 'metaDataUri',
						})
					}}
					step={1}
					error={formErrors['metaDataUri']}
				/>
			</div>
		</>
	)
}

export default TokrizeContract
