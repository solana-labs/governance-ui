import Input from '@components/inputs/Input'
import Select from '@components/inputs/Select'
import AmountSlider from '@components/Slider'
import Switch from '@components/Switch'
import useRealm from '@hooks/useRealm'
import {
  VoteThreshold,
  VoteThresholdType,
  VoteTipping,
} from '@solana/spl-governance'
import { DISABLED_VOTER_WEIGHT } from '@tools/constants'
import {
  fmtPercentage,
  getDaysFromTimestamp,
  getMintMinAmountAsDecimal,
  getMintSupplyFractionAsDecimalPercentage,
  getMintSupplyPercentageAsDecimal,
  getTimestampFromDays,
  parseMintNaturalAmountFromDecimal,
} from '@tools/sdk/units'
import BN from 'bn.js'
import React, { useEffect, useMemo } from 'react'
import { BaseGovernanceFormFieldsV3 } from './BaseGovernanceForm'

export const BaseGovernanceFormV3 = ({
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

  // @asktree: unclear that this should not just be an effect in the parent, I am just replicating the behavior of previous components
  useEffect(() => {
    setFormErrors({})
  }, [form])

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

  // TODO figure out what to do for council too
  const getSupplyPercent = () => {
    const hasMinTokensPercentage =
      !!minCommunityTokensPercentage && !isNaN(minCommunityTokensPercentage)
    const percent =
      hasMinTokensPercentage && minCommunityTokensPercentage
        ? fmtPercentage(minCommunityTokensPercentage)
        : ''
    return hasMinTokensPercentage && <>{`(${percent} of token supply)`}</>
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
          onChange={(evt) =>
            setForm((prev) => ({
              ...prev,
              minInstructionHoldUpTime: getTimestampFromDays(
                parseInt(evt.target.value)
              ),
            }))
          }
          error={formErrors['minInstructionHoldUpTime']}
        />
        <Input
          label="Max voting time (days)"
          value={getDaysFromTimestamp(form.maxVotingTime)}
          name="maxVotingTime"
          type="number"
          min={0.01}
          onChange={(evt) =>
            setForm((prev) => ({
              ...prev,
              maxVotingTime: getTimestampFromDays(parseInt(evt.target.value)),
            }))
          }
          error={formErrors['maxVotingTime']}
        />
        {(['community', 'council'] as const).map((govPop) => {
          const capitalized = govPop === 'community' ? 'Community' : 'Council'
          const minProposalTokensEnabled =
            form[
              govPop === 'community'
                ? 'minCommunityTokensToCreateProposal'
                : 'minCouncilTokensToCreateProposal'
            ].toString() !== DISABLED_VOTER_WEIGHT.toString()

          return (
            <>
              <div className="border-t border-white/10 pt-3">
                <h3>{capitalized} settings</h3>
              </div>
              <div>
                <div className="mb-2">
                  Min {govPop} tokens to create proposal
                </div>
                <div className="flex flex-row text-xs items-center">
                  <Switch
                    // TODO
                    checked={minProposalTokensEnabled}
                    onChange={() => {
                      setForm((prev) =>
                        !minProposalTokensEnabled
                          ? {
                              ...prev,
                              ...(govPop === 'community'
                                ? {
                                    minCommunityTokensToCreateProposal: new BN(
                                      1
                                    ),
                                  }
                                : {
                                    minCouncilTokensToCreateProposal: new BN(1),
                                  }),
                            }
                          : {
                              ...prev,
                              ...(govPop === 'community'
                                ? {
                                    minCommunityTokensToCreateProposal: DISABLED_VOTER_WEIGHT,
                                  }
                                : {
                                    minCouncilTokensToCreateProposal: DISABLED_VOTER_WEIGHT,
                                  }),
                            }
                      )
                    }}
                  />{' '}
                  <div className="ml-3">
                    {minProposalTokensEnabled ? 'Enabled' : 'Disabled'}
                  </div>
                </div>
                <div className="mt-2">
                  {minProposalTokensEnabled && (
                    <Input
                      value={
                        govPop === 'community'
                          ? form.minCommunityTokensToCreateProposal
                          : form.minCouncilTokensToCreateProposal
                      }
                      type="number"
                      name="minCommunityTokensToCreateProposal"
                      min={minTokenAmount}
                      step={minTokenStep}
                      onChange={(evt) =>
                        setForm((prev) => ({
                          ...prev,
                          ...(govPop === 'community'
                            ? {
                                minCommunityTokensToCreateProposal: new BN(
                                  evt.target.value
                                ),
                              }
                            : {
                                minCouncilTokensToCreateProposal: new BN(
                                  evt.target.value
                                ),
                              }),
                        }))
                      }
                      error={
                        formErrors[`min${capitalized}TokensToCreateProposal`]
                      }
                    />
                  )}
                  <span className="text-gray-200 whitespace-nowrap">
                    {minProposalTokensEnabled && getSupplyPercent()}
                  </span>
                </div>
              </div>
              <Input
                label={`${capitalized} yes vote threshold (%)`}
                // TODO handle disabled case
                value={
                  govPop === 'community'
                    ? form.communityVoteThreshold.value
                    : form.councilVoteThreshold.value
                }
                max={100}
                min={1}
                name={govPop + 'Threshold'}
                type="number"
                onChange={(evt) => {
                  const x = parseInt(evt.target.value)

                  // TODO make type safe
                  const y =
                    govPop === 'community'
                      ? 'communityVoteThreshold'
                      : 'councilVoteThreshold'
                  setForm((prev) => ({
                    ...prev,
                    [y]: new VoteThreshold({
                      type: VoteThresholdType.YesVotePercentage,
                      value: Math.max(0, Math.min(100, x)),
                    }),
                  }))
                }}
                error={formErrors[govPop + 'VoteThreshold']}
              />
              <div className="max-w-lg pb-5">
                <AmountSlider
                  step={1}
                  // TODO handle disabled case
                  value={
                    govPop === 'community'
                      ? form.communityVoteThreshold.value!
                      : form.councilVoteThreshold.value!
                  }
                  disabled={false}
                  onChange={(x) => {
                    // this is in fact type-safe!
                    const y =
                      govPop === 'community'
                        ? 'communityVoteThreshold'
                        : 'councilVoteThreshold'
                    setForm((prev) => ({
                      ...prev,
                      [y]: new VoteThreshold({
                        type: VoteThresholdType.YesVotePercentage,
                        value: Math.max(0, Math.min(100, x)),
                      }),
                    }))
                  }}
                />
              </div>
              <Select
                label={`${capitalized} vote tipping`}
                value={
                  VoteTipping[
                    govPop === 'community'
                      ? form.communityVoteTipping
                      : form.councilVoteTipping
                  ]
                }
                onChange={(selected) =>
                  setForm((prev) => ({
                    ...prev,
                    ...(govPop === 'community'
                      ? {
                          communityVoteTipping: selected,
                        }
                      : {
                          councilVoteTipping: selected,
                        }),
                  }))
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
        })}
      </div>
    </>
  )
}
