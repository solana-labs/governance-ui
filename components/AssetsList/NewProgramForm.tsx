import Button from 'components/Button'
import Input from 'components/inputs/Input'
import PreviousRouteBtn from 'components/PreviousRouteBtn'
import Tooltip from 'components/Tooltip'
import useQueryContext from 'hooks/useQueryContext'
import useRealm from 'hooks/useRealm'
import { RpcContext } from '@solana/spl-governance'
import { PublicKey } from '@solana/web3.js'
import { tryParseKey } from 'tools/validators/pubkey'
import { isFormValid } from 'utils/formValidation'
import { getGovernanceConfig } from 'utils/GovernanceTools'
import { notify } from 'utils/notifications'
import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'
import useWalletStore from 'stores/useWalletStore'
import * as yup from 'yup'
import BaseGovernanceForm, {
  BaseGovernanceFormFields,
} from './BaseGovernanceForm'
import { registerProgramGovernance } from 'actions/registerProgramGovernance'
import { GovernanceType } from '@solana/spl-governance'
import Switch from 'components/Switch'
import { debounce } from '@utils/debounce'
import { MIN_COMMUNITY_TOKENS_TO_CREATE_W_0_SUPPLY } from '@tools/constants'
import { getProgramVersionForRealm } from '@models/registry/api'
import useVoteStakeRegistryClientStore from 'VoteStakeRegistry/stores/voteStakeRegistryClientStore'
interface NewProgramForm extends BaseGovernanceFormFields {
  programId: string
  transferAuthority: boolean
}

const defaultFormValues = {
  programId: '',
  // TODO: This is temp. fix to avoid wrong default for Multisig DAOs
  // This should be dynamic and set to 1% of the community mint supply or
  // MIN_COMMUNITY_TOKENS_TO_CREATE_W_0_SUPPLY when supply is 0
  minCommunityTokensToCreateProposal: MIN_COMMUNITY_TOKENS_TO_CREATE_W_0_SUPPLY,
  minInstructionHoldUpTime: 0,
  maxVotingTime: 3,
  voteThreshold: 60,
  transferAuthority: true,
}
const NewProgramForm = () => {
  const router = useRouter()
  const { fmtUrlWithCluster } = useQueryContext()
  const client = useVoteStakeRegistryClientStore((s) => s.state.client)
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
        throw "You don't have enough governance power to create a new program governance"
      }
      const { isValid, validationErrors } = await isFormValid(schema, form)
      setFormErrors(validationErrors)
      if (isValid && realmMint) {
        setIsLoading(true)

        const rpcContext = new RpcContext(
          new PublicKey(realm.owner.toString()),
          getProgramVersionForRealm(realmInfo!),
          wallet!,
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
        await registerProgramGovernance(
          rpcContext,
          GovernanceType.Program,
          realm,
          new PublicKey(form.programId),
          governanceConfig,
          form.transferAuthority,
          tokenOwnerRecord!.pubkey,
          client
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
  //if you altering this look at useEffect for form.programId
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
  useEffect(() => {
    if (form.programId) {
      //now validation contains only programId if more fields come it would be good to reconsider this method.
      debounce.debounceFcn(async () => {
        const { validationErrors } = await isFormValid(schema, form)
        setFormErrors(validationErrors)
      })
    }
  }, [form.programId])
  return (
    <div className="space-y-3">
      <PreviousRouteBtn />
      <div className="border-b border-fgd-4 pb-4 pt-2">
        <div className="flex items-center justify-between">
          <h1>Create new program governance </h1>
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
