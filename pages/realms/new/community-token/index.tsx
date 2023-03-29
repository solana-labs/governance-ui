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
  CouncilYesVotePercentageSchema,
} from '@components/NewRealmWizard/components/steps/YesVotePercentageThresholdForm'
import AddCouncilForm, {
  AddCouncilSchema,
  AddCouncil,
} from '@components/NewRealmWizard/components/steps/AddCouncilForm'
import InviteMembersForm, {
  InviteMembersSchema,
  InviteMembers,
} from '@components/NewRealmWizard/components/steps/InviteMembersForm'
import {
  GoverningTokenConfigAccountArgs,
  GoverningTokenType,
} from '@solana/spl-governance'
import useWalletGay from '@hooks/useWallet'

export const FORM_NAME = 'tokenized'

type CommunityTokenForm = BasicDetails &
  CommunityToken &
  CommunityYesVotePercentage &
  AddCouncil &
  InviteMembers

// All transformation of form data to business logical program inputs should occur here
const transformFormData2RealmCreation = (formData: CommunityTokenForm) => {
  const createCouncil = formData.addCouncil ?? false
  const existingCouncilMintPk = formData.councilTokenMintAddress
    ? new PublicKey(formData.councilTokenMintAddress)
    : undefined

  const programIdAddress = formData?.programId || DEFAULT_GOVERNANCE_PROGRAM_ID

  const params = {
    ...{
      programIdAddress,
      realmName: formData.name,
      // COMMUNITY INFO
      tokensToGovernThreshold: formData.minimumNumberOfCommunityTokensToGovern,
      useSupplyFactor: formData.useSupplyFactor,
      communityAbsoluteMaxVoteWeight: formData.communityAbsoluteMaxVoteWeight,
      communityMintSupplyFactor: formData.communityMintSupplyFactor,
      communityYesVotePercentage: formData.communityYesVotePercentage,
      existingCommunityMintPk: formData.communityTokenMintAddress
        ? new PublicKey(formData.communityTokenMintAddress)
        : undefined,
      transferCommunityMintAuthority:
        formData.transferCommunityMintAuthority ?? true,
      // COUNCIL INFO
      createCouncil: formData.addCouncil ?? false,

      existingCouncilMintPk: formData.councilTokenMintAddress
        ? new PublicKey(formData.councilTokenMintAddress)
        : undefined,
      transferCouncilMintAuthority:
        formData.transferCouncilMintAuthority ?? true,
      councilWalletPks:
        formData?.memberAddresses?.map((w) => new PublicKey(w)) || [],
    },
    ...(formData._programVersion === 3
      ? ({
          _programVersion: 3,
          councilYesVotePercentage: formData.councilYesVotePercentage,
          councilTokenConfig:
            createCouncil || existingCouncilMintPk
              ? new GoverningTokenConfigAccountArgs({
                  tokenType: GoverningTokenType.Membership,
                  voterWeightAddin: undefined,
                  maxVoterWeightAddin: undefined,
                })
              : new GoverningTokenConfigAccountArgs({
                  tokenType: GoverningTokenType.Dormant,
                  voterWeightAddin: undefined,
                  maxVoterWeightAddin: undefined,
                }),
        } as const)
      : ({ _programVersion: 2 } as const)),
  } as const

  return params
}

export default function CommunityTokenWizard() {
  const connected = useWalletStore((s) => s.connected)
  const connection = useWalletStore((s) => s.connection)
  const wallet = useWalletGay()
  const { push } = useRouter()
  const { fmtUrlWithCluster } = useQueryContext()
  const [requestPending, setRequestPending] = useState(false)
  const steps = [
    {
      Form: BasicDetailsForm,
      schema: BasicDetailsSchema,
      required: () => true,
    },
    {
      Form: CommunityTokenDetailsForm,
      schema: CommunityTokenSchema,
      required: () => true,
    },
    {
      Form: YesVotePercentageForm,
      schema: CommunityYesVotePercentageSchema,
      required: () => true,
      forCommunity: true,
      title: "Next, set your DAO's community approval threshold.",
    },
    { Form: AddCouncilForm, schema: AddCouncilSchema, required: () => true },
    {
      Form: InviteMembersForm,
      schema: InviteMembersSchema,
      required: (form: CommunityTokenForm) => form.addCouncil,
    },
    {
      Form: YesVotePercentageForm,
      schema: CouncilYesVotePercentageSchema,
      required: (form: CommunityTokenForm) =>
        form.addCouncil && form._programVersion >= 3,
      forCouncil: true,
      title: "Next, set your DAO's council approval threshold.",
    },
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

      const results = await createTokenizedRealm({
        wallet,
        connection: connection.current,
        ...transformFormData2RealmCreation(formData),
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
