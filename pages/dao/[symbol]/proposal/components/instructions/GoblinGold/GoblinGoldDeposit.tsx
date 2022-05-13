/* eslint-disable @typescript-eslint/no-non-null-assertion */
import React, { useContext, useEffect, useState } from 'react'
import BigNumber from 'bignumber.js'
import * as yup from 'yup'

import { BN } from '@project-serum/anchor'
import {
  Governance,
  ProgramAccount,
  serializeInstructionToBase64,
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
import { GoblinGoldVaults } from '@goblingold/goblingold-sdk'

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
    governedTokenAccount: undefined,
    goblinGoldVaultId: '',
    uiAmount: undefined,
    mintName: undefined,
    mintInfo: undefined,
  })
  const [formErrors, setFormErrors] = useState({})
  const { handleSetInstructions } = useContext(NewProposalContext)

  const [goblinGoldVaults, setGoblinGoldVaults] = useState<
    VaultConfig<DeploymentEnvs>[] | null
  >(null)

  const mintMinAmount = form.mintInfo
    ? getMintMinAmountAsDecimal(form.mintInfo)
    : 1

  const currentPrecision = precision(mintMinAmount)

  const handleSetForm = ({ propertyName, value }) => {
    setFormErrors({})
    setForm({ ...form, [propertyName]: value })
  }

  const validateInstruction = async (): Promise<boolean> => {
    const { isValid, validationErrors } = await isFormValid(schema, form)
    setFormErrors(validationErrors)
    return isValid
  }

  async function getInstruction(): Promise<UiInstruction> {
    const isValid = await validateInstruction()

    if (
      !connection ||
      !isValid ||
      !programId ||
      !form.governedTokenAccount?.governance?.account ||
      !wallet?.publicKey ||
      !form.mintName
    ) {
      return {
        serializedInstruction: '',
        isValid: false,
        governance: form.governedTokenAccount?.governance,
      }
    }

    const tx = await depositGoblinGold({
      obligationOwner: form.governedTokenAccount.governance.pubkey,
      liquidityAmount: new BN(new BigNumber(form.uiAmount).toString()),
      mintName: form.mintName,
    })

    return {
      serializedInstruction: serializeInstructionToBase64(tx),
      isValid: true,
      governance: form.governedTokenAccount.governance,
    }
  }

  const setAmount = (event) => {
    const value = event.target.value
    handleSetForm({
      value: value,
      propertyName: 'amount',
    })
  }

  const validateAmountOnBlur = () => {
    const value = form.uiAmount

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
      const response = await fetch(
        'https://friktion-labs.github.io/mainnet-tvl-snapshots/friktionSnapshot.json'
      )
      const parsedResponse = (await response.json()) as GoblinGoldVaults
      setGoblinGoldVaults(parsedResponse as GoblinGoldVaults[])
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
      {
        governedAccount: form.governedTokenAccount?.governance,
        getInstruction,
      },
      index
    )
  }, [form])

  const schema = yup.object().shape({
    governedAccount: yup
      .object()
      .nullable()
      .required('Governed account is required'),
    mintName: yup.string().required('Token Name is required'),
    uiAmount: yup
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
        {goblinGoldVaults
          ?.filter((x) => !x.isInCircuits)
          .map((value) => (
            <Select.Option key={value.vaultId} value={value.vaultId}>
              <div className="break-all text-fgd-1 ">
                <div className="mb-2">{`Vault #${value.vaultType} - ${value.underlyingTokenSymbol} - APY: ${value.apy}%`}</div>
                <div className="space-y-0.5 text-xs text-fgd-3">
                  <div className="flex items-center">
                    Deposit Token: {value.depositTokenSymbol}
                  </div>
                  {/* <div>Capacity: {}</div> */}
                </div>
              </div>
            </Select.Option>
          ))}
      </Select>
      <Input
        min={mintMinAmount}
        label="Amount"
        value={form.uiAmount}
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
