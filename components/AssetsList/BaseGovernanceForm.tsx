import Input from '@components/inputs/Input'
import Select from '@components/inputs/Select'
import AmountSlider from '@components/Slider'
import Switch from '@components/Switch'
import useRealm from '@hooks/useRealm'
import {
  GovernanceConfig,
  VoteThreshold,
  VoteThresholdType,
  VoteTipping,
} from '@solana/spl-governance'
import { DISABLED_VOTER_WEIGHT } from '@tools/constants'
import {
  fmtPercentage,
  getDaysFromTimestamp,
  getMintMinAmountAsDecimal,
  getMintNaturalAmountFromDecimal,
  getMintSupplyFractionAsDecimalPercentage,
  getMintSupplyPercentageAsDecimal,
  getTimestampFromDays,
  parseMintNaturalAmountFromDecimal,
} from '@tools/sdk/units'
import BigNumber from 'bignumber.js'
import { max, min } from 'bn.js'
import produce from 'immer'
import React, { useEffect, useMemo, useState } from 'react'

export interface BaseGovernanceFormFieldsV2 {
  _programVersion: 2
  minCommunityTokensToCreateProposal: number | string
  minInstructionHoldUpTime: number
  maxVotingTime: number
  voteThreshold: number
  voteTipping: VoteTipping
}

// @asktree: If GovernanceConfig updates in the future in an unversioned way, I suggest using Omit to exclude non-V3 fields
export type BaseGovernanceFormFieldsV3 = Omit<GovernanceConfig, 'reserved'> & {
  _programVersion: 3
}

const BaseGovernanceFormV2 = ({
  formErrors,
  form,
  setForm,
  setFormErrors,
}: {
  formErrors: any
  setForm: any
  setFormErrors: any
  form: BaseGovernanceFormFieldsV2
}) => {
  const { realmInfo, mint: realmMint } = useRealm()
  const [minTokensPercentage, setMinTokensPercentage] = useState<
    number | undefined
  >()
  const isMaxMinCommunityNumber =
    form.minCommunityTokensToCreateProposal === DISABLED_VOTER_WEIGHT.toString()
  const [showMinCommunity, setMinCommunity] = useState(!isMaxMinCommunityNumber)

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
      value:
        e.target.value === DISABLED_VOTER_WEIGHT.toString()
          ? DISABLED_VOTER_WEIGHT.toString()
          : parseFloat(
              Math.max(
                Number(min),
                Math.min(Number(max), Number(value))
              ).toFixed(currentPrecision)
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
      <div className="text-sm mb-3">
        <div className="mb-2">Min community tokens to create proposal</div>
        <div className="flex flex-row text-xs items-center">
          <Switch
            checked={showMinCommunity}
            onChange={() => {
              setMinCommunity(!showMinCommunity)
              if (!showMinCommunity === true) {
                handleSetForm({
                  value: 1,
                  propertyName: 'minCommunityTokensToCreateProposal',
                })
              } else {
                handleSetForm({
                  value: DISABLED_VOTER_WEIGHT.toString(),
                  propertyName: 'minCommunityTokensToCreateProposal',
                })
              }
            }}
          />{' '}
          <div className="ml-3">
            {showMinCommunity ? 'Enabled' : 'Disabled'}
          </div>
        </div>
      </div>

      {showMinCommunity && (
        <Input
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
      )}
      {showMinCommunity && getSupplyPercent()}
      <Input
        label="min instruction hold up time (days)"
        value={form.minInstructionHoldUpTime}
        type="number"
        min={0}
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
      <div className="max-w-lg pb-5">
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
      <Select
        label="Vote tipping"
        value={VoteTipping[form.voteTipping as any]}
        onChange={(selected) =>
          handleSetForm({
            value: selected,
            propertyName: 'voteTipping',
          })
        }
      >
        {Object.keys(VoteTipping)
          .filter((vt) => typeof VoteTipping[vt as any] === 'string')
          .map((vt) => (
            <Select.Option key={vt} value={vt}>
              {VoteTipping[vt as any]}{' '}
            </Select.Option>
          ))}
      </Select>
    </>
  )
}
const BaseGovernanceFormV3 = ({
  formErrors,
  form,
  setForm,
  setFormErrors,
}: {
  formErrors: any
  setForm: React.Dispatch<React.SetStateAction<BaseGovernanceFormFieldsV3>>
  setFormErrors: any
  form: BaseGovernanceFormFieldsV3
}) => {
  const { realmInfo, mint: realmMint } = useRealm()

  const isMaxMinCommunityNumber =
    form.minCommunityTokensToCreateProposal.toString() ===
    DISABLED_VOTER_WEIGHT.toString()
  const [showMinCommunity, setMinCommunity] = useState(!isMaxMinCommunityNumber)

  // @asktree: unclear that this should not just be an effect in the parent
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
      value:
        e.target.value === DISABLED_VOTER_WEIGHT.toString()
          ? DISABLED_VOTER_WEIGHT.toString()
          : parseFloat(
              Math.max(
                Number(min),
                Math.min(Number(max), Number(value))
              ).toFixed(currentPrecision)
            ),
      propertyName: fieldName,
    })
  }

  // TODO @asktree: all this stuff should really just wait on realmInfo instead of having weird defaults
  // Use 1% of mint supply as the default value for minTokensToCreateProposal and the default increment step in the input editor
  const mintSupply1Percent = realmMint
    ? getMintSupplyPercentageAsDecimal(realmMint, 1)
    : 100
  const minTokenAmount = realmMint
    ? getMintMinAmountAsDecimal(realmMint)
    : 0.0001
  // If the supply is small and 1% is below the minimum mint amount then coerce to the minimum value
  const minTokenStep = Math.max(mintSupply1Percent ?? 0, minTokenAmount)

  const getSupplyPercent = () => {
    const hasMinTokensPercentage =
      !!minCommunityTokensPercentage && !isNaN(minCommunityTokensPercentage)
    const percent =
      hasMinTokensPercentage && minCommunityTokensPercentage
        ? fmtPercentage(minCommunityTokensPercentage)
        : ''
    return hasMinTokensPercentage && <>{`${percent} of token supply`}</>
  }

  const minCommunityTokensPercentage = useMemo(() => {
    if (form.minCommunityTokensToCreateProposal === undefined) return undefined
    if (realmMint === undefined) return undefined

    const communityMinTokens = realmMint
      ? parseMintNaturalAmountFromDecimal(
          form.minCommunityTokensToCreateProposal.toString(),
          realmMint.decimals
        )
      : 0

    return getMintSupplyFractionAsDecimalPercentage(
      realmMint,
      communityMinTokens
    )
  }, [form.minCommunityTokensToCreateProposal, realmInfo?.symbol])

  return (
    <>
      <div className="text-sm mb-3 flex flex-col gap-4">
        <Input
          label="min instruction hold up time (days)"
          value={getDaysFromTimestamp(form.minInstructionHoldUpTime)}
          type="number"
          min={0}
          name="minInstructionHoldUpTime"
          onBlur={validateMinMax}
          onChange={(evt) =>
            handleSetForm({
              value: getTimestampFromDays(parseInt(evt.target.value)),
              propertyName: 'minInstructionHoldUpTime',
            })
          }
          error={formErrors['minInstructionHoldUpTime']}
        />
        <Input
          label="Max voting time (days)"
          value={getDaysFromTimestamp(form.maxVotingTime)}
          name="maxVotingTime"
          type="number"
          min={0.01}
          onBlur={validateMinMax}
          onChange={(evt) =>
            handleSetForm({
              value: getTimestampFromDays(parseInt(evt.target.value)),
              propertyName: 'maxVotingTime',
            })
          }
          error={formErrors['maxVotingTime']}
        />
        <div>
          <div className="mb-2">Min community tokens to create proposal</div>
          <div className="flex flex-row text-xs items-center">
            <Switch
              checked={showMinCommunity}
              onChange={() => {
                setMinCommunity(!showMinCommunity)
                if (!showMinCommunity === true) {
                  handleSetForm({
                    value: 1,
                    propertyName: 'minCommunityTokensToCreateProposal',
                  })
                } else {
                  handleSetForm({
                    value: DISABLED_VOTER_WEIGHT.toString(),
                    propertyName: 'minCommunityTokensToCreateProposal',
                  })
                }
              }}
            />{' '}
            <div className="ml-3">
              {showMinCommunity ? 'Enabled' : 'Disabled'}
            </div>
          </div>
          <div className="mt-2">
            {showMinCommunity && (
              <Input
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
            )}
            <span className="text-gray-200 whitespace-nowrap">
              ({showMinCommunity && getSupplyPercent()})
            </span>
          </div>
        </div>
        <Input
          label="Community yes vote threshold (%)"
          // TODO handle disabled case
          value={form.communityVoteThreshold.value}
          max={100}
          min={1}
          name="voteThreshold"
          type="number"
          onChange={(evt) => {
            const x = parseInt(evt.target.value)
            setForm((prev) => ({
              ...prev,
              communityVoteThreshold: new VoteThreshold({
                type: VoteThresholdType.YesVotePercentage,
                value: Math.max(0, Math.min(100, x)),
              }),
            }))
          }}
          error={formErrors['communityVoteThreshold']}
        />
        <div className="max-w-lg pb-5">
          <AmountSlider
            step={1}
            // TODO handle disabled case
            value={form.communityVoteThreshold.value!}
            disabled={false}
            onChange={(x) => {
              setForm((prev) => ({
                ...prev,
                communityVoteThreshold: new VoteThreshold({
                  type: VoteThresholdType.YesVotePercentage,
                  value: Math.max(0, Math.min(100, x)),
                }),
              }))
            }}
          />
        </div>
        <Select
          label="Community vote tipping"
          value={VoteTipping[form.communityVoteTipping]}
          onChange={(selected) =>
            handleSetForm({
              value: selected,
              propertyName: 'communityVoteTipping',
            })
          }
        >
          {Object.keys(VoteTipping)
            .filter((vt) => typeof VoteTipping[vt as any] === 'string')
            .map((vt) => (
              <Select.Option key={vt} value={vt}>
                {VoteTipping[vt as any]}{' '}
              </Select.Option>
            ))}
        </Select>{' '}
      </div>
    </>
  )
}

const BaseGovernanceForm = ({
  form,
  ...props
}: {
  formErrors: any
  setForm: any
  setFormErrors: any
  form: BaseGovernanceFormFieldsV3 | BaseGovernanceFormFieldsV2
}) => {
  return form._programVersion === 3 ? (
    <BaseGovernanceFormV3 form={form} {...props} />
  ) : (
    <BaseGovernanceFormV2 form={form} {...props} />
  )
}

export default BaseGovernanceForm
