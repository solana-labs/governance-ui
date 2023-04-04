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
import {
  getGovernanceAirdropInstruction,
  getMerkleAirdropInstruction,
} from '@utils/instructions/Dual/airdrop'
import useWalletStore from 'stores/useWalletStore'
import {
  getDualFinanceGovernanceAirdropSchema,
  getDualFinanceMerkleAirdropSchema,
} from '@utils/validations'
import Tooltip from '@components/Tooltip'
import Select from '@components/inputs/Select'
import useWalletOnePointOh from '@hooks/useWalletOnePointOh'

const DualAirdrop = ({
  index,
  governance,
}: {
  index: number
  governance: ProgramAccount<Governance> | null
}) => {
  const [form, setForm] = useState<DualFinanceAirdropForm>({
    root: '',
    amountPerVoter: 0,
    eligibilityStart: 0,
    eligibilityEnd: 0,
    amount: 0,
    treasury: undefined,
  })
  const connection = useWalletStore((s) => s.connection)
  const wallet = useWalletOnePointOh()
  const shouldBeGoverned = !!(index !== 0 && governance)
  const { assetAccounts } = useGovernanceAssets()
  const [governedAccount, setGovernedAccount] = useState<
    ProgramAccount<Governance> | undefined
  >(undefined)
  const [airdropType, setAirdropType] = useState('Merkle Proof')
  const [formErrors, setFormErrors] = useState({})
  const { handleSetInstructions } = useContext(NewProposalContext)
  const handleSetForm = ({ propertyName, value }) => {
    setFormErrors({})
    setForm({ ...form, [propertyName]: value })
  }
  function getInstruction(): Promise<UiInstruction> {
    if (airdropType == 'Merkle Proof') {
      return getMerkleAirdropInstruction({
        connection,
        form,
        schema: merkleSchema,
        setFormErrors,
        wallet,
      })
    } else {
      return getGovernanceAirdropInstruction({
        connection,
        form,
        schema: governanceSchema,
        setFormErrors,
        wallet,
      })
    }
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

  const merkleSchema = getDualFinanceMerkleAirdropSchema()
  const governanceSchema = getDualFinanceGovernanceAirdropSchema()

  return (
    <>
      <Select
        onChange={(value) => {
          setAirdropType(value)
        }}
        label="Airdrop Type"
        placeholder="Airdrop Type"
        value={airdropType}
      >
        <Select.Option key="merkleOption" value="Merkle Proof">
          Merkle Proof
        </Select.Option>
        <Select.Option key="governanceOption" value="Governance">
          Governance
        </Select.Option>
      </Select>
      {airdropType == 'Merkle Proof' && (
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
      )}
      {airdropType == 'Governance' && (
        <>
          <Input
            label="Eligibility start unix timestamp"
            value={form.eligibilityStart}
            type="number"
            onChange={(evt) =>
              handleSetForm({
                value: evt.target.value,
                propertyName: 'eligibilityStart',
              })
            }
            error={formErrors['eligibilityStart']}
          />
          <Input
            label="Eligibility end unix timestamp"
            value={form.eligibilityEnd}
            type="number"
            onChange={(evt) =>
              handleSetForm({
                value: evt.target.value,
                propertyName: 'eligibilityEnd',
              })
            }
            error={formErrors['eligibilityEnd']}
          />
          <Input
            label="Amount per voter"
            value={form.amountPerVoter}
            type="number"
            onChange={(evt) =>
              handleSetForm({
                value: evt.target.value,
                propertyName: 'amountPerVoter',
              })
            }
            error={formErrors['amountPerVoter']}
          />
        </>
      )}
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
