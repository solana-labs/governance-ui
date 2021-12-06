import React, { useEffect, useState } from 'react'
import { BN } from '@project-serum/anchor'
import {
  formatMintNaturalAmountAsDecimal,
  getMintDecimalAmount,
} from '@tools/sdk/units'
import { tryGetMint } from '@utils/tokens'
import useWalletStore from 'stores/useWalletStore'
import { RealmArtifacts } from '../interfaces/Realm'
import Input from '@components/inputs/Input'
import Button from '@components/Button'
import { RpcContext } from '@models/core/api'
import { MintMaxVoteWeightSource } from 'models/accounts'
import { registerRealm } from 'actions/registerRealm'
import { notify } from 'utils/notifications'
import { formValidation, isFormValid } from '@utils/formValidation'
import { PublicKey } from '@solana/web3.js'
import { CreateFormSchema } from '../validators/create-realm-validator'
import _ from 'lodash'

const CreateRealmForm: React.FC<{ artifacts?: RealmArtifacts }> = ({
  artifacts,
}) => {
  const wallet = useWalletStore((s) => s.current)
  const connection = useWalletStore((s) => s.connection)

  const [form, setForm] = useState<RealmArtifacts>()

  useEffect(() => {
    if (artifacts) setForm(artifacts)
  }, [artifacts])

  const [formErrors, setFormErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [realmAddress, setRealmAddress] = useState<PublicKey>()

  const handleSetForm = (newValues) => {
    setFormErrors({})
    setForm({ ...form, ...newValues })
  }

  const handleCreate = async () => {
    if (form) {
      setFormErrors({})
      setIsLoading(true)
      const { isValid, validationErrors }: formValidation = await isFormValid(
        CreateFormSchema,
        form
      )

      if (isValid && form.governanceProgramId) {
        const rpcContext = new RpcContext(
          new PublicKey(form.governanceProgramId),
          form.programVersion,
          wallet,
          connection.current,
          connection.endpoint
        )

        try {
          if (
            form.name &&
            form.communityMintId &&
            form.minCommunityTokensToCreateGovernance
          ) {
            const realmAddress = await registerRealm(
              rpcContext,
              form.name,
              new PublicKey(form?.communityMintId),
              form.councilMintId
                ? new PublicKey(form.councilMintId)
                : undefined,
              MintMaxVoteWeightSource.FULL_SUPPLY_FRACTION,
              form.minCommunityTokensToCreateGovernance
            )
            setRealmAddress(realmAddress)
          }
        } catch (ex) {
          console.log(ex)
          notify({ type: 'error', message: `${ex}` })
        }
      } else {
        setFormErrors(validationErrors)
      }
      setIsLoading(false)
    }
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
      setIsLoading(true)
      if (form?.councilMintId) {
        await handleCouncilMint(form.councilMintId)
      }
      if (form?.communityMintId) {
        await handleCommunityMint(form.communityMintId)
      }
      setIsLoading(false)
    }, 250)()
  }, [form?.communityMintId, form?.councilMintId])

  return (
    <>
      <div className="border-b border-fgd-4 pb-4 pt-2">
        <div className="flex items-center justify-between">
          <h1>Create a new realm</h1>
        </div>
      </div>
      <div className="pt-2">
        <div className="pb-4">
          <Input
            label="Name"
            placeholder="Name of your realm"
            value={form?.name}
            type="text"
            error={formErrors['name']}
            onChange={(evt) =>
              handleSetForm({
                name: evt.target.value,
              })
            }
          />
        </div>
        <div className="pb-4">
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
            <div className="pb-4">
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
            <div className="pb-4">
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
        <div className="pb-4">
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
        <div className="pb-4">
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
        <div className="pb-4">
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

        <div className="border-t border-fgd-4 flex justify-end mt-6 pt-6 space-x-4">
          <Button
            isLoading={isLoading}
            onClick={handleCreate}
            disabled={!form?.teamWallets?.length}
          >
            Create Realm
          </Button>
        </div>
      </div>
    </>
  )
}

export default CreateRealmForm
