import Button from 'components/Button'
import Input from 'components/inputs/Input'
import PreviousRouteBtn from 'components/PreviousRouteBtn'
import Tooltip from 'components/Tooltip'
import useQueryContext from 'hooks/useQueryContext'
import useRealm from 'hooks/useRealm'
import { RpcContext } from 'models/core/api'
import { PublicKey } from '@solana/web3.js'
import { tryParseKey } from 'tools/validators/pubkey'
import { isFormValid } from 'utils/formValidation'
import { getGovernanceConfig } from 'utils/GovernanceTools'
import { notify } from 'utils/notifications'
import { tryGetMint } from 'utils/tokens'
import { useRouter } from 'next/router'
import React, { useState } from 'react'
import useWalletStore from 'stores/useWalletStore'
import * as yup from 'yup'
import BaseGovernanceForm, {
  BaseGovernanceFormFields,
} from './BaseGovernanceForm'
import { registerGovernance } from 'actions/registerGovernance'
import { GovernanceType } from 'models/enums'
import Switch from 'components/Switch'
interface NewProgramForm extends BaseGovernanceFormFields {
  programId: string
  transferAuthority: boolean
}

const defaultFormValues = {
  programId: '',
  minCommunityTokensToCreateProposal: 100,
  minInstructionHoldUpTime: 0,
  maxVotingTime: 3,
  voteThreshold: 60,
  transferAuthority: true,
}
const NewProgramForm = () => {
  const router = useRouter()
  const { fmtUrlWithCluster } = useQueryContext()
  const {
    realmInfo,
    realm,
    mint: realmMint,
    symbol,
    ownVoterWeight,
  } = useRealm()
  const wallet = useWalletStore((s) => s.current)
  const connection = useWalletStore((s) => s.connection)
  const connected = useWalletStore((s) => s.connected)
  const { fetchRealm } = useWalletStore((s) => s.actions)
  const [form, setForm] = useState<NewProgramForm>({
    ...defaultFormValues,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [formErrors, setFormErrors] = useState({})
  const tokenOwnerRecord = ownVoterWeight.canCreateGovernanceUsingCouncilTokens()
    ? ownVoterWeight.councilTokenRecord
    : realm && ownVoterWeight.canCreateGovernanceUsingCommunityTokens(realm)
    ? ownVoterWeight.communityTokenRecord
    : undefined

  const handleSetForm = ({ propertyName, value }) => {
    setFormErrors({})
    setForm({ ...form, [propertyName]: value })
  }
  const handleCreate = async () => {
    try {
      if (!realm) {
        throw 'No realm selected'
      }
      if (!connected) {
        throw 'Please connect your wallet'
      }
      if (!tokenOwnerRecord) {
        throw "You don't have enough governance power to create a new treasury account"
      }
      const { isValid, validationErrors } = await isFormValid(schema, form)
      setFormErrors(validationErrors)
      if (isValid && realmMint) {
        setIsLoading(true)
        const rpcContext = new RpcContext(
          new PublicKey(realm.account.owner.toString()),
          realmInfo?.programVersion,
          wallet,
          connection.current,
          connection.endpoint
        )

        const governanceConfigValues = {
          minTokensToCreateProposal: form.minCommunityTokensToCreateProposal,
          minInstructionHoldUpTime: form.minInstructionHoldUpTime,
          maxVotingTime: form.maxVotingTime,
          voteThresholdPercentage: form.voteThreshold,
          mintDecimals: realmMint.decimals,
        }
        const governanceConfig = getGovernanceConfig(governanceConfigValues)
        await registerGovernance(
          rpcContext,
          GovernanceType.Program,
          realm.pubkey,
          new PublicKey(form.programId),
          governanceConfig,
          form.transferAuthority,
          tokenOwnerRecord!.pubkey
        )
        setIsLoading(false)
        fetchRealm(realmInfo!.programId, realmInfo!.realmId)
        router.push(fmtUrlWithCluster(`/dao/${symbol}/`))
      }
    } catch (e) {
      //TODO how do we present errors maybe something more generic ?
      notify({
        type: 'error',
        message: `Can't create governance`,
        description: `Transaction error ${e}`,
      })
      setIsLoading(false)
    }
  }

  const schema = yup.object().shape({
    programId: yup
      .string()
      .test(
        'programIdTest',
        'program id validation error',
        async function (val: string) {
          if (val) {
            try {
              const pubKey = tryParseKey(val)
              if (!pubKey) {
                return this.createError({
                  message: `Invalid account address`,
                })
              }

              const accountData = await connection.current.getParsedAccountInfo(
                pubKey
              )
              if (!accountData || !accountData.value) {
                return this.createError({
                  message: `Account not found`,
                })
              }
              return true
            } catch (e) {
              return this.createError({
                message: `Invalid account address`,
              })
            }
          } else {
            return this.createError({
              message: `Program id is required`,
            })
          }
        }
      ),
  })

  return (
    <div className="space-y-3">
      <PreviousRouteBtn />
      <div className="border-b border-fgd-4 pb-4 pt-2">
        <div className="flex items-center justify-between">
          <h1>Create new program </h1>
        </div>
      </div>
      <Input
        label="Program id"
        value={form.programId}
        type="text"
        onChange={(evt) =>
          handleSetForm({
            value: evt.target.value,
            propertyName: 'programId',
          })
        }
        error={formErrors['programId']}
      />
      <div className="text-sm mb-3">
        <div className="mb-2">Transfer upgrade authority to governance</div>
        <div className="flex flex-row text-xs items-center">
          <Switch
            checked={form.transferAuthority}
            onChange={(checked) =>
              handleSetForm({
                value: checked,
                propertyName: 'transferAuthority',
              })
            }
          />
        </div>
      </div>
      <BaseGovernanceForm
        formErrors={formErrors}
        form={form}
        setForm={setForm}
        setFormErrors={setFormErrors}
      ></BaseGovernanceForm>
      <div className="border-t border-fgd-4 flex justify-end mt-6 pt-6 space-x-4">
        <Tooltip content={!connected && 'Please connect your wallet'}>
          <Button
            disabled={!connected || isLoading}
            isLoading={isLoading}
            onClick={handleCreate}
          >
            Create
          </Button>
        </Tooltip>
      </div>
    </div>
  )
}

export default NewProgramForm
