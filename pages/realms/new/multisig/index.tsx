import { useState } from 'react'
import { useRouter } from 'next/router'
import { PublicKey } from '@solana/web3.js'

import useWalletStore from 'stores/useWalletStore'
import createMultisigWallet from 'actions/createMultisigWallet'

import useQueryContext from '@hooks/useQueryContext'

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
import YesVotePercentageForm, {
  CouncilYesVotePercentageSchema,
  CouncilYesVotePercentage,
} from '@components/NewRealmWizard/components/steps/YesVotePercentageThresholdForm'
import FormPage from '@components/NewRealmWizard/PageTemplate'

export const FORM_NAME = 'multisig'

type MultisigForm = BasicDetails & InviteMembers & CouncilYesVotePercentage

export default function MultiSigWizard() {
  const { connected, connection, current: wallet } = useWalletStore((s) => s)
  const { push } = useRouter()
  const { fmtUrlWithCluster } = useQueryContext()
  const [requestPending, setRequestPending] = useState(false)

  const steps = [
    { Form: BasicDetailsForm, schema: BasicDetailsSchema, required: 'true' },
    { Form: InviteMembersForm, schema: InviteMembersSchema, required: 'true' },
    {
      Form: YesVotePercentageForm,
      schema: CouncilYesVotePercentageSchema,
      required: 'true',
      forCouncil: true,
    },
  ]

  async function handleSubmit(formData: MultisigForm) {
    console.log('submit clicked')
    setRequestPending(true)
    try {
      console.log('connection', connected, wallet)
      if (!connected) {
        if (wallet) await wallet.connect()
      }
      if (!wallet?.publicKey) {
        throw new Error('No valid wallet connected')
      }

      const programIdAddress =
        formData?.programId || DEFAULT_GOVERNANCE_PROGRAM_ID

      const results = await createMultisigWallet({
        wallet,
        connection: connection.current,
        programIdAddress,

        realmName: formData.name,
        councilYesVotePercentage: formData.councilYesVotePercentage,
        councilWalletPks: formData.memberAddresses.map((w) => new PublicKey(w)),
      })

      if (results) {
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
      autoInviteWallet
      type={FORM_NAME}
      steps={steps}
      handleSubmit={handleSubmit}
      submissionPending={requestPending}
    />
  )
}
