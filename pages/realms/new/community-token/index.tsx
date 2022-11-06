import { useState } from 'react'
import { useRouter } from 'next/router'

import { PublicKey } from '@solana/web3.js'
import useWalletStore from 'stores/useWalletStore'
import createTokenizedRealm from 'actions/createTokenizedRealm'
import useQueryContext from '@hooks/useQueryContext'

import { DEFAULT_GOVERNANCE_PROGRAM_ID } from '@components/instructions/tools'

import { notify } from '@utils/notifications'

import FormPage from '@components/NewRealmWizard/PageTemplate'
import BasicDetailsForm, {
  BasicDetailsSchema,
  BasicDetails,
} from '@components/NewRealmWizard/components/steps/BasicDetailsForm'
import CommunityTokenDetailsForm, {
  CommunityTokenSchema,
  CommunityToken,
} from '@components/NewRealmWizard/components/steps/CommunityTokenDetailsForm'
import YesVotePercentageForm, {
  CommunityYesVotePercentageSchema,
  CommunityYesVotePercentage,
} from '@components/NewRealmWizard/components/steps/YesVotePercentageThresholdForm'
import AddCouncilForm, {
  AddCouncilSchema,
  AddCouncil,
} from '@components/NewRealmWizard/components/steps/AddCouncilForm'
import InviteMembersForm, {
  InviteMembersSchema,
  InviteMembers,
} from '@components/NewRealmWizard/components/steps/InviteMembersForm'
import { useProgramVersionByIdQuery } from '@hooks/queries/useProgramVersionQuery'

export const FORM_NAME = 'tokenized'

type CommunityTokenForm = BasicDetails &
  CommunityToken &
  CommunityYesVotePercentage &
  AddCouncil &
  InviteMembers

export default function CommunityTokenWizard() {
  const { connected, connection, current: wallet } = useWalletStore((s) => s)
  const { push } = useRouter()
  const { fmtUrlWithCluster } = useQueryContext()
  const [requestPending, setRequestPending] = useState(false)

  const steps = [
    { Form: BasicDetailsForm, schema: BasicDetailsSchema, required: 'true' },
    {
      Form: CommunityTokenDetailsForm,
      schema: CommunityTokenSchema,
      required: 'true',
    },
    {
      Form: YesVotePercentageForm,
      schema: CommunityYesVotePercentageSchema,
      required: 'true',
      forCommunity: true,
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
    //   required: 'true',
    //   forCouncil: true,
    // },
  ]

  async function handleSubmit(formData: CommunityTokenForm) {
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

      const results = await createTokenizedRealm({
        wallet,
        connection: connection.current,
        programIdAddress,
        realmName: formData.name,
        // COMMUNITY INFO
        tokensToGovernThreshold:
          formData.minimumNumberOfCommunityTokensToGovern,
        useSupplyFactor: formData.useSupplyFactor,
        communityAbsoluteMaxVoteWeight: formData.communityAbsoluteMaxVoteWeight,
        communityMintSupplyFactor: formData.communityMintSupplyFactor,
        communityYesVotePercentage: formData.communityYesVotePercentage,
        existingCommunityMintPk: formData.communityTokenMintAddress
          ? new PublicKey(formData.communityTokenMintAddress)
          : undefined,
        transferCommunityMintAuthority: formData.transferCommunityMintAuthority,
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
