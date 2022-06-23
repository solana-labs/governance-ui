import { useState } from 'react'
import { useRouter } from 'next/router'
import { PublicKey } from '@solana/web3.js'
import createNFTRealm from 'actions/createNFTRealm'
import { DEFAULT_GOVERNANCE_PROGRAM_ID } from '@components/instructions/tools'

import useWalletStore from 'stores/useWalletStore'

import useQueryContext from '@hooks/useQueryContext'

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

import FormPage from '@components/NewRealmWizard/PageTemplate'

export const FORM_NAME = 'nft'

type NFTForm = BasicDetails & AddNFTCollection & AddCouncil & InviteMembers

export default function NFTWizard() {
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
  ]

  async function handleSubmit(formData: NFTForm) {
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

      const programIdAddress =
        formData?.programId || DEFAULT_GOVERNANCE_PROGRAM_ID

      const results = await createNFTRealm({
        wallet,
        connection: connection.current,
        programIdAddress,

        realmName: formData.name,
        collectionAddress: formData.collectionKey,
        collectionCount: formData.numberOfNFTs,
        tokensToGovernThreshold: 1, // 1 NFT 1 vote

        existingCommunityMintPk: undefined,
        communityYesVotePercentage: formData.communityYesVotePercentage,

        // COUNCIL INFO
        createCouncil: formData.addCouncil,
        // councilVotePercentage: formData.communityYesVotePercentage,
        existingCouncilMintPk: formData.councilTokenMintAddress
          ? new PublicKey(formData.councilTokenMintAddress)
          : undefined,
        transferCouncilMintAuthority: formData.transferCouncilMintAuthority,
        councilWalletPks:
          formData?.memberAddresses?.map((w) => new PublicKey(w)) || [],
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
      type={FORM_NAME}
      steps={steps}
      handleSubmit={handleSubmit}
      submissionPending={requestPending}
    />
  )
}
