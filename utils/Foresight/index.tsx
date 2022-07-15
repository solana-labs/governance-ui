import _ from 'lodash'
import useGovernanceAssets from '@hooks/useGovernanceAssets'
import {
  governance as foresightGov,
  consts as foresightConsts,
} from '@foresight-tmp/foresight-sdk'
import { isFormValid } from '@utils/formValidation'
import { AssetAccount } from '@utils/uiTypes/assets'
import {
  Governance,
  ProgramAccount,
  serializeInstructionToBase64,
} from '@solana/spl-governance'
import GovernedAccountSelect from '../../pages/dao/[symbol]/proposal/components/GovernedAccountSelect'
import { Dispatch, useContext, useEffect, useState } from 'react'
import {
  ForesightHasCategoryId,
  ForesightHasGovernedAccount,
  ForesightHasMarketId,
  ForesightHasMarketListId,
  ForesightMakeResolveMarketParams,
  ForesightMakeSetMarketMetadataParams,
  UiInstruction,
} from '@utils/uiTypes/proposalCreationTypes'
import Input from '@components/inputs/Input'
import { SignerWalletAdapter } from '@solana/wallet-adapter-base'
import { PublicKey, TransactionInstruction } from '@solana/web3.js'
import * as yup from 'yup'
import { ObjectSchema, StringSchema, NumberSchema } from 'yup'
import useRealm from '@hooks/useRealm'
import useWalletStore from 'stores/useWalletStore'
import { NewProposalContext } from '../../pages/dao/[symbol]/proposal/new'
import Select from '@components/inputs/Select'
import TextareaProps from '@components/inputs/Textarea'

type EmptyObject = Record<string, never>
type SetFormErrors = Dispatch<React.SetStateAction<EmptyObject>>

export function getFilteredTokenAccounts(): AssetAccount[] {
  const { governedTokenAccountsWithoutNfts } = useGovernanceAssets()
  return governedTokenAccountsWithoutNfts.filter((x) => {
    const transferAddress = x.extensions.transferAddress
    return (
      transferAddress?.equals(foresightGov.DEVNET_TREASURY) ||
      transferAddress?.equals(foresightGov.MAINNET_TREASURY)
    )
  })
}

type HandleSetForm = ({
  propertyName,
  value,
}: {
  propertyName: string
  value: any
}) => void

type HandleSetInstructions = (
  val: {
    governedAccount: ProgramAccount<Governance> | undefined
    getInstruction: GetInstruction
  },
  index: number
) => void

function makeValidateInstruction(
  schema: ObjectSchema<any>,
  form: ForesightHasGovernedAccount,
  setFormErrors: SetFormErrors
): () => Promise<boolean> {
  async function validateInstruction(): Promise<boolean> {
    const { isValid, validationErrors } = await isFormValid(schema, form)
    setFormErrors(validationErrors)
    return isValid
  }
  return validateInstruction
}

function makeHandleSetFormWithErrors<T extends ForesightHasGovernedAccount>(
  form: T,
  setForm: Dispatch<React.SetStateAction<T>>,
  setFormErrors: SetFormErrors
): HandleSetForm {
  function handleSetForm({
    propertyName,
    value,
  }: {
    propertyName: string
    value: any
  }) {
    setFormErrors({})
    setForm({ ...form, [propertyName]: value })
  }
  return handleSetForm
}

type GetInstruction = () => Promise<UiInstruction>

type IxCreator<T extends ForesightHasGovernedAccount> = (
  form: T
) => Promise<TransactionInstruction>

function makeGetInstruction<T extends ForesightHasGovernedAccount>(
  ixCreator: IxCreator<T>,
  form: T,
  programId: PublicKey | undefined,
  wallet: SignerWalletAdapter | undefined,
  schema: ObjectSchema<any>,
  setFormErrors: SetFormErrors
): GetInstruction {
  const validateInstruction = makeValidateInstruction(
    schema,
    form,
    setFormErrors
  )
  async function getInstruction(): Promise<UiInstruction> {
    const isValid = await validateInstruction()
    let serializedInstruction = ''
    if (isValid && programId && wallet?.publicKey) {
      const ix = await ixCreator(form)
      serializedInstruction = serializeInstructionToBase64(ix)
    }
    return getUiInstruction(serializedInstruction, isValid, form)
  }
  return getInstruction
}

type NonDefault<T extends ForesightHasGovernedAccount> = Omit<
  T,
  'governedAccount'
>
type ValueOf<T> = T[keyof T]
type AllowedSchema = NumberSchema<any> | StringSchema<any>

function defaultValToYupSchema<T extends ForesightHasGovernedAccount>(
  val: ValueOf<NonDefault<T>>
): AllowedSchema {
  if (typeof val === 'number') {
    return yup.number().required()
  }
  return yup.string().required()
}

type formEntryToSchema<T extends ForesightHasGovernedAccount> = {
  [name in keyof NonDefault<T>]: AllowedSchema
}

export function commonAssets<T extends ForesightHasGovernedAccount>(
  formDefaults: NonDefault<T>,
  index: number,
  governance: ProgramAccount<Governance> | null
): {
  inputProps: InputProps<T>
  effector: (ixCreator: IxCreator<T>) => void
  governedAccountSelect: JSX.Element
  wallet: SignerWalletAdapter | undefined
} {
  const extraSchemaFields: formEntryToSchema<T> = _.mapValues(
    formDefaults,
    defaultValToYupSchema
  )
  const schema = getSchema<T>(extraSchemaFields)
  const wallet = useWalletStore((s) => s.current)
  const filteredTokenAccounts = getFilteredTokenAccounts()
  const [formErrors, setFormErrors] = useState({})
  const { handleSetInstructions } = useContext(NewProposalContext)
  const [form, setForm] = useState<T>({
    governedAccount: filteredTokenAccounts[0],
    ...formDefaults,
  } as T)
  const handleSetForm = makeHandleSetFormWithErrors(
    form,
    setForm,
    setFormErrors
  )
  const inputProps = {
    form,
    handleSetForm,
    formErrors,
  }
  function effector(ixCreator: IxCreator<T>): void {
    ForesightUseEffects(
      handleSetForm,
      form,
      handleSetInstructions,
      ixCreator,
      wallet,
      schema,
      setFormErrors,
      index
    )
  }
  const governedAccountSelect = (
    <ForesightGovernedAccountSelect
      filteredTokenAccounts={filteredTokenAccounts}
      form={form}
      handleSetForm={handleSetForm}
      index={index}
      governance={governance}
    ></ForesightGovernedAccountSelect>
  )
  return {
    inputProps,
    effector,
    governedAccountSelect,
    wallet,
  }
}

function ForesightUseEffects<T extends ForesightHasGovernedAccount>(
  handleSetForm: HandleSetForm,
  form: T,
  handleSetInstructions: HandleSetInstructions,
  ixCreator: IxCreator<T>,
  wallet: SignerWalletAdapter | undefined,
  schema: ObjectSchema<any>,
  setFormErrors: SetFormErrors,
  index: number
): void {
  const { realmInfo } = useRealm()
  const programId: PublicKey | undefined = realmInfo?.programId
  const getInstruction = makeGetInstruction(
    ixCreator,
    form,
    programId,
    wallet,
    schema,
    setFormErrors
  )
  useEffect(() => {
    handleSetForm({
      propertyName: 'programId',
      value: programId?.toString(),
    })
  }, [programId])

  useEffect(() => {
    handleSetInstructions(
      { governedAccount: form.governedAccount?.governance, getInstruction },
      index
    )
  }, [form])
}

export function getSchema<T extends ForesightHasGovernedAccount>(extraFields: {
  [name in keyof Omit<T, 'governedAccount'>]: StringSchema | NumberSchema
}) {
  return yup.object().shape({
    governedAccount: yup
      .object()
      .nullable()
      .required('Program governed account is required'),
    ...extraFields,
  })
}

function getUiInstruction(
  serializedInstruction: string,
  isValid: boolean,
  form: ForesightHasGovernedAccount
): UiInstruction {
  return {
    serializedInstruction: serializedInstruction,
    isValid,
    governance: form.governedAccount?.governance,
  }
}

function ForesightGovernedAccountSelect(props: {
  filteredTokenAccounts: AssetAccount[]
  form: ForesightHasGovernedAccount
  handleSetForm: HandleSetForm
  index: number
  governance: ProgramAccount<Governance> | null
}) {
  const shouldBeGoverned = props.index !== 0 && props.governance
  return (
    <GovernedAccountSelect
      label="Program"
      governedAccounts={props.filteredTokenAccounts}
      onChange={(value) => {
        props.handleSetForm({ value, propertyName: 'governedAccount' })
      }}
      value={props.form.governedAccount}
      shouldBeGoverned={shouldBeGoverned}
      governance={props.governance}
    ></GovernedAccountSelect>
  )
}

type InputProps<T extends ForesightHasGovernedAccount> = {
  form: T
  handleSetForm: HandleSetForm
  formErrors: EmptyObject
}

export function ForesightCategoryIdInput(
  props: InputProps<ForesightHasCategoryId>
) {
  return (
    <Input
      label="Category ID"
      value={props.form.categoryId}
      type="text"
      onChange={(evt) =>
        props.handleSetForm({
          value: evt.target.value,
          propertyName: 'categoryId',
        })
      }
      error={props.formErrors['categoryId']}
    />
  )
}

export function ForesightMarketListIdInput(
  props: InputProps<ForesightHasMarketListId>
) {
  return (
    <Input
      label="Market List ID"
      value={props.form.marketListId}
      type="text"
      onChange={(evt) =>
        props.handleSetForm({
          value: evt.target.value,
          propertyName: 'marketListId',
        })
      }
      error={props.formErrors['marketListId']}
    />
  )
}

export function ForesightMarketIdInput(
  props: InputProps<ForesightHasMarketId>
) {
  return (
    <Input
      label="Market ID"
      value={props.form.marketId}
      type="number"
      min={0}
      onChange={(evt) =>
        props.handleSetForm({
          value: evt.target.value,
          propertyName: 'marketId',
        })
      }
      error={props.formErrors['marketId']}
    />
  )
}

export function ForesightWinnerInput(
  props: InputProps<ForesightMakeResolveMarketParams>
) {
  return (
    <Input
      label="Winner"
      value={props.form.winner}
      min={-1}
      type="number"
      onChange={(evt) =>
        props.handleSetForm({
          value: evt.target.value,
          propertyName: 'winner',
        })
      }
      error={props.formErrors['winner']}
    />
  )
}

export function ForesightContentInput(
  props: InputProps<ForesightMakeSetMarketMetadataParams>
) {
  return (
    <TextareaProps
      label="Content"
      value={props.form.content}
      type="text"
      onChange={(evt) =>
        props.handleSetForm({
          value: evt.target.value,
          propertyName: 'content',
        })
      }
      error={props.formErrors['content']}
    />
  )
}

export function ForesightMarketMetadataFieldSelect(
  props: InputProps<ForesightMakeSetMarketMetadataParams>
) {
  return (
    <Select
      label="Field"
      value={props.form.field}
      onChange={(value) => {
        props.handleSetForm({ value, propertyName: 'field' })
      }}
      error={props.formErrors['field']}
    >
      {Object.keys(foresightConsts.MARKET_METADATA_FIELDS).map((value) => (
        <Select.Option key={value} value={value}>
          {value}
        </Select.Option>
      ))}
    </Select>
  )
}
