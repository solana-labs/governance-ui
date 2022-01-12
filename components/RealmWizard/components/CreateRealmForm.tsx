import React, { useEffect, useState } from 'react'
import { BN } from '@project-serum/anchor'
import {
  formatMintNaturalAmountAsDecimal,
  getMintDecimalAmount,
} from '@tools/sdk/units'
import { tryGetMint } from '@utils/tokens'
import useWalletStore from 'stores/useWalletStore'
import { RealmWizardStepComponentProps } from '../interfaces/Realm'
import Input from '@components/inputs/Input'
import {
  MintMaxVoteWeightSource,
  PROGRAM_VERSION_V1,
} from '@solana/spl-governance'
import { registerRealm } from 'actions/registerRealm'
import { notify } from 'utils/notifications'
import { formValidation, isFormValid } from '@utils/formValidation'
import { PublicKey } from '@solana/web3.js'
import { CreateFormSchema } from '../validators/createRealmValidator'
import _ from 'lodash'
import useQueryContext from '@hooks/useQueryContext'

import router from 'next/router'

const CreateRealmForm: React.FC<RealmWizardStepComponentProps> = ({
  form,
  setForm,
  shouldFireCreate = false,
  setIsLoading = () => undefined,
}) => {
  const { fmtUrlWithCluster } = useQueryContext()

  const wallet = useWalletStore((s) => s.current)
  const connection = useWalletStore((s) => s.connection)

  const [formErrors, setFormErrors] = useState({})
  const [, setRealmAddress] = useState<PublicKey>()

  const handleSetForm = (newValues) => {
    setFormErrors({})
    setForm({ ...form, ...newValues })
  }

  // TODO: in the complete version of the realm wizard,
  // all the methods inside this component will be moved to
  // a separate controller and handled by the main component
  // to fit the `step-by-step` model.
  const handleCreate = async () => {
    setFormErrors({})
    setIsLoading(true)
    const { isValid, validationErrors }: formValidation = await isFormValid(
      CreateFormSchema,
      form
    )

    if (isValid) {
      try {
        const realmAddress = await registerRealm(
          {
            connection,
            wallet: wallet!,
            walletPubkey: wallet!.publicKey!,
          },
          new PublicKey(form.governanceProgramId!),
          form.programVersion ?? PROGRAM_VERSION_V1,
          form.name!,
          new PublicKey(form.communityMintId!),
          form.councilMintId ? new PublicKey(form.councilMintId) : undefined,
          MintMaxVoteWeightSource.FULL_SUPPLY_FRACTION,
          form.minCommunityTokensToCreateGovernance!
        )
        setRealmAddress(realmAddress)
        router.push(fmtUrlWithCluster(`/dao/${realmAddress.toBase58()}`))
      } catch (ex) {
        console.log(ex)
        notify({ type: 'error', message: `${ex}` })
      }
    } else {
      setFormErrors(validationErrors)
    }
    setIsLoading(false)
  }

  const handleCommunityMint = async (mintId: string) => {
    try {
      const mintPublicKey = new PublicKey(mintId)
      const mint = await tryGetMint(connection.current, mintPublicKey)
      if (mint) {
        const supply = mint.account.supply
        if (supply.gt(new BN(0))) {
          handleSetForm({
            minCommunityTokensToCreateGovernance: BN.max(
              new BN(1),
              // divide by 100 for a percentage
              new BN(
                getMintDecimalAmount(mint.account, supply)
                  .dividedBy(100)
                  .toString()
              )
            ),
            communityMint: mint,
          })
        } else {
          handleSetForm({
            communityMint: mint,
          })
        }
      }
    } catch (e) {
      console.log('failed to set community mint', e)
    }
  }

  const handleCouncilMint = async (mintId: string) => {
    try {
      const mintPublicKey = new PublicKey(mintId)
      const mint = await tryGetMint(connection.current, mintPublicKey)
      if (mint) {
        handleSetForm({
          councilMint: mint,
        })
      }
    } catch (e) {
      console.log('failed to set council mint', e)
    }
  }

  useEffect(() => {
    _.debounce(async () => {
      if (form?.councilMintId) {
        await handleCouncilMint(form.councilMintId)
      }
      if (form?.communityMintId) {
        await handleCommunityMint(form.communityMintId)
      }
    }, 250)()
  }, [form?.communityMintId, form?.councilMintId])

  // TODO: This hook will be removed in future versions of the wizard
  useEffect(() => {
    if (shouldFireCreate) handleCreate()
  }, [shouldFireCreate])

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
              handleSetForm({
                name: evt.target.value,
              })
            }
          />
        </div>
        <div className="pb-4 pr-10 mr-2">
          <Input
            label="Community Mint Id"
            placeholder="Community mint id of this realm"
            value={form?.communityMintId}
            type="text"
            error={formErrors['communityMintId'] || formErrors['communityMint']}
            onChange={(evt) =>
              handleSetForm({ communityMintId: evt.target.value })
            }
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
                label="Min community tokens to create governance (defaults 1% of community mint)"
                placeholder="Min community tokens to create governance"
                step="0.01"
                value={form.minCommunityTokensToCreateGovernance}
                type="number"
                error={formErrors['minCommunityTokensToCreateGovernance']}
                onChange={(evt) =>
                  handleSetForm({
                    minCommunityTokensToCreateGovernance: new BN(
                      evt.target.value
                    ),
                  })
                }
              />
            </div>
            <div className="pb-4 pr-10 mr-2">
              <Input
                label="Community mint supply factor (max vote weight)"
                placeholder="Community mint supply factor (max vote weight)"
                value={form.communityMintMaxVoteWeightSource}
                type="number"
                error={formErrors['communityMintMaxVoteWeightSource']}
                onChange={(evt) =>
                  handleSetForm({
                    communityMintMaxVoteWeightSource: evt.target.value,
                  })
                }
              />
            </div>
          </>
        )}
        <div className="pb-4 pr-10 mr-2">
          <Input
            label="Council Mint Id"
            placeholder="(Optional) Council mint"
            value={form?.councilMintId}
            type="text"
            error={formErrors['councilMintId'] || formErrors['councilMint']}
            onChange={(evt) =>
              handleSetForm({ councilMintId: evt.target.value })
            }
          />
        </div>
        <div className="pb-4 pr-10 mr-2">
          <Input
            label="Governance Program Id"
            placeholder="Id of the governance program this realm will be associated with"
            value={form?.governanceProgramId}
            type="text"
            error={formErrors['governanceProgramId']}
            onChange={(evt) =>
              handleSetForm({
                governanceProgramId: evt.target.value,
              })
            }
          />
        </div>
        <div className="pb-4 pr-10 mr-2">
          <Input
            label="Governance program version"
            placeholder={1}
            step="1"
            min={1}
            value={form?.programVersion}
            type="number"
            error={formErrors['programVersion']}
            onChange={(evt) =>
              handleSetForm({
                programVersion: evt.target.value,
              })
            }
          />
        </div>
        {/* <div className="border-t border-fgd-4 flex justify-end mt-6 pt-6 space-x-4">
          <Button
          isLoading={isLoading}
          onClick={handleCreate}
          disabled={!form?.teamWallets?.length}
          >
          Create Realm
          </Button>
        </div> */}
      </div>
    </>
  )
}

export default CreateRealmForm
