import React, { useContext, useEffect, useState } from 'react'
import { ProgramAccount, Governance } from '@solana/spl-governance'
import {
  UiInstruction,
  DualFinanceAirdropForm,
} from '@utils/uiTypes/proposalCreationTypes'
import { NewProposalContext } from '../../../new'
import GovernedAccountSelect from '../../GovernedAccountSelect'
import useGovernanceAssets from '@hooks/useGovernanceAssets'
import Input from '@components/inputs/Input'
import { getAirdropInstruction } from '@utils/instructions/Dual/airdrop'
import useWalletStore from 'stores/useWalletStore'
import { getDualFinanceAirdropSchema } from '@utils/validations'
import Tooltip from '@components/Tooltip'

const DualAirdrop = ({
  index,
  governance,
}: {
  index: number
  governance: ProgramAccount<Governance> | null
}) => {
  const [form, setForm] = useState<DualFinanceAirdropForm>({
    root: '',
    amount: 0,
    treasury: undefined,
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
    return getAirdropInstruction({
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
    setGovernedAccount(form.treasury?.governance)
  }, [form.treasury])
  const schema = getDualFinanceAirdropSchema()

  return (
    <>
      <Tooltip content="Merkle root of the airdrop. https://github.com/Dual-Finance/airdrop-sdk/blob/97d97492bdb926f150a6436a68a77eda35fc7095/src/utils/balance_tree.ts#L40">
      <Input
        label="Root"
        value={form.root}
        type="text"
        onChange={(evt) =>
          handleSetForm({
            value: evt.target.value,
            propertyName: 'root',
          })
        }
        error={formErrors['root']}
      />
     </Tooltip>
      <Input
        label="Total number of tokens"
        value={form.amount}
        type="text"
        onChange={(evt) =>
          handleSetForm({
            value: evt.target.value,
            propertyName: 'amount',
          })
        }
        error={formErrors['amount']}
      />
      <GovernedAccountSelect
        label="Treasury"
        governedAccounts={assetAccounts}
        onChange={(value) => {
          handleSetForm({ value, propertyName: 'treasury' })
        }}
        value={form.treasury}
        error={formErrors['treasury']}
        shouldBeGoverned={shouldBeGoverned}
        governance={governance}
        type="token"
      ></GovernedAccountSelect>
    </>
  )
}

export default DualAirdrop
