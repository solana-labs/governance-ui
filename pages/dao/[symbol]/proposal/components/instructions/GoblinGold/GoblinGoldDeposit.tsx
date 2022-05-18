/* eslint-disable @typescript-eslint/no-non-null-assertion */
import React, { useContext, useEffect, useState } from 'react'
// import BigNumber from 'bignumber.js'
import * as yup from 'yup'

import { BN } from '@project-serum/anchor'
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
import { isFormValid } from '@utils/formValidation'
import { precision } from '@utils/formatting'
import {
  GoblinGoldDepositForm,
  UiInstruction,
} from '@utils/uiTypes/proposalCreationTypes'
import useWalletStore from 'stores/useWalletStore'
import { NewProposalContext } from '../../../new'
import GovernedAccountSelect from '../../GovernedAccountSelect'
import useGovernanceAssets from '@hooks/useGovernanceAssets'
import { getGoblinGoldDepositInstruction } from '@utils/instructions/GoblinGold'

export type GoblinGoldVault = {
  name: string
  tokenInput: string
  tvl: BN
  supply: BN
  apy: string
  apr: string
  aboutTxt: string
  protocolsTxt: string
  risksTxt: string

  // todo
  id: string
  type: string
}

const GoblinGoldDeposit = ({
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
  const shouldBeGoverned = index !== 0 && governance
  const programId: PublicKey | undefined = realmInfo?.programId

  const [form, setForm] = useState<GoblinGoldDepositForm>({
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

  const [goblinGoldVaults, setGoblinGoldVaults] = useState<GoblinGoldVault[]>(
    []
  )

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
    return await getGoblinGoldDepositInstruction({
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
    // call for the mainnet friktion volts
    const callfriktionRequest = async () => {
      //   const response = await fetch(
      //     'https://friktion-labs.github.io/mainnet-tvl-snapshots/friktionSnapshot.json'
      //   )
      //   const parsedResponse = (await response.json()) as GoblinGoldVaults
      //   setGoblinGoldVaults(parsedResponse as GoblinGoldVaults[])
      const solanaStrategyBestAPY: GoblinGoldVault = {
        name: 'Best APY',
        tokenInput: 'SOL',
        tvl: new BN(0),
        supply: new BN(0),
        apy: '0',
        apr: '0',
        aboutTxt:
          'This strategy automatically rebalances between different lending protocols in order to get the maximum yield in each period.',
        protocolsTxt: 'Mango, Port, Tulip, Solend and Francium',
        risksTxt:
          'The protocols being used underneath (although being audited) present some risks. No audit has been done for the current strategy. Use it at your own risk.',
        id: '5NRMCHoJtq5vNgxmNgDzAqroKxDWM6mmE8HQnt7p4yLM',
        type: 'bestApy',
      }
      const usdcStrategyBestAPY: GoblinGoldVault = {
        name: 'Best APY',
        tokenInput: 'USDC',
        tvl: new BN(0),
        supply: new BN(0),
        apy: '0',
        apr: '0',
        aboutTxt:
          'This strategy automatically rebalances between different lending protocols in order to get the maximum yield in each period.',
        protocolsTxt: 'Mango, Port, Tulip, Solend and Francium',
        risksTxt:
          'The protocols being used underneath (although being audited) present some risks. No audit has been done for the current strategy. Use it at your own risk.',
        id: 'HAYwz6cHGuGAvLNifqGypH4mzv8fF5wv9SvcYLRGd18Q',
        type: 'bestApy',
      }
      const vaults = [solanaStrategyBestAPY, usdcStrategyBestAPY]
      setGoblinGoldVaults(vaults)
    }

    callfriktionRequest()
  }, [])

  useEffect(() => {
    handleSetForm({
      propertyName: 'programId',
      value: programId?.toString(),
    })
  }, [programId])

  useEffect(() => {
    handleSetInstructions(
      { governedAccount: governedAccount, getInstruction },
      index
    )
  }, [form])

  useEffect(() => {
    setGovernedAccount(form.governedTokenAccount?.governance)
    setMintInfo(form.governedTokenAccount?.extensions.mint?.account)
  }, [form.governedTokenAccount])

  const schema = yup.object().shape({
    governedTokenAccount: yup
      .object()
      .nullable()
      .required('Governed account is required'),
    goblinGoldVaultId: yup.string().required('Vault ID is required'),
    amount: yup
      .number()
      .moreThan(0, 'Amount should be more than 0')
      .required('Amount is required'),
  })

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
              <div className="mb-2">{`Vault #${vault.type} - ${vault.tokenInput}`}</div>
              <div className="space-y-0.5 text-xs text-fgd-3">
                <div className="flex items-center">
                  Deposit Token: {vault.tokenInput}
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

export default GoblinGoldDeposit
