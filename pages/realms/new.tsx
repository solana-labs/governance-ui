import Link from 'next/link'
import { ArrowLeftIcon } from '@heroicons/react/outline'
import BN from 'bn.js'

import useQueryContext from '@hooks/useQueryContext'
import Input from '@components/inputs/Input'
import React, { useEffect, useState } from 'react'
import Button from '@components/Button'
import { RpcContext } from '@models/core/api'
import { MintMaxVoteWeightSource } from 'models/accounts'
import { registerRealm } from 'actions/registerRealm'
import useWalletStore from 'stores/useWalletStore'
import { PublicKey } from '@solana/web3.js'
import { notify } from 'utils/notifications'
import * as yup from 'yup'
import { formValidation, isFormValid } from '@utils/formValidation'
import { useRouter } from 'next/router'
import { ComponentInstructionData } from '@utils/uiTypes/proposalCreationTypes'
import useInstructions from '@hooks/useInstructions'

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
  communityTokenMint: yup
    .string()
    .required('Community token mint is required')
    .test(
      'is-public-key',
      'Community token mint id is not a valid public key',
      publicKeyValidationTest
    ),
})

const New = () => {
  const router = useRouter()
  const { fmtUrlWithCluster } = useQueryContext()
  const { getAvailableInstructions } = useInstructions()
  const availableInstructions = getAvailableInstructions()

  const wallet = useWalletStore((s) => s.current)
  const connection = useWalletStore((s) => s.connection)

  const [form, setForm] = useState({
    governanceProgramId: '',
    name: '',
    communityTokenMint: '',
    councilMint: '',
    programVersion: 1,
    communityMintMaxVoteWeightSource: 0.5,
    minCommunityTokensToCreateGovernance: 0.001,
  })
  const [formErrors, setFormErrors] = useState({})
  const [instructionsData, setInstructions] = useState<
    ComponentInstructionData[]
  >([{ type: availableInstructions[0] }])
  const [isLoading, setIsLoading] = useState(false)

  const handleSetForm = ({ propertyName, value }) => {
    setFormErrors({})
    setForm({ ...form, [propertyName]: value })
  }

  const handleCreate = async () => {
    if (!connection) return
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
        await registerRealm(
          rpcContext,
          form.name,
          new PublicKey(form.communityTokenMint),
          form.councilMint ? new PublicKey(form.councilMint) : undefined,
          MintMaxVoteWeightSource.FULL_SUPPLY_FRACTION,
          new BN(form.minCommunityTokensToCreateGovernance)
        )
        const url = fmtUrlWithCluster(`/realms`)
        router.push(url)
      } catch (ex) {
        console.log(ex)
        notify({ type: 'error', message: `${ex}` })
      }
    } else {
      setFormErrors(validationErrors)
    }
    setIsLoading(false)
  }

  useEffect(() => {
    setInstructions([instructionsData[0]])
  }, [instructionsData[0]])

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
        <div className="border-b border-fgd-4 pb-4 pt-2">
          <div className="flex items-center justify-between">
            <h1>Create a new realm</h1>
          </div>
        </div>
        <div className="pt-2">
          <div className="pb-4">
            <Input
              label="Governance Program Id"
              placeholder="Id of the governance program this realm will be associated with"
              value={form.governanceProgramId}
              type="text"
              error={formErrors['governanceProgramId']}
              onChange={(evt) =>
                handleSetForm({
                  value: evt.target.value,
                  propertyName: 'governanceProgramId',
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
                  value: evt.target.value,
                  propertyName: 'programVersion',
                })
              }
            />
          </div>
          <div className="pb-4">
            <Input
              label="Name"
              placeholder="Name of your realm"
              value={form.name}
              type="text"
              error={formErrors['name']}
              onChange={(evt) =>
                handleSetForm({
                  value: evt.target.value,
                  propertyName: 'name',
                })
              }
            />
          </div>
          <div className="pb-4">
            <Input
              label="Community Mint Id"
              placeholder="Community mint id of this realm"
              value={form.communityTokenMint}
              type="text"
              error={formErrors['communityTokenMint']}
              onChange={(evt) =>
                handleSetForm({
                  value: evt.target.value,
                  propertyName: 'communityTokenMint',
                })
              }
            />
          </div>
          <div className="pb-4">
            <Input
              label="Council Mint Id"
              placeholder="(Optional) Council mint"
              value={form.councilMint}
              type="text"
              error={formErrors['councilMint']}
              onChange={(evt) =>
                handleSetForm({
                  value: evt.target.value,
                  propertyName: 'councilMint',
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
                  value: evt.target.value,
                  propertyName: 'communityMintMaxVoteWeightSource',
                })
              }
            />
          </div>
          <div className="pb-4">
            <Input
              label="Min community tokens to create governance"
              placeholder="Min community tokens to create governance"
              step="0.01"
              value={form.minCommunityTokensToCreateGovernance}
              type="number"
              error={formErrors['minCommunityTokensToCreateGovernance']}
              onChange={(evt) =>
                handleSetForm({
                  value: evt.target.value,
                  propertyName: 'minCommunityTokensToCreateGovernance',
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
    </div>
  )
}

export default New
