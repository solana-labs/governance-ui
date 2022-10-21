import Input from '@components/inputs/Input'
import Select from '@components/inputs/Select'
import AmountSlider from '@components/Slider'
import Switch from '@components/Switch'
import useRealm from '@hooks/useRealm'
import { VoteTipping } from '@solana/spl-governance'
import {
  fmtPercentage,
  getMintMinAmountAsDecimal,
  getMintSupplyFractionAsDecimalPercentage,
  getMintSupplyPercentageAsDecimal,
  parseMintNaturalAmountFromDecimal,
} from '@tools/sdk/units'
import React, { useEffect, useMemo } from 'react'
import { BaseGovernanceFormFieldsV3 } from './BaseGovernanceForm-data'

//TODO validate bricking via disabling both yes vote thresholds

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
  const { mint: realmMint, councilMint } = useRealm()

  // @asktree: unclear that this should not just be an effect in the parent, I am just replicating the behavior of previous components
  useEffect(() => {
    setFormErrors({})
  }, [form])

  const [communityTokenHelpers, councilTokenHelpers] = useMemo(() => {
    return [realmMint, councilMint].map((mint) => {
      if (mint === undefined) return undefined

      const mintSupply1Percent = getMintSupplyPercentageAsDecimal(mint, 1)

      const minTokenAmount = getMintMinAmountAsDecimal(mint)
      // If the supply is small and 1% is below the minimum mint amount then coerce to the minimum value
      const minTokenStep = Math.max(mintSupply1Percent, minTokenAmount)
      return { minTokenAmount, minTokenStep }
    })
  }, [realmMint, councilMint])

  const minCommunityTokensPercentage = useMemo(() => {
    if (form.minCommunityTokensToCreateProposal === undefined) return undefined
    if (realmMint === undefined) return undefined

    const minTokens = realmMint
      ? parseMintNaturalAmountFromDecimal(
          form.minCommunityTokensToCreateProposal.toString(),
          realmMint.decimals
        )
      : 0

    return getMintSupplyFractionAsDecimalPercentage(realmMint, minTokens)
  }, [form.minCommunityTokensToCreateProposal, realmMint])

  const minCouncilTokensPercentage = useMemo(() => {
    if (form.minCouncilTokensToCreateProposal === undefined) return undefined
    if (councilMint === undefined) return undefined

    const minTokens = councilMint
      ? parseMintNaturalAmountFromDecimal(
          form.minCouncilTokensToCreateProposal.toString(),
          councilMint.decimals
        )
      : 0

    return getMintSupplyFractionAsDecimalPercentage(councilMint, minTokens)
  }, [form.minCouncilTokensToCreateProposal, councilMint])

  return (
    <>
      <div className="text-sm mb-3 flex flex-col gap-4">
        <Input
          label="min instruction hold up time (days)"
          value={form.minInstructionHoldUpTime}
          type="number"
          min={0}
          name="minInstructionHoldUpTime"
          onChange={(evt) =>
            setForm((prev) => ({
              ...prev,
              minInstructionHoldUpTime:
                evt.target.value !== '' ? evt.target.value : '0',
            }))
          }
          error={formErrors['minInstructionHoldUpTime']}
        />
        <Input
          label="Max voting time (days)"
          value={form.maxVotingTime}
          name="maxVotingTime"
          type="number"
          min={0.01}
          onChange={(evt) =>
            setForm((prev) => ({
              ...prev,
              maxVotingTime: evt.target.value !== '' ? evt.target.value : '0',
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
            ] !== 'disabled'

          const minTokensPercentage =
            govPop === 'community'
              ? minCommunityTokensPercentage
              : minCouncilTokensPercentage

          const tokenHelpers =
            govPop === 'community' ? communityTokenHelpers : councilTokenHelpers

          return (
            <React.Fragment key={govPop}>
              <div className="border-t border-white/10 pt-3">
                <h3>{capitalized} settings</h3>
              </div>
              <div className="max-w-lg">
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
                                    minCommunityTokensToCreateProposal: '1',
                                  }
                                : {
                                    minCouncilTokensToCreateProposal: '1',
                                  }),
                            }
                          : {
                              ...prev,
                              ...(govPop === 'community'
                                ? {
                                    minCommunityTokensToCreateProposal:
                                      'disabled',
                                  }
                                : {
                                    minCouncilTokensToCreateProposal:
                                      'disabled',
                                  }),
                            }
                      )
                    }}
                  />{' '}
                  <div className="ml-3 grow">
                    {!minProposalTokensEnabled ? (
                      'Disabled'
                    ) : (
                      <>
                        {minProposalTokensEnabled && (
                          <Input
                            value={
                              govPop === 'community'
                                ? form.minCommunityTokensToCreateProposal
                                : form.minCouncilTokensToCreateProposal
                            }
                            type="number"
                            name="minCommunityTokensToCreateProposal"
                            min={tokenHelpers?.minTokenAmount}
                            step={tokenHelpers?.minTokenStep}
                            onChange={(evt) =>
                              setForm((prev) => ({
                                ...prev,
                                ...(govPop === 'community'
                                  ? {
                                      minCommunityTokensToCreateProposal:
                                        evt.target.value !== ''
                                          ? evt.target.value
                                          : '0',
                                    }
                                  : {
                                      minCouncilTokensToCreateProposal:
                                        evt.target.value !== ''
                                          ? evt.target.value
                                          : '0',
                                    }),
                              }))
                            }
                            error={
                              formErrors[
                                `min${capitalized}TokensToCreateProposal`
                              ]
                            }
                          />
                        )}
                        <span className="text-gray-200 whitespace-nowrap">
                          {minTokensPercentage !== undefined &&
                          !isNaN(minTokensPercentage) ? (
                            <>{`(${fmtPercentage(
                              minTokensPercentage
                            )} of token supply)`}</>
                          ) : (
                            ''
                          )}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {(['yes', 'veto'] as const).map((vote) => {
                const setThreshold = (x: typeof form.communityVoteThreshold) =>
                  setForm((prev) => ({
                    ...prev,
                    ...(govPop === 'community'
                      ? vote === 'yes'
                        ? {
                            communityVoteThreshold: x,
                          }
                        : {
                            communityVetoVoteThreshold: x,
                          }
                      : vote === 'yes'
                      ? {
                          councilVoteThreshold: x,
                        }
                      : {
                          councilVetoVoteThreshold: x,
                        }),
                  }))

                const voteThreshold =
                  govPop === 'community'
                    ? vote === 'yes'
                      ? form.communityVoteThreshold
                      : form.communityVetoVoteThreshold
                    : vote === 'yes'
                    ? form.councilVoteThreshold
                    : form.councilVetoVoteThreshold

                return (
                  <div key={vote} className="max-w-lg">
                    <div className="mb-2">{`${capitalized} ${vote} vote threshold (%)`}</div>
                    <div className="flex flex-row text-xs items-center">
                      <Switch
                        checked={voteThreshold !== 'disabled'}
                        onChange={(checked) => {
                          setThreshold(checked ? '1' : 'disabled')
                        }}
                      />

                      <div className="ml-3 grow">
                        {voteThreshold === 'disabled' ? (
                          'Disabled'
                        ) : (
                          <>
                            <Input
                              min={1}
                              value={voteThreshold}
                              type="number"
                              onChange={(evt) => {
                                if (evt.target.value === '') {
                                  return setThreshold('')
                                }

                                const x = parseInt(evt.target.value)
                                const clamped = Math.max(0, Math.min(100, x))

                                return setThreshold(clamped.toString())
                              }}
                              error={formErrors[govPop + 'VoteThreshold']}
                            />
                            <div className="pb-4">
                              <AmountSlider
                                step={1}
                                value={parseInt(voteThreshold)}
                                disabled={false}
                                onChange={(x) => setThreshold(x.toString())}
                              />
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}

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
            </React.Fragment>
          )
        })}
      </div>
    </>
  )
}
