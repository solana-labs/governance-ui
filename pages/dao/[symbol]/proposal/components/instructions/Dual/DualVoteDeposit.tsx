/* eslint-disable @typescript-eslint/no-non-null-assertion */
import React, { useContext, useEffect, useState } from 'react'
import { ProgramAccount, Governance } from '@solana/spl-governance'
import {
  UiInstruction,
  DualFinanceVoteDepositForm,
} from '@utils/uiTypes/proposalCreationTypes'
import { NewProposalContext } from '../../../new'
import GovernedAccountSelect from '../../GovernedAccountSelect'
import useGovernanceAssets from '@hooks/useGovernanceAssets'
import Input from '@components/inputs/Input'
import { getVoteDepositInstruction } from '@utils/instructions/Dual/delegate'
import { getDualFinanceVoteDepositSchema } from '@utils/validations'
import Tooltip from '@components/Tooltip'
import useWalletOnePointOh from '@hooks/useWalletOnePointOh'
import useLegacyConnectionContext from '@hooks/useLegacyConnectionContext'

const DualVoteDeposit = ({
  index,
  governance,
}: {
  index: number
  governance: ProgramAccount<Governance> | null
}) => {
  const [form, setForm] = useState<DualFinanceVoteDepositForm>({
    numTokens: 0,
    payer: undefined,
    mintPk: undefined,
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
  const schema = getDualFinanceVoteDepositSchema()
  useEffect(() => {
    function getInstruction(): Promise<UiInstruction> {
      return getVoteDepositInstruction({
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
    handleSetForm({ value: undefined, propertyName: 'mintPk' })
  }, [form.payer])
  useEffect(() => {
    setGovernedAccount(form.payer?.governance)
  }, [form.payer])

  // TODO: Include this in the config instruction which can optionally be done
  // if the project doesnt need to change where the tokens get returned to.
  return (
    <>
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
      <Tooltip content="Rent payer. Should be the governance wallet with same governance as base treasury">
        <GovernedAccountSelect
          label="Payer Account"
          governedAccounts={assetAccounts.filter(
            (x) =>
              x.isSol &&
              form.payer?.governance &&
              x.governance.pubkey.equals(form.payer.governance.pubkey)
          )}
          onChange={(value) => {
            handleSetForm({ value, propertyName: 'payer' })
          }}
          value={form.payer}
          error={formErrors['payer']}
          shouldBeGoverned={shouldBeGoverned}
          governance={governance}
        ></GovernedAccountSelect>
      </Tooltip>
      <Input
          label="Mint"
          value={form.mintPk}
          type="text"
          onChange={(evt) =>
            handleSetForm({
              value: evt.target.value,
              propertyName: 'mintPk',
            })
          }
          error={formErrors['mintPk']}
        />
    </>
  )
}

export default DualVoteDeposit
