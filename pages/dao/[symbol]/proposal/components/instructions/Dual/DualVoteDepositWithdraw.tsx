/* eslint-disable @typescript-eslint/no-non-null-assertion */
import React, { useContext, useEffect, useMemo, useState } from 'react'
import { ProgramAccount, Governance } from '@solana/spl-governance'
import {
  UiInstruction,
  DualFinanceDelegateWithdrawForm,
} from '@utils/uiTypes/proposalCreationTypes'
import { NewProposalContext } from '../../../new'
import useGovernanceAssets from '@hooks/useGovernanceAssets'
import { getDelegateWithdrawInstruction } from '@utils/instructions/Dual/delegate'
import { getDualFinanceDelegateWithdrawSchema } from '@utils/validations'
import useWalletOnePointOh from '@hooks/useWalletOnePointOh'
import useLegacyConnectionContext from '@hooks/useLegacyConnectionContext'

const DualVoteDepositWithdraw = ({
  index,
  governance,
}: {
  index: number
  governance: ProgramAccount<Governance> | null
}) => {
  const [form, setForm] = useState<DualFinanceDelegateWithdrawForm>({
    realm: undefined,
    delegateToken: undefined,
  })
  const connection = useLegacyConnectionContext()
  const wallet = useWalletOnePointOh()
  const shouldBeGoverned = !!(index !== 0 && governance)
  const { assetAccounts } = useGovernanceAssets()
  const [governedAccount, setGovernedAccount] = useState<
    ProgramAccount<Governance> | undefined
  >(undefined)
  const [formErrors, setFormErrors] = useState({})
  const { handleSetInstructions } = useContext(NewProposalContext)
  const handleSetForm = ({ propertyName, value }) => {
    setFormErrors({})
    setForm({ ...form, [propertyName]: value })
  }
  console.log(shouldBeGoverned, assetAccounts, formErrors, handleSetForm)
  const schema = useMemo(getDualFinanceDelegateWithdrawSchema, [])
  useEffect(() => {
    function getInstruction(): Promise<UiInstruction> {
      return getDelegateWithdrawInstruction({
        connection,
        form,
        schema,
        setFormErrors,
        wallet,
      })
    }
    handleSetInstructions(
      { governedAccount: governedAccount, getInstruction },
      index
    )
  }, [
    form,
    governedAccount,
    handleSetInstructions,
    index,
    connection,
    schema,
    wallet,
  ])
  useEffect(() => {
    setGovernedAccount(form.delegateToken?.governance)
  }, [form.delegateToken?.governance])

  // TODO: Include this in the config instruction which can optionally be done
  // if the project doesnt need to change where the tokens get returned to.
  return (
    <>
      {/* <Input
        label="Realm"
        value={form.realm}
        type="text"
        onChange={(evt) =>
          handleSetForm({
            value: evt.target.value,
            propertyName: 'realm',
          })
        }
        error={formErrors['realm']}
      />
      <Tooltip content="Token to be delegated.">
        <GovernedAccountSelect
          label="Delegate Token"
          governedAccounts={assetAccounts}
          onChange={(value) => {
            handleSetForm({ value, propertyName: 'delegateToken' })
          }}
          value={form.delegateToken}
          error={formErrors['delegateToken']}
          shouldBeGoverned={shouldBeGoverned}
          governance={governance}
          type="token"
        ></GovernedAccountSelect>
      </Tooltip> */}
      <div>Not implemented</div>
    </>
  )
}

export default DualVoteDepositWithdraw
