import useGovernanceAssets from '@hooks/useGovernanceAssets'
import {
  governance as foresightGov,
  consts as foresightConsts,
} from '@foresight-tmp/foresight-sdk'
import { GovernedMultiTypeAccount, GovernedTokenAccount } from '@utils/tokens'
import { Governance, ProgramAccount } from '@solana/spl-governance'
import GovernedAccountSelect from '../../GovernedAccountSelect'
import { Dispatch, useState } from 'react'
import { ForesightHasGovernedAccount } from '@utils/uiTypes/proposalCreationTypes'

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
  const [formErrors, setFormErrors] = useState({})
  const shouldBeGoverned = props.index !== 0 && props.governance
  function handleSetForm({
    propertyName,
    value,
  }: {
    propertyName: string
    value: any
  }) {
    setFormErrors({})
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
      error={formErrors['governedAccount']}
      shouldBeGoverned={shouldBeGoverned}
      governance={props.governance}
    ></GovernedAccountSelect>
  )
}
