import { useState } from 'react'
import { useRouter } from 'next/router'

import { getGovernanceProgramVersion } from '@solana/spl-governance'
import { PublicKey } from '@solana/web3.js'
import useWalletStore from 'stores/useWalletStore'
import { createGovTokenRealm } from 'actions/createGovTokenRealm'
import useQueryContext from '@hooks/useQueryContext'
import useLocalStorageState from '@hooks/useLocalStorageState'
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
  // CouncilYesVotePercentageSchema,
  // CouncilYesVotePercentage,
} from '@components/NewRealmWizard/components/steps/YesVotePercentageThresholdForm'
import AddCouncilForm, {
  AddCouncilSchema,
  AddCouncil,
} from '@components/NewRealmWizard/components/steps/AddCouncilForm'
import InviteMembersForm, {
  InviteMembersSchema,
  InviteMembers,
} from '@components/NewRealmWizard/components/steps/InviteMembersForm'

export const SESSION_STORAGE_FORM_KEY = 'govtoken-form-data'
export const FORM_NAME = 'gov-token'

type GovToken =
  | (BasicDetails &
      CommunityToken &
      CommunityYesVotePercentage &
      AddCouncil &
      InviteMembers)
  // CouncilYesVotePercentage)
  | Record<string, never>

export default function GovTokenWizard() {
  const [formData, setFormData] = useLocalStorageState<GovToken>(
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

  async function handleSubmit() {
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

      const results = await createGovTokenRealm({
        wallet,
        connection: connection.current,
        programId: governanceProgramId,
        programVersion,
        realmName: formData.name,
        // COMMUNITY INFO
        tokensToGovernThreshold:
          formData.minimumNumberOfCommunityTokensToGovern,
        communityMintSupplyFactor: formData.communityMintSupplyFactor,
        communityVotePercentage: formData.communityYesVotePercentage,
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
