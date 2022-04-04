import React, { useEffect } from 'react'
import {
  RealmArtifacts,
  RealmWizardStepComponentProps,
} from '@components/RealmWizard/interfaces/Realm'
import Input from '@components/inputs/Input'
import {
  formatMintNaturalAmountAsDecimal,
  getMintDecimalAmount,
} from '@tools/sdk/units'
import { BN } from '@project-serum/anchor'
import { tryGetMint } from '@utils/tokens'
import { PublicKey } from '@solana/web3.js'
import useWalletStore from 'stores/useWalletStore'
import _ from 'lodash'
import Switch from '@components/Switch'
import { StyledLabel } from '@components/inputs/styles'
import Tooltip from '@components/Tooltip'
import { MIN_COMMUNITY_TOKENS_TO_CREATE_W_0_SUPPLY } from '@tools/constants'
import BigNumber from 'bignumber.js'

export const getMintSupplyFactorPercent = (form: RealmArtifacts) => {
  let value = '0'
  if (!form.communityMintMaxVoteWeightSource) return value
  value = (+form.communityMintMaxVoteWeightSource! * 100).toFixed(2)

  return value + '%'
}

export const getSubtitleForMinTokenToCreate = (form: RealmArtifacts) => {
  if (!form.communityMint || form.communityMint.account.supply.eq(new BN(0)))
    return `Default is ${Intl.NumberFormat(navigator.language).format(
      MIN_COMMUNITY_TOKENS_TO_CREATE_W_0_SUPPLY
    )} for mints with no supply`
  return 'Default is 1% of community mint'
}

export const getMinTokensToCreatePercent = (form: RealmArtifacts) => {
  let value = '0'
  if (!form.minCommunityTokensToCreateGovernance) return value + '%'
  if (form.communityMint?.account.supply) {
    value = new BigNumber(form.minCommunityTokensToCreateGovernance)
      .dividedBy(
        new BigNumber(form.communityMint.account.supply.toString()).shiftedBy(
          -form.communityMint.account.decimals
        )
      )
      .times(100)
      .toString()
  }

  return (isFinite(+value) ? value : 0) + '%'
}

const BespokeConfig: React.FC<RealmWizardStepComponentProps> = ({
  setForm,
  form,
  formErrors,
  onSwitch = () => null,
  isTestProgramId = true,
}) => {
  const { connection } = useWalletStore((s) => s)
  const handleCommunityMint = async (mintId: string) => {
    try {
      const mintPublicKey = new PublicKey(mintId)
      const mint = await tryGetMint(connection.current, mintPublicKey)
      if (mint) {
        const supply = mint.account.supply
        if (supply.gt(new BN(0))) {
          setForm({
            minCommunityTokensToCreateGovernance: getMintDecimalAmount(
              mint.account,
              supply
            )
              .dividedBy(100)
              .toString(),
            communityMintMaxVoteWeightSource: '1',
            communityMint: mint,
            transferAuthority: true,
          })
        } else {
          setForm({
            communityMint: mint,
            transferAuthority: true,
          })
        }
      }
    } catch (e) {
      console.log('failed to set community mint', e)
    }
  }

  useEffect(() => {
    _.debounce(async () => {
      if (form?.communityMintId) {
        await handleCommunityMint(form.communityMintId)
      }
    }, 250)()
    if (!form?.communityMintId?.length) {
      setForm({
        communityMint: undefined,
        minCommunityTokensToCreateGovernance: undefined,
        communityMintId: undefined,
      })
    }
  }, [form?.communityMintId])

  return (
    <>
      <div className="border-b border-fgd-4 pb-4 pt-2">
        <div className="flex items-center justify-between">
          <h1>Create a new realm</h1>
        </div>
      </div>
      <div className="pt-2">
        <div className="pb-4 pr-10 mr-2">
          <Input
            label="Name"
            placeholder="Name of your realm"
            value={form.name}
            type="text"
            error={formErrors['name']}
            onChange={(evt) =>
              setForm({
                name: evt.target.value,
              })
            }
          />
        </div>
        <div className="pb-4 pr-10 mr-2 mt-3">
          <Input
            label="Community Token Mint"
            placeholder="(Optional) Community token mint of this realm"
            value={form?.communityMintId}
            type="text"
            error={formErrors['communityMintId'] || formErrors['communityMint']}
            onChange={(evt) => setForm({ communityMintId: evt.target.value })}
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
              <div className="flex justify-left items-center">
                <Tooltip content="If checked, will transfer mint authority to the realm">
                  <Switch
                    className="mt-2 mb-2"
                    checked={form.transferAuthority ?? false}
                    onChange={() => {
                      setForm({ transferAuthority: !form.transferAuthority })
                    }}
                  />
                </Tooltip>
                <StyledLabel className="mt-1.5 ml-3">
                  Transfer authority
                </StyledLabel>
              </div>
            </div>
          </>
        )}
        <div className="pb-4 pr-10 mr-2 relative">
          <Input
            label="Min community tokens to create governance"
            subtitle={getSubtitleForMinTokenToCreate(form)}
            placeholder="Min community tokens to create governance"
            className="w-36"
            step="1"
            value={
              form.minCommunityTokensToCreateGovernance
                ? form.minCommunityTokensToCreateGovernance.toString()
                : MIN_COMMUNITY_TOKENS_TO_CREATE_W_0_SUPPLY
            }
            type="number"
            error={formErrors['minCommunityTokensToCreateGovernance']}
            onChange={(evt) => {
              const value = evt.target.value
              setForm({
                minCommunityTokensToCreateGovernance: value,
              })
            }}
          />
          <p className="text-gray-500 mt-1 absolute bottom-5 sm:bottom-7 left-14 ml-12 pl-12">
            {getMinTokensToCreatePercent(form)} of token supply
          </p>{' '}
        </div>

        <div className="pb-4 pr-10 mr-2  mt-3 relative">
          <Input
            label="Community mint supply factor"
            subtitle="Max vote weight"
            placeholder="Community mint supply factor"
            className="w-36"
            value={form.communityMintMaxVoteWeightSource}
            step="0.0000000001"
            max="1"
            type="number"
            error={formErrors['communityMintMaxVoteWeightSource']}
            onBlur={() => {
              if (!form.communityMintMaxVoteWeightSource?.length) {
                setForm({
                  communityMintMaxVoteWeightSource: '1',
                })
              }
            }}
            onChange={(evt) => {
              const value =
                +evt.target.value <= 1 && +evt.target.value >= 0
                  ? evt.target.value
                  : 1
              setForm({
                communityMintMaxVoteWeightSource: value,
              })
            }}
          />
          <p className="text-gray-500 mt-1 absolute bottom-5 sm:bottom-7 left-14 ml-12 pl-12">
            {getMintSupplyFactorPercent(form)} vote weight
          </p>
        </div>
        <div className="pb-4 pr-10 mr-2 mt-3 ">
          <Input
            label="Custom program Id"
            placeholder="Id of the governance program this realm will be associated with"
            value={form?.governanceProgramId}
            type="text"
            error={formErrors['governanceProgramId']}
            disabled={isTestProgramId}
            readonly={isTestProgramId}
            onChange={(evt) =>
              setForm({
                governanceProgramId: evt.target.value,
              })
            }
          />
        </div>
        <div className="pb-4 pr-10 mr-2 mt-3">
          <div className="flex justify-left items-center">
            <Switch
              className="mt-2 mb-2"
              checked={isTestProgramId}
              onChange={(x) => onSwitch(x)}
            />
            <StyledLabel className="mt-1.5 ml-3">Use test instance</StyledLabel>
          </div>
        </div>
      </div>
    </>
  )
}

export default BespokeConfig
