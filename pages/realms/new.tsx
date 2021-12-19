import Link from 'next/link'
import { ArrowLeftIcon } from '@heroicons/react/outline'
import BN from 'bn.js'

import useQueryContext from '@hooks/useQueryContext'
import Input from '@components/inputs/Input'
import React, { useState } from 'react'
import Button from '@components/Button'
import { RpcContext } from '@models/core/api'
import { MintMaxVoteWeightSource } from 'models/accounts'
import { registerRealm } from 'actions/registerRealm'
import useWalletStore from 'stores/useWalletStore'
import { PublicKey } from '@solana/web3.js'
import { notify } from 'utils/notifications'
import * as yup from 'yup'
import { formValidation, isFormValid } from '@utils/formValidation'
import { ProgramAccount, tryGetMint } from 'utils/tokens'
import { MintInfo } from '@solana/spl-token'
import { ProgramVersion } from 'models/registry/constants'
import {
  formatMintNaturalAmountAsDecimal,
  getMintSupplyPercentageAsBN,
} from '@tools/sdk/units'
import { DEFAULT_GOVERNANCE_PROGRAM_ID } from '@components/instructions/tools'
import { useRouter } from 'next/router'

const publicKeyValidationTest = (value) => {
  try {
    if (!value) return false
    new PublicKey(value)
    return true
  } catch (e) {
    return false
  }
}

const schema = yup.object().shape({
  governanceProgramId: yup
    .string()
    .required('Governance program id is required')
    .test(
      'is-public-key',
      'Governance program id is not a valid public key',
      publicKeyValidationTest
    ),
  name: yup.string().required('Name is required'),
  communityMintId: yup
    .string()
    .required('Community token mint is required')
    .test(
      'is-public-key',
      'Community token mint id is not a valid public key',
      publicKeyValidationTest
    ),
  communityMint: yup.object().required('Community token mint is not valid'),
  councilMintId: yup
    .string()
    .test(
      'is-public-key',
      'Council token mint id is not a valid public key',
      (value) => (value ? publicKeyValidationTest(value) : true)
    ),
  councilMint: yup.object().when('councilMintId', {
    is: (value) => value,
    then: yup.object().required('Council token mint is not valid'),
  }),
})

const New = () => {
  const { fmtUrlWithCluster } = useQueryContext()
  const wallet = useWalletStore((s) => s.current)
  const connection = useWalletStore((s) => s.connection)

  const [form, setForm] = useState<{
    governanceProgramId: string
    name: string
    communityMintId: string
    communityMint: ProgramAccount<MintInfo> | undefined
    councilMintId: string | undefined
    councilMint: ProgramAccount<MintInfo> | undefined
    programVersion: ProgramVersion
    communityMintMaxVoteWeightSource: number
    minCommunityTokensToCreateGovernance: BN
  }>({
    governanceProgramId: DEFAULT_GOVERNANCE_PROGRAM_ID,
    name: '',
    communityMintId: '',
    communityMint: undefined,
    councilMintId: undefined,
    councilMint: undefined,
    programVersion: 1,
    communityMintMaxVoteWeightSource: 1,
    minCommunityTokensToCreateGovernance: new BN(1000000),
  })
  const [formErrors, setFormErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [realmAddress, setRealmAddress] = useState<PublicKey | undefined>(
    undefined
  )
  const router = useRouter()

  const handleSetForm = (newValues) => {
    setFormErrors({})
    setForm({ ...form, ...newValues })
  }

  const handleCreate = async () => {
    setFormErrors({})
    setIsLoading(true)
    const { isValid, validationErrors }: formValidation = await isFormValid(
      schema,
      form
    )

    if (isValid) {
      const rpcContext = new RpcContext(
        new PublicKey(form.governanceProgramId),
        form.programVersion,
        wallet,
        connection.current,
        connection.endpoint
      )

      try {
        const realmAddress = await registerRealm(
          rpcContext,
          form.name,
          new PublicKey(form.communityMintId),
          form.councilMintId ? new PublicKey(form.councilMintId) : undefined,
          MintMaxVoteWeightSource.FULL_SUPPLY_FRACTION,
          form.minCommunityTokensToCreateGovernance
        )

        // When the default governance program is used then navigate to the uncharted realm
        if (
          rpcContext.programId.equals(
            new PublicKey(DEFAULT_GOVERNANCE_PROGRAM_ID)
          )
        ) {
          const url = fmtUrlWithCluster(`/dao/${realmAddress}/`)
          router.push(url)
        } else {
          // If custom programId then show the configuration message
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

  const handleCommunityMint = async (mintId) => {
    handleSetForm({
      communityMintId: mintId,
      communityMint: undefined,
    })
    try {
      const mintPublicKey = new PublicKey(mintId)
      const mint = await tryGetMint(connection.current, mintPublicKey)

      if (mint) {
        const supply = mint.account.supply
        if (supply.gt(new BN(0))) {
          handleSetForm({
            minCommunityTokensToCreateGovernance: BN.max(
              new BN(1),
              getMintSupplyPercentageAsBN(mint.account, 1)
            ),
            communityMintId: mintId,
            communityMint: mint,
          })
        } else {
          handleSetForm({
            communityMint: mint,
            communityMintId: mintId,
          })
        }
      }
    } catch (e) {
      console.log('failed to set community mint', e)
    }
  }

  const handleCouncilMint = async (mintId) => {
    handleSetForm({
      councilMintId: mintId,
      councilMint: undefined,
    })
    try {
      const mintPublicKey = new PublicKey(mintId)
      const mint = await tryGetMint(connection.current, mintPublicKey)
      if (mint) {
        handleSetForm({
          councilMintId: mintId,
          councilMint: mint,
        })
      }
    } catch (e) {
      console.log('failed to set council mint', e)
    }
  }

  return (
    <div
      className={`bg-bkg-2 col-span-12 md:col-span-7 md:order-first lg:col-span-8 order-last p-4 md:p-6 rounded-lg space-y-3 ${
        isLoading ? 'pointer-events-none' : ''
      }`}
    >
      <>
        <Link href={fmtUrlWithCluster('/realms')}>
          <a className="flex items-center text-fgd-3 text-sm transition-all hover:text-fgd-1">
            <ArrowLeftIcon className="h-4 w-4 mr-1 text-primary-light" />
            Back
          </a>
        </Link>
        {realmAddress ? (
          <>
            <div className="border-b border-fgd-4 pb-4 pt-2">
              <div className="flex items-center justify-between">
                <h1>Realm created succesfully!</h1>
              </div>
            </div>
            <div>
              <div className="pb-5">
                Details about your realm here. These can be added manually to
                your local registry of realms similar to here
                <div>
                  <a
                    target="_blank"
                    href="https://github.com/solana-labs/governance-ui/blob/main/public/realms/mainnet-beta.json"
                    rel="noreferrer"
                  >
                    https://github.com/solana-labs/governance-ui/blob/main/public/realms/mainnet-beta.json
                  </a>
                </div>
                <div>This is a temporary solution.</div>
              </div>
              <div>
                <div className="pt-2">
                  <div className="pb-0.5 text-fgd-3 text-xs">
                    Governance Program Id
                  </div>
                  <div className="text-xs">{form.governanceProgramId}</div>
                </div>
                <div className="pt-2">
                  <div className="pb-0.5 text-fgd-3 text-xs">Realm Id</div>
                  <div className="text-xs">{realmAddress.toBase58()}</div>
                </div>
              </div>
            </div>
          </>
        ) : (
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
              <div className="pb-4">
                <Input
                  label="Community Mint Id"
                  placeholder="Community mint id of this realm"
                  value={form.communityMintId}
                  type="text"
                  error={
                    formErrors['communityMintId'] || formErrors['communityMint']
                  }
                  onChange={(evt) => handleCommunityMint(evt.target.value)}
                />
                {form.communityMint && (
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
              {form.communityMint && (
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
                  value={form.councilMintId}
                  type="text"
                  error={
                    formErrors['councilMintId'] || formErrors['councilMint']
                  }
                  onChange={(evt) => handleCouncilMint(evt.target.value)}
                />
              </div>
              <div className="pb-4">
                <Input
                  label="Governance Program Id"
                  placeholder="Id of the governance program this realm will be associated with"
                  value={form.governanceProgramId}
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
                  value={form.programVersion}
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
                <Button isLoading={isLoading} onClick={() => handleCreate()}>
                  Create Realm
                </Button>
              </div>
            </div>
          </>
        )}
      </>
    </div>
  )
}

export default New
