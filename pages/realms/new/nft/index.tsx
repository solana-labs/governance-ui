import { useState } from 'react'
import { useRouter } from 'next/router'
import { PublicKey } from '@solana/web3.js'
import { getGovernanceProgramVersion } from '@solana/spl-governance'
import { createNFTRealm } from 'actions/createNFTRealm'
import { DEFAULT_GOVERNANCE_PROGRAM_ID } from '@components/instructions/tools'

import useWalletStore from 'stores/useWalletStore'

import useQueryContext from '@hooks/useQueryContext'
import useLocalStorageState from '@hooks/useLocalStorageState'

import { notify } from '@utils/notifications'

import BasicDetailsForm, {
  BasicDetailsSchema,
  BasicDetails,
} from '@components/NewRealmWizard/components/steps/BasicDetailsForm'
import AddNFTCollectionForm, {
  AddNFTCollectionSchema,
  AddNFTCollection,
} from '@components/NewRealmWizard/components/steps/AddNFTCollectionForm'
import AddCouncilForm, {
  AddCouncilSchema,
  AddCouncil,
} from '@components/NewRealmWizard/components/steps/AddCouncilForm'
import InviteMembersForm, {
  InviteMembersSchema,
  InviteMembers,
} from '@components/NewRealmWizard/components/steps/InviteMembersForm'
// import YesVotePercentageForm, {
//   CouncilYesVotePercentageSchema,
//   CouncilYesVotePercentage,
// } from '@components/NewRealmWizard/components/steps/YesVotePercentageThresholdForm'
import FormPage from '@components/NewRealmWizard/PageTemplate'

export const SESSION_STORAGE_FORM_KEY = 'nft-form-data'
export const FORM_NAME = 'nft'

type NFTForm =
  | (BasicDetails & AddNFTCollection & AddCouncil & InviteMembers)
  // CouncilYesVotePercentage)
  | Record<string, never>

export default function NFTWizard() {
  const [formData, setFormData] = useLocalStorageState<NFTForm>(
    SESSION_STORAGE_FORM_KEY,
    {}
  )
  const { connected, connection, current: wallet } = useWalletStore((s) => s)
  const { push } = useRouter()
  const { fmtUrlWithCluster } = useQueryContext()
  const [requestPending, setRequestPending] = useState(false)

  const steps = [
    { Form: BasicDetailsForm, schema: BasicDetailsSchema, required: 'true' },
    {
      Form: AddNFTCollectionForm,
      schema: AddNFTCollectionSchema,
      required: 'true',
    },
    { Form: AddCouncilForm, schema: AddCouncilSchema, required: 'true' },
    {
      Form: InviteMembersForm,
      schema: InviteMembersSchema,
      required: 'form.addCouncil',
    },
    // {
    //   Form: YesVotePercentageForm,
    //   schema: CouncilYesVotePercentageSchema,
    //   required: 'form.addCouncil',
    //   forCouncil: true,
    // },
  ]

  async function handleSubmit() {
    console.log('submit clicked')
    setRequestPending(true)

    try {
      console.log('connection', connected)
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

      const results = await createNFTRealm(
        connection.current,
        governanceProgramId,
        programVersion,
        formData.name,
        formData.collectionKey,
        formData.numberOfNFTs,
        1, // 1 NFT 1 vote
        formData.communityYesVotePercentage,
        formData?.memberAddresses?.map((w) => new PublicKey(w)) || [],
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
