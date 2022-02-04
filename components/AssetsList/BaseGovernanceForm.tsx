import Input from '@components/inputs/Input'
import AmountSlider from '@components/Slider'
import useRealm from '@hooks/useRealm'
import {
  fmtPercentage,
  getMintMinAmountAsDecimal,
  getMintNaturalAmountFromDecimal,
  getMintSupplyFractionAsDecimalPercentage,
  getMintSupplyPercentageAsDecimal,
  parseMintNaturalAmountFromDecimal,
} from '@tools/sdk/units'
import BigNumber from 'bignumber.js'
import React, { useEffect, useState } from 'react'

export interface BaseGovernanceFormFields {
  minCommunityTokensToCreateProposal: number
  minInstructionHoldUpTime: number
  maxVotingTime: number
  voteThreshold: number
}

const BaseGovernanceForm = ({ formErrors, form, setForm, setFormErrors }) => {
  const { realmInfo, mint: realmMint } = useRealm()
  const [minTokensPercentage, setMinTokensPercentage] = useState<
    number | undefined
  >()

  const handleSetForm = ({ propertyName, value }) => {
    setFormErrors({})
    setForm({ ...form, [propertyName]: value })
  }
  const validateMinMax = (e) => {
    const fieldName = e.target.name
    const min = e.target.min || 0
    const max = e.target.max || Number.MAX_SAFE_INTEGER
    const value = form[fieldName]
    const currentPrecision = new BigNumber(min).decimalPlaces()

    handleSetForm({
      value: parseFloat(
        Math.max(Number(min), Math.min(Number(max), Number(value))).toFixed(
          currentPrecision
        )
      ),
      propertyName: fieldName,
    })
  }
  function parseMinTokensToCreateProposal(
    value: string | number,
    mintDecimals: number
  ) {
    return typeof value === 'string'
      ? parseMintNaturalAmountFromDecimal(value, mintDecimals)
      : getMintNaturalAmountFromDecimal(value, mintDecimals)
  }
  const onMinTokensChange = (minTokensToCreateProposal: number | string) => {
    const minTokens = realmMint
      ? parseMinTokensToCreateProposal(
          minTokensToCreateProposal,
          realmMint.decimals
        )
      : 0
    setMinTokensPercentage(getMinTokensPercentage(minTokens))
  }
  const getMinTokensPercentage = (amount: number) =>
    realmMint ? getMintSupplyFractionAsDecimalPercentage(realmMint, amount) : 0

  // Use 1% of mint supply as the default value for minTokensToCreateProposal and the default increment step in the input editor
  const mintSupply1Percent = realmMint
    ? getMintSupplyPercentageAsDecimal(realmMint, 1)
    : 100
  const minTokenAmount = realmMint
    ? getMintMinAmountAsDecimal(realmMint)
    : 0.0001
  // If the supply is small and 1% is below the minimum mint amount then coerce to the minimum value
  const minTokenStep = Math.max(mintSupply1Percent, minTokenAmount)

  const getSupplyPercent = () => {
    const hasMinTokensPercentage =
      !!minTokensPercentage && !isNaN(minTokensPercentage)
    const percent =
      hasMinTokensPercentage && minTokensPercentage
        ? fmtPercentage(minTokensPercentage)
        : ''
    return hasMinTokensPercentage && <div>{`${percent} of token supply`}</div>
  }

  useEffect(() => {
    onMinTokensChange(form.minCommunityTokensToCreateProposal)
  }, [form.minCommunityTokensToCreateProposal, realmInfo?.symbol])

  return (
    <>
      <Input
        label="Min community tokens to create proposal"
        value={form.minCommunityTokensToCreateProposal}
        type="number"
        name="minCommunityTokensToCreateProposal"
        min={minTokenAmount}
        step={minTokenStep}
        onBlur={validateMinMax}
        onChange={(evt) =>
          handleSetForm({
            value: evt.target.value,
            propertyName: 'minCommunityTokensToCreateProposal',
          })
        }
        error={formErrors['minCommunityTokensToCreateProposal']}
      />
      {getSupplyPercent()}
      <Input
        label="min instruction hold up time (days)"
        value={form.minInstructionHoldUpTime}
        type="number"
        min={0.01}
        name="minInstructionHoldUpTime"
        onBlur={validateMinMax}
        onChange={(evt) =>
          handleSetForm({
            value: evt.target.value,
            propertyName: 'minInstructionHoldUpTime',
          })
        }
        error={formErrors['minInstructionHoldUpTime']}
      />
      <Input
        label="Max voting time (days)"
        value={form.maxVotingTime}
        name="maxVotingTime"
        type="number"
        min={0.01}
        onBlur={validateMinMax}
        onChange={(evt) =>
          handleSetForm({
            value: evt.target.value,
            propertyName: 'maxVotingTime',
          })
        }
        error={formErrors['maxVotingTime']}
      />
      <Input
        label="Yes vote threshold (%)"
        value={form.voteThreshold}
        max={100}
        min={1}
        name="voteThreshold"
        type="number"
        onBlur={validateMinMax}
        onChange={(evt) =>
          handleSetForm({
            value: evt.target.value,
            propertyName: 'voteThreshold',
          })
        }
        error={formErrors['voteThreshold']}
      />
      <div className="pb-5 max-w-lg">
        <AmountSlider
          step={1}
          value={form.voteThreshold}
          disabled={false}
          onChange={($e) => {
            handleSetForm({
              value: $e,
              propertyName: 'voteThreshold',
            })
          }}
        />
      </div>
    </>
  )
}

export default BaseGovernanceForm
