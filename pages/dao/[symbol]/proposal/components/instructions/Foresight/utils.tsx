import useGovernanceAssets from '@hooks/useGovernanceAssets'
import { governance as foresightGov } from '@foresight-tmp/foresight-sdk'
import { GovernedMultiTypeAccount, GovernedTokenAccount } from '@utils/tokens'
import { Governance, ProgramAccount } from '@solana/spl-governance'
import GovernedAccountSelect from '../../GovernedAccountSelect'
import { Dispatch } from 'react'
import {
  ForesightHasCategoryId,
  ForesightHasGovernedAccount,
} from '@utils/uiTypes/proposalCreationTypes'
import Input from '@components/inputs/Input'

export function getFilteredTokenAccounts(): GovernedTokenAccount[] {
  const { governedTokenAccountsWithoutNfts } = useGovernanceAssets()
  return governedTokenAccountsWithoutNfts.filter((x) =>
    x.transferAddress?.equals(foresightGov.DEVNET_TREASURY)
  )
}

export function ForesightGovernedAccountSelect<
  T extends ForesightHasGovernedAccount
>(props: {
  filteredTokenAccounts: GovernedTokenAccount[]
  form: T
  setForm: Dispatch<React.SetStateAction<T>>
  index: number
  governance: ProgramAccount<Governance> | null
}) {
  const shouldBeGoverned = props.index !== 0 && props.governance
  function handleSetForm({
    propertyName,
    value,
  }: {
    propertyName: string
    value: any
  }) {
    props.setForm({ ...props.form, [propertyName]: value })
  }
  return (
    <GovernedAccountSelect
      label="Program"
      governedAccounts={
        props.filteredTokenAccounts as GovernedMultiTypeAccount[]
      }
      onChange={(value) => {
        handleSetForm({ value, propertyName: 'governedAccount' })
      }}
      value={props.form.governedAccount}
      shouldBeGoverned={shouldBeGoverned}
      governance={props.governance}
    ></GovernedAccountSelect>
  )
}

export function CategoryIdInput<T extends ForesightHasCategoryId>(props: {
  form: T
  handleSetForm: any
  formErrors: any
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
