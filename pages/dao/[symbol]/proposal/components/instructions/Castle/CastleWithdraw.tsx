import React, { useContext, useEffect, useState } from 'react'
import Input from '@components/inputs/Input'
import useRealm from '@hooks/useRealm'
import { getMintMinAmountAsDecimal } from '@tools/sdk/units'
import { PublicKey } from '@solana/web3.js'
import { precision } from '@utils/formatting'
import useWalletStore from 'stores/useWalletStore'
import {
  CastleWithdrawForm,
  UiInstruction,
} from '@utils/uiTypes/proposalCreationTypes'
import { NewProposalContext } from '../../../new'
import { getCastleWithdrawSchema } from '@utils/validations'
import useGovernanceAssets from '@hooks/useGovernanceAssets'
import { Governance } from '@solana/spl-governance'
import { ProgramAccount } from '@solana/spl-governance'
import GovernedAccountSelect from '../../GovernedAccountSelect'
import Select from '@components/inputs/Select'
import {
  VaultConfig,
  DeploymentEnvs,
  Clusters,
} from '@castlefinance/vault-core'
import {
  getCastleVaults,
  getCastleWithdrawInstruction,
} from '@utils/instructions/Castle'

const CastleWithdraw = ({
  index,
  governance,
}: {
  index: number
  governance: ProgramAccount<Governance> | null
}) => {
  const connection = useWalletStore((s) => s.connection)
  const wallet = useWalletStore((s) => s.current)
  const { realmInfo } = useRealm()
  const { governedTokenAccountsWithoutNfts } = useGovernanceAssets()
  const shouldBeGoverned = !!(index !== 0 && governance)
  const programId: PublicKey | undefined = realmInfo?.programId

  // Store CastleWithdrawForm state
  const [form, setForm] = useState<CastleWithdrawForm>({
    amount: undefined,
    governedTokenAccount: undefined,
    castleVaultId: '',
    programId: programId?.toString(),
    mintInfo: undefined,
  })

  const [castleVaults, setCastleVaults] = useState<
    VaultConfig<DeploymentEnvs>[] | null
  >(null)

  const [governedAccount, setGovernedAccount] = useState<
    ProgramAccount<Governance> | undefined
  >(undefined)

  const [formErrors, setFormErrors] = useState({})

  const mintMinAmount = form.mintInfo
    ? getMintMinAmountAsDecimal(form.mintInfo)
    : 1

  const currentPrecision = precision(mintMinAmount)
  const { handleSetInstructions } = useContext(NewProposalContext)

  const handleSetForm = ({ propertyName, value }) => {
    setFormErrors({})
    setForm({ ...form, [propertyName]: value })
  }

  const setMintInfo = (value) => {
    setForm({ ...form, mintInfo: value })
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

  async function getInstruction(): Promise<UiInstruction> {
    return await getCastleWithdrawInstruction({
      schema,
      form,
      amount: form.amount ?? 0,
      programId,
      connection,
      wallet,
      setFormErrors,
    })
  }

  // Grab Castle vault information from config server
  useEffect(() => {
    const getCastleConfig = async () => {
      const vaults = (await getCastleVaults()).filter((v) =>
        connection.cluster == 'mainnet'
          ? v.cluster == Clusters.mainnetBeta
          : v.cluster == Clusters.devnet
      )
      setCastleVaults(vaults)
    }
    getCastleConfig()
    // eslint-disable-next-line react-hooks/exhaustive-deps -- TODO please fix, it can cause difficult bugs. You might wanna check out https://bobbyhadz.com/blog/react-hooks-exhaustive-deps for info. -@asktree
  }, [])

  useEffect(() => {
    handleSetForm({
      propertyName: 'programId',
      value: programId?.toString(),
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps -- TODO please fix, it can cause difficult bugs. You might wanna check out https://bobbyhadz.com/blog/react-hooks-exhaustive-deps for info. -@asktree
  }, [realmInfo?.programId])

  useEffect(() => {
    if (wallet) {
      handleSetInstructions(
        { governedAccount: governedAccount, getInstruction },
        index
      )
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- TODO please fix, it can cause difficult bugs. You might wanna check out https://bobbyhadz.com/blog/react-hooks-exhaustive-deps for info. -@asktree
  }, [form])

  useEffect(() => {
    setGovernedAccount(form.governedTokenAccount?.governance)
    setMintInfo(form.governedTokenAccount?.extensions.mint?.account)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- TODO please fix, it can cause difficult bugs. You might wanna check out https://bobbyhadz.com/blog/react-hooks-exhaustive-deps for info. -@asktree
  }, [form.governedTokenAccount])

  const schema = getCastleWithdrawSchema()

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
        label="Castle Vault Destination"
        value={form.castleVaultId}
        placeholder="Please select..."
        onChange={(value) =>
          handleSetForm({ value, propertyName: 'castleVaultId' })
        }
        error={formErrors['castleVaultId']}
      >
        {castleVaults?.map((value) => (
          <Select.Option key={value.vault_id} value={value.vault_id}>
            <div className="break-all text-fgd-1 ">
              <div className="mb-2">{`Vault: ${value.name}`}</div>
              <div className="space-y-0.5 text-xs text-fgd-3">
                <div className="flex items-center">
                  Deposit Token: {value.token_mint}
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

export default CastleWithdraw
