import { useState } from 'react'
import { useRouter } from 'next/router'
import { PublicKey } from '@solana/web3.js'
import { getGovernanceProgramVersion } from '@solana/spl-governance'

import useWalletStore from 'stores/useWalletStore'
import { createMultisigRealm } from 'actions/createMultisigRealm'

import useQueryContext from '@hooks/useQueryContext'
import useLocalStorageState from '@hooks/useLocalStorageState'

import { notify } from '@utils/notifications'

import { DEFAULT_GOVERNANCE_PROGRAM_ID } from '@components/instructions/tools'

import BasicDetailsForm, {
  BasicDetailsSchema,
  BasicDetails,
} from '@components/NewRealmWizard/components/steps/BasicDetailsForm'
import InviteMembersForm, {
  InviteMembersSchema,
  InviteMembers,
} from '@components/NewRealmWizard/components/steps/InviteMembersForm'
import MemberQuorumThresholdForm, {
  MemberQuorumThresholdSchema,
  MemberQuorumThreshold,
} from '@components/NewRealmWizard/components/steps/MemberQuorumThresholdForm'
import FormPage from '@components/NewRealmWizard/PageTemplate'

export const SESSION_STORAGE_FORM_KEY = 'multisig-form-data'
export const FORM_NAME = 'multisig'

type MultisigForm =
  | (BasicDetails & InviteMembers & MemberQuorumThreshold)
  | Record<string, never>

export default function MultiSigWizard() {
  const [formData, setFormData] = useLocalStorageState<MultisigForm>(
    SESSION_STORAGE_FORM_KEY,
    {}
  )
  const { connected, connection, current: wallet } = useWalletStore((s) => s)
  const { push } = useRouter()
  const { fmtUrlWithCluster } = useQueryContext()
  const [requestPending, setRequestPending] = useState(false)

  const steps = [
    { Form: BasicDetailsForm, schema: BasicDetailsSchema, required: 'true' },
    { Form: InviteMembersForm, schema: InviteMembersSchema, required: 'true' },
    {
      Form: MemberQuorumThresholdForm,
      schema: MemberQuorumThresholdSchema,
      required: 'true',
    },
  ]

  async function handleSubmit() {
    console.log('submit clicked')
    try {
      console.log('connection', connected, wallet)
      if (!connected) {
        if (wallet) await wallet.connect()
      }
      if (!wallet?.publicKey) {
        throw new Error('No valid wallet connected')
      }

      const programId = formData?.programId || DEFAULT_GOVERNANCE_PROGRAM_ID
      const governanceProgramId = new PublicKey(programId)
      const programVersion = await getGovernanceProgramVersion(
        connection.current,
        governanceProgramId
      )
      console.log('CREATE REALM Program', {
        governanceProgramId: governanceProgramId.toBase58(),
        programVersion,
      })

      setRequestPending(true)
      const results = await createMultisigRealm(
        connection.current,
        governanceProgramId,
        programVersion,
        formData.name,
        formData.quorumThreshold,
        formData.memberAddresses.map((w) => new PublicKey(w)),
        wallet
      )

      if (results) {
        setFormData({})
        push(
          fmtUrlWithCluster(`/dao/${results.realmPk.toBase58()}`),
          undefined,
          { shallow: true }
        )
      } else {
        throw new Error('Something bad happened during this request.')
      }
    } catch (error) {
      setRequestPending(false)
      const err = error as Error
      console.log(error)
      return notify({
        type: 'error',
        message: err.message,
      })
    }
  }

  return (
    <FormPage
      type={FORM_NAME}
      ssFormKey={SESSION_STORAGE_FORM_KEY}
      steps={steps}
      handleSubmit={handleSubmit}
      submissionPending={requestPending}
    />
  )
}
