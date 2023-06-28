/* eslint-disable @typescript-eslint/no-non-null-assertion */
import React, { useContext, useEffect, useState } from 'react'
import { ProgramAccount, Governance } from '@solana/spl-governance'
import {
  UiInstruction,
  DualFinanceDelegateForm,
} from '@utils/uiTypes/proposalCreationTypes'
import { NewProposalContext } from '../../../new'
import GovernedAccountSelect from '../../GovernedAccountSelect'
import useGovernanceAssets from '@hooks/useGovernanceAssets'
import Input from '@components/inputs/Input'
import { getDelegateInstruction } from '@utils/instructions/Dual/delegate'
import { getDualFinanceDelegateSchema } from '@utils/validations'
import Tooltip from '@components/Tooltip'
import useWalletOnePointOh from '@hooks/useWalletOnePointOh'
import useLegacyConnectionContext from '@hooks/useLegacyConnectionContext'

const DualDelegate = ({
  index,
  governance,
}: {
  index: number
  governance: ProgramAccount<Governance> | null
}) => {
  const [form, setForm] = useState<DualFinanceDelegateForm>({
    delegateAccount: undefined,
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
  const schema = getDualFinanceDelegateSchema()
  useEffect(() => {
    function getInstruction(): Promise<UiInstruction> {
      return getDelegateInstruction({
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
      <Tooltip content="Account to Delegate Votes">
        <Input
          label="Delegate Account"
          value={form.delegateAccount}
          type="text"
          onChange={(evt) =>
            handleSetForm({
              value: evt.target.value,
              propertyName: 'delegateAccount',
            })
          }
          error={formErrors['delegateAccount']}
        />
      </Tooltip>
      <Input
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
      </Tooltip>
    </>
  )
}

export default DualDelegate
