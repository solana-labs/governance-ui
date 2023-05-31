/* eslint-disable @typescript-eslint/no-non-null-assertion */
import React, { useContext, useEffect, useState } from 'react'
import {
  Governance,
  ProgramAccount,
  //   serializeInstructionToBase64,
} from '@solana/spl-governance'
import { getMintMinAmountAsDecimal } from '@tools/sdk/units'
import { PublicKey } from '@solana/web3.js'
import Input from '@components/inputs/Input'
import Select from '@components/inputs/Select'
import useRealm from '@hooks/useRealm'
import { precision } from '@utils/formatting'
import {
  GoblinGoldWithdrawForm,
  UiInstruction,
} from '@utils/uiTypes/proposalCreationTypes'
import { NewProposalContext } from '../../../new'
import GovernedAccountSelect from '../../GovernedAccountSelect'
import useGovernanceAssets from '@hooks/useGovernanceAssets'
import { getGoblinGoldWithdrawInstruction } from '@utils/instructions/GoblinGold'
import { StrategyVault } from 'goblingold-sdk'
import { getGoblinGoldWithdrawSchema } from '@utils/validations'
import useWalletOnePointOh from '@hooks/useWalletOnePointOh'
import useLegacyConnectionContext from '@hooks/useLegacyConnectionContext'

const GoblinGoldWithdraw = ({
  index,
  governance,
}: {
  index: number
  governance: ProgramAccount<Governance> | null
}) => {
  const connection = useLegacyConnectionContext()
  const wallet = useWalletOnePointOh()
  const { realmInfo } = useRealm()
  const { governedTokenAccountsWithoutNfts } = useGovernanceAssets()
  const shouldBeGoverned = !!(index !== 0 && governance)
  const programId: PublicKey | undefined = realmInfo?.programId

  const [form, setForm] = useState<GoblinGoldWithdrawForm>({
    amount: undefined,
    governedTokenAccount: undefined,
    goblinGoldVaultId: '',
    mintInfo: undefined,
  })
  const [governedAccount, setGovernedAccount] = useState<
    ProgramAccount<Governance> | undefined
  >(undefined)
  const [formErrors, setFormErrors] = useState({})
  const { handleSetInstructions } = useContext(NewProposalContext)

  const [goblinGoldVaults, setGoblinGoldVaults] = useState<StrategyVault[]>([])

  const mintMinAmount = form.mintInfo
    ? getMintMinAmountAsDecimal(form.mintInfo)
    : 1

  const currentPrecision = precision(mintMinAmount)

  const handleSetForm = ({ propertyName, value }) => {
    setFormErrors({})
    setForm({ ...form, [propertyName]: value })
  }

  const setMintInfo = (value) => {
    setForm({ ...form, mintInfo: value })
  }

  async function getInstruction(): Promise<UiInstruction> {
    return await getGoblinGoldWithdrawInstruction({
      schema,
      form,
      amount: form.amount ?? 0,
      programId,
      connection,
      wallet,
      setFormErrors,
    })
  }

  const setAmount = (event) => {
    const value = event.target.value
    handleSetForm({
      value: value,
      propertyName: 'amount',
    })
  }

  const validateAmountOnBlur = () => {
    const value = form.amount

    handleSetForm({
      value: parseFloat(
        Math.max(
          Number(mintMinAmount),
          Math.min(Number(Number.MAX_SAFE_INTEGER), Number(value))
        ).toFixed(currentPrecision)
      ),
      propertyName: 'amount',
    })
  }

  useEffect(() => {
    // call for the mainnet vaults
    const fetchVaults = async () => {
      const response = await fetch('https://data.goblin.gold:7766/vaults')
      const parsedResponse = (await response.json()) as StrategyVault[]
      setGoblinGoldVaults(parsedResponse as StrategyVault[])
    }

    fetchVaults()
  }, [])

  useEffect(() => {
    handleSetForm({
      propertyName: 'programId',
      value: programId?.toString(),
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps -- TODO please fix, it can cause difficult bugs. You might wanna check out https://bobbyhadz.com/blog/react-hooks-exhaustive-deps for info. -@asktree
  }, [programId])

  useEffect(() => {
    handleSetInstructions(
      { governedAccount: governedAccount, getInstruction },
      index
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps -- TODO please fix, it can cause difficult bugs. You might wanna check out https://bobbyhadz.com/blog/react-hooks-exhaustive-deps for info. -@asktree
  }, [form])

  useEffect(() => {
    setGovernedAccount(form.governedTokenAccount?.governance)
    setMintInfo(form.governedTokenAccount?.extensions.mint?.account)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- TODO please fix, it can cause difficult bugs. You might wanna check out https://bobbyhadz.com/blog/react-hooks-exhaustive-deps for info. -@asktree
  }, [form.governedTokenAccount])

  const schema = getGoblinGoldWithdrawSchema()

  return (
    <React.Fragment>
      <GovernedAccountSelect
        label="Source account"
        governedAccounts={governedTokenAccountsWithoutNfts}
        onChange={(value) => {
          handleSetForm({ value, propertyName: 'governedTokenAccount' })
        }}
        value={form.governedTokenAccount}
        error={formErrors['governedTokenAccount']}
        shouldBeGoverned={shouldBeGoverned}
        governance={governance}
        type="token"
      />

      <Select
        label="GoblinGold Vault Destination"
        value={form.goblinGoldVaultId}
        placeholder="Please select..."
        onChange={(value) =>
          handleSetForm({ value, propertyName: 'goblinGoldVaultId' })
        }
        error={formErrors['goblinGoldVaultId']}
      >
        {goblinGoldVaults.map((vault) => (
          <Select.Option key={vault.id} value={vault.id}>
            <div className="break-all text-fgd-1 ">
              <div className="mb-2">{`Vault: ${vault.name} - ${vault.input.symbol}`}</div>
              <div className="space-y-0.5 text-xs text-fgd-3">
                <div className="flex items-center">
                  Withdraw Token: {vault.input.symbol}
                </div>
              </div>
            </div>
          </Select.Option>
        ))}
      </Select>
      <Input
        min={mintMinAmount}
        label="Amount"
        value={form.amount}
        type="number"
        onChange={setAmount}
        step={mintMinAmount}
        error={formErrors['amount']}
        onBlur={validateAmountOnBlur}
      />
    </React.Fragment>
  )
}

export default GoblinGoldWithdraw
