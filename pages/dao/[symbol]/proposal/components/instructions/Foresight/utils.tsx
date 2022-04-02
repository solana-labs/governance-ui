import useGovernanceAssets from '@hooks/useGovernanceAssets'
import {
  governance as foresightGov,
  consts as foresightConsts,
} from '@foresight-tmp/foresight-sdk'
import { isFormValid } from '@utils/formValidation'
import { GovernedMultiTypeAccount, GovernedTokenAccount } from '@utils/tokens'
import {
  Governance,
  ProgramAccount,
  serializeInstructionToBase64,
} from '@solana/spl-governance'
import GovernedAccountSelect from '../../GovernedAccountSelect'
import { Dispatch, useEffect } from 'react'
import {
  ForesightHasCategoryId,
  ForesightHasGovernedAccount,
  ForesightHasMarketListId,
  UiInstruction,
} from '@utils/uiTypes/proposalCreationTypes'
import Input from '@components/inputs/Input'
import { SignerWalletAdapter } from '@solana/wallet-adapter-base'
import { PublicKey, TransactionInstruction } from '@solana/web3.js'
import { PredictionMarketProgram } from '@foresight-tmp/foresight-sdk/dist/types'
import { ObjectSchema } from 'yup'
import { RealmInfo } from '@models/registry/api'

type EmptyObject = Record<string, never>
type SetFormErrors = Dispatch<React.SetStateAction<EmptyObject>>

export function getFilteredTokenAccounts(): GovernedTokenAccount[] {
  const { governedTokenAccountsWithoutNfts } = useGovernanceAssets()
  return governedTokenAccountsWithoutNfts.filter((x) =>
    x.transferAddress?.equals(foresightGov.DEVNET_TREASURY)
  )
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

export function makeHandleSetForm<T extends ForesightHasGovernedAccount>(
  form: T,
  setForm: Dispatch<React.SetStateAction<T>>
): HandleSetForm {
  function handleSetForm({
    propertyName,
    value,
  }: {
    propertyName: string
    value: any
  }) {
    setForm({ ...form, [propertyName]: value })
  }
  return handleSetForm
}

export function makeValidateInstruction(
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

export function makeHandleSetFormWithErrors<
  T extends ForesightHasGovernedAccount
>(
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
  form: T,
  program: PredictionMarketProgram
) => Promise<TransactionInstruction>

export function makeGetInstruction<T extends ForesightHasGovernedAccount>(
  ixCreator: IxCreator<T>,
  form: T,
  validateInstruction: () => Promise<boolean>,
  programId: PublicKey | undefined,
  wallet: SignerWalletAdapter | undefined
): GetInstruction {
  async function getInstruction(): Promise<UiInstruction> {
    const isValid = await validateInstruction()
    let serializedInstruction = ''
    if (isValid && programId && wallet?.publicKey) {
      const program = foresightGov.readonlyProgram(
        new PublicKey(foresightConsts.DEVNET_PID)
      )
      const ix = await ixCreator(form, program)
      serializedInstruction = serializeInstructionToBase64(ix)
    }
    return getUiInstruction(serializedInstruction, isValid, form)
  }
  return getInstruction
}

export function ForesightUseEffects(
  handleSetForm: HandleSetForm,
  programId: PublicKey | undefined,
  realmInfo: RealmInfo | undefined,
  form: ForesightHasGovernedAccount,
  handleSetInstructions: HandleSetInstructions,
  getInstruction: GetInstruction,
  index: number
): void {
  useEffect(() => {
    handleSetForm({
      propertyName: 'programId',
      value: programId?.toString(),
    })
  }, [realmInfo?.programId])

  useEffect(() => {
    handleSetInstructions(
      { governedAccount: form.governedAccount?.governance, getInstruction },
      index
    )
  }, [form])
}

export function getUiInstruction(
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

export function ForesightGovernedAccountSelect(props: {
  filteredTokenAccounts: GovernedTokenAccount[]
  form: ForesightHasGovernedAccount
  handleSetForm: HandleSetForm
  index: number
  governance: ProgramAccount<Governance> | null
}) {
  const shouldBeGoverned = props.index !== 0 && props.governance
  return (
    <GovernedAccountSelect
      label="Program"
      governedAccounts={
        props.filteredTokenAccounts as GovernedMultiTypeAccount[]
      }
      onChange={(value) => {
        props.handleSetForm({ value, propertyName: 'governedAccount' })
      }}
      value={props.form.governedAccount}
      shouldBeGoverned={shouldBeGoverned}
      governance={props.governance}
    ></GovernedAccountSelect>
  )
}

export function ForesightCategoryIdInput(props: {
  form: ForesightHasCategoryId
  handleSetForm: HandleSetForm
  formErrors: EmptyObject
}) {
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

export function ForesightMarketListIdInput(props: {
  form: ForesightHasMarketListId
  handleSetForm: HandleSetForm
  formErrors: EmptyObject
}) {
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
