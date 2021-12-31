/* eslint-disable @typescript-eslint/no-unused-vars */
import Input from '@components/inputs/Input'
import { StyledLabel } from '@components/inputs/styles'
import { formatMintNaturalAmountAsDecimal } from '@tools/sdk/units'
import React from 'react'
import { RealmWizardStepComponentProps } from '../../interfaces/Realm'
import ApprovalQuorumInput from '../ApprovalQuorumInput'

const BespokeInfo: React.FC<RealmWizardStepComponentProps> = ({
  setForm,
  form,
  formErrors,
}) => {
  return (
    <>
      <div className="border-b border-fgd-4 pb-4 pt-2">
        <div className="flex items-center justify-between">
          <h1>Realm summary</h1>
        </div>
      </div>
      <div>
        <div>
          <div className="pt-2">
            <div className="pb-4 pr-10 mr-2">
              <Input
                readOnly
                label="Name"
                placeholder="Name of your realm"
                value={form.name}
                error={formErrors['name']}
                type="text"
              />
            </div>

            <div className="pb-4 pr-10 mr-2">
              <Input
                readOnly
                label={`Community Token Mint ${
                  !form?.communityMintId ? " (We'll generate for you)" : ''
                } `}
                placeholder="Community mint id of this realm"
                error={
                  formErrors['communityMintId'] || formErrors['communityMint']
                }
                value={form?.communityMintId}
                type="text"
              />
              {form?.communityMint && (
                <div className="pt-2">
                  <div className="pb-0.5 text-fgd-3 text-xs">Mint supply</div>
                  <div className="text-xs">
                    {formatMintNaturalAmountAsDecimal(
                      form.communityMint.account,
                      form.communityMint.account.supply
                    )}
                  </div>
                </div>
              )}
            </div>
            {form?.communityMint && (
              <>
                <div className="pb-4 pr-10 mr-2">
                  <Input
                    readOnly
                    label="Min community tokens to create governance (defaults 1% of community mint)"
                    placeholder="Min community tokens to create governance"
                    step="0.01"
                    value={form.minCommunityTokensToCreateGovernance}
                    error={formErrors['minCommunityTokensToCreateGovernance']}
                    type="number"
                  />
                </div>
                <div className="pb-4 pr-10 mr-2">
                  <Input
                    readOnly
                    label="Community mint supply factor (max vote weight)"
                    placeholder="Community mint supply factor (max vote weight)"
                    value={form.communityMintMaxVoteWeightSource}
                    error={formErrors['communityMintMaxVoteWeightSource']}
                    type="number"
                  />
                </div>
              </>
            )}
            <div className="pb-4 pr-10 mr-2">
              <Input
                readOnly
                label="Governance Program Id"
                placeholder="Id of the governance program this realm will be associated with"
                value={form?.governanceProgramId}
                error={formErrors['governanceProgramId']}
                type="text"
              />
            </div>

            <div className="pb-4 pr-10 mr-2">
              <Input
                readOnly
                label="Governance program version"
                placeholder={1}
                step="1"
                min={1}
                value={form?.programVersion}
                error={formErrors['programVersion']}
                type="number"
              />
            </div>
          </div>
        </div>
        <div className="pt-5 pr-2">
          {form.teamWallets?.length ? (
            <>
              <div className="pb-7 pr-10 w-full">
                <Input
                  readOnly
                  label={`Council token mint ${
                    !form?.councilMintId ? " (We'll generate for you)" : ''
                  } `}
                  placeholder="(Optional) Council mint"
                  error={
                    formErrors['councilMintId'] || formErrors['councilMintId']
                  }
                  value={form?.councilMintId}
                  type="text"
                />
              </div>
              <div className="pb-7 pr-10 w-full">
                <ApprovalQuorumInput
                  value={form.yesThreshold}
                  onChange={($e) => null}
                  onBlur={() => null}
                />
              </div>
            </>
          ) : null}
          {form.teamWallets?.length ? (
            <div className="team-wallets-wrapper">
              <StyledLabel className="py-5">Team wallets</StyledLabel>
              {form.teamWallets?.map((wallet, index) => (
                <div className="flex flex-col relative w-full pb-5" key={index}>
                  <StyledLabel>Member {index + 1}:</StyledLabel>
                  <div className="flex align-center">
                    <div
                      className="bg-gray-700 px-3 py-2 rounded"
                      style={{ fontFamily: 'monospace' }}
                    >
                      {wallet}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </>
  )
}

export default BespokeInfo
