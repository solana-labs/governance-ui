/* eslint-disable @typescript-eslint/no-non-null-assertion */
import React, { useContext, useEffect, useState } from 'react'
import { ProgramAccount, Governance } from '@solana/spl-governance'
import {
  UiInstruction,
  DualFinanceStakingOptionForm,
} from '@utils/uiTypes/proposalCreationTypes'
import { NewProposalContext } from '../../../new'
import GovernedAccountSelect from '../../GovernedAccountSelect'
import useGovernanceAssets from '@hooks/useGovernanceAssets'
import Input from '@components/inputs/Input'
import { getConfigInstruction } from '@utils/instructions/Dual'
import { getDualFinanceStakingOptionSchema } from '@utils/validations'
import Tooltip from '@components/Tooltip'
import useWalletOnePointOh from '@hooks/useWalletOnePointOh'
import useLegacyConnectionContext from '@hooks/useLegacyConnectionContext'

const StakingOption = ({
  index,
  governance,
}: {
  index: number
  governance: ProgramAccount<Governance> | null
}) => {
  const [form, setForm] = useState<DualFinanceStakingOptionForm>({
    soName: undefined,
    optionExpirationUnixSeconds: 0,
    numTokens: 0,
    lotSize: 0,
    baseTreasury: undefined,
    quoteTreasury: undefined,
    payer: undefined,
    userPk: undefined,
    strike: 0,
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
  const schema = getDualFinanceStakingOptionSchema()
  useEffect(() => {
    function getInstruction(): Promise<UiInstruction> {
      return getConfigInstruction({
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
    setGovernedAccount(form.baseTreasury?.governance)
  }, [form.baseTreasury])

  return (
    <>
      <Tooltip content="Custom name to identify the Staking Option">
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
      <Tooltip content="Treasury owned account providing the assets for the option. When the recipient exercises, these are the tokens they receive. For SOL/USDC Calls, enter SOL. For SOL/USDC Puts, enter USDC.">
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
      <Tooltip content="Treasury owned account receiving payment for the option exercise. This is where payments from exercise accumulate. For SOL/USDC Calls, enter USDC. For SOL/USDC Puts, enter SOL.">
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
      <Tooltip content="How many tokens are in the staking options. Units are in atoms of the base token.">
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
      <Tooltip content="Date in unix seconds for option expiration">
        <Input
          label="Expiration"
          value={form.optionExpirationUnixSeconds}
          type="number"
          onChange={(evt) =>
            handleSetForm({
              value: evt.target.value,
              propertyName: 'optionExpirationUnixSeconds',
            })
          }
          error={formErrors['optionExpirationUnixSeconds']}
        />
      </Tooltip>
      <Tooltip content="Strike price for the staking option. Units are quote atoms per lot. So if it is a SOL/USDC put with a lot size of 1 USDC, then this is lamports per USDC.">
        <Input
          label="Strike"
          value={form.strike}
          type="number"
          onChange={(evt) =>
            handleSetForm({
              value: evt.target.value,
              propertyName: 'strike',
            })
          }
          error={formErrors['strike']}
        />
      </Tooltip>
      <Tooltip content="Lot size for base atoms. This is the min size of an option.">
        <Input
          label="Lot Size"
          value={form.lotSize}
          type="number"
          onChange={(evt) =>
            handleSetForm({
              value: evt.target.value,
              propertyName: 'lotSize',
            })
          }
          error={formErrors['lotSize']}
        />
      </Tooltip>
      <Tooltip content="Rent payer. Should be the governance wallet with same governance as base treasury">
        <GovernedAccountSelect
          label="Payer Account"
          governedAccounts={assetAccounts.filter(
            (x) =>
              x.isSol &&
              form.baseTreasury?.governance &&
              x.governance.pubkey.equals(form.baseTreasury.governance.pubkey)
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
      <Tooltip content="Recipient (Wallet address) of the staking options">
        <Input
          label="Recipient Public Key"
          value={form.userPk}
          type="text"
          onChange={(evt) =>
            handleSetForm({
              value: evt.target.value,
              propertyName: 'userPk',
            })
          }
          error={formErrors['userPk']}
        />
      </Tooltip>
    </>
  )
}

export default StakingOption
