/* eslint-disable @typescript-eslint/no-non-null-assertion */
import React, { useContext, useEffect, useState } from 'react'
import { ProgramAccount, Governance } from '@solana/spl-governance'
import {
  UiInstruction,
  DualFinanceExerciseForm,
} from '@utils/uiTypes/proposalCreationTypes'
import { NewProposalContext } from '../../../new'
import GovernedAccountSelect from '../../GovernedAccountSelect'
import useGovernanceAssets from '@hooks/useGovernanceAssets'
import Input from '@components/inputs/Input'
import { getExerciseInstruction } from '@utils/instructions/Dual'
import useWalletStore from 'stores/useWalletStore'
import { getDualFinanceExerciseSchema } from '@utils/validations'
import Tooltip from '@components/Tooltip'

const DualExercise = ({
  index,
  governance,
}: {
  index: number
  governance: ProgramAccount<Governance> | null
}) => {
  const [form, setForm] = useState<DualFinanceExerciseForm>({
    numTokens: 0,
    soName: undefined,
    baseTreasury: undefined,
    quoteTreasury: undefined,
    optionAccount: undefined,
  })
  const connection = useWalletStore((s) => s.connection)
  const wallet = useWalletStore((s) => s.current)
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
  function getInstruction(): Promise<UiInstruction> {
    return getExerciseInstruction({
      connection,
      form,
      schema,
      setFormErrors,
      wallet,
    })
  }
  useEffect(() => {
    handleSetInstructions(
      { governedAccount: governedAccount, getInstruction },
      index
    )
  }, [form])
  useEffect(() => {
    setGovernedAccount(form.baseTreasury?.governance)
  }, [form.baseTreasury])
  const schema = getDualFinanceExerciseSchema()

  // TODO: Find the name from metaplex from a token lookup once that is
  // connected to the program.
  return (
    <>
      <Tooltip content="Identifier for the Staking Option">
        <Input
          label="Name"
          value={form.soName}
          type="text"
          onChange={(evt) =>
            handleSetForm({
              value: evt.target.value,
              propertyName: 'soName',
            })
          }
          error={formErrors['soName']}
        />
      </Tooltip>
      <Tooltip content="Option token that will be exercised.">
        <GovernedAccountSelect
          label="Option Account"
          governedAccounts={assetAccounts}
          onChange={(value) => {
            handleSetForm({ value, propertyName: 'optionAccount' })
          }}
          value={form.optionAccount}
          error={formErrors['optionAccount']}
          shouldBeGoverned={shouldBeGoverned}
          governance={governance}
          type="token"
        ></GovernedAccountSelect>
      </Tooltip>
      <Tooltip content="Treasury owned account providing the payment for the option.">
        <GovernedAccountSelect
          label="Quote Treasury"
          governedAccounts={assetAccounts}
          onChange={(value) => {
            handleSetForm({ value, propertyName: 'quoteTreasury' })
          }}
          value={form.quoteTreasury}
          error={formErrors['quoteTreasury']}
          governance={governance}
          type="token"
        ></GovernedAccountSelect>
      </Tooltip>
      <Tooltip content="Treasury owned account receiving the option exercise.">
        <GovernedAccountSelect
          label="Base Treasury"
          governedAccounts={assetAccounts}
          onChange={(value) => {
            handleSetForm({ value, propertyName: 'baseTreasury' })
          }}
          value={form.baseTreasury}
          error={formErrors['baseTreasury']}
          governance={governance}
          type="token"
        ></GovernedAccountSelect>
      </Tooltip>
      <Tooltip content="How many option tokens are exercised staking options.">
        <Input
          label="Quantity"
          value={form.numTokens}
          type="number"
          onChange={(evt) =>
            handleSetForm({
              value: evt.target.value,
              propertyName: 'numTokens',
            })
          }
          error={formErrors['numTokens']}
        />
      </Tooltip>
    </>
  )
}

export default DualExercise
