import { useState } from 'react'
import { useRouter } from 'next/router'
import { PublicKey } from '@solana/web3.js'

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
import {
  GoverningTokenConfigAccountArgs,
  GoverningTokenType,
} from '@solana/spl-governance'
import useWalletOnePointOh from '@hooks/useWalletOnePointOh'
import useLegacyConnectionContext from '@hooks/useLegacyConnectionContext'

export const FORM_NAME = 'multisig'

type MultisigForm = BasicDetails &
  InviteMembers &
  CouncilYesVotePercentage & { _programVersion: 2 | 3 }

const transformMultisigForm2RealmCreation = ({ ...formData }: MultisigForm) => {
  const programIdAddress = formData?.programId || DEFAULT_GOVERNANCE_PROGRAM_ID

  const sharedParams = {
    programIdAddress,

    realmName: formData.name,
    tokensToGovernThreshold: undefined,

    existingCommunityMintPk: undefined,
    transferCommunityMintAuthority: true,
    communityYesVotePercentage: 'disabled',

    // (useSupplyFactor = true && communityMintSupplyFactor = undefined) => FULL_SUPPLY_FRACTION
    useSupplyFactor: true,
    communityMintSupplyFactor: undefined,
    communityAbsoluteMaxVoteWeight: undefined,

    createCouncil: true,
    existingCouncilMintPk: undefined,
    transferCouncilMintAuthority: true,
    councilWalletPks: formData.memberAddresses.map((w) => new PublicKey(w)),
  }
  const discriminatedParams =
    formData._programVersion === 3
      ? ({
          _programVersion: 3,
          communityYesVotePercentage: 'disabled',
          councilYesVotePercentage: formData.councilYesVotePercentage,
          councilTokenConfig: new GoverningTokenConfigAccountArgs({
            tokenType: GoverningTokenType.Membership,
            voterWeightAddin: undefined,
            maxVoterWeightAddin: undefined,
          }),
          communityTokenConfig: new GoverningTokenConfigAccountArgs({
            tokenType: GoverningTokenType.Dormant,
            voterWeightAddin: undefined,
            maxVoterWeightAddin: undefined,
          }),
        } as const)
      : ({
          _programVersion: 2,
          communityYesVotePercentage: formData.councilYesVotePercentage,
          communityTokenConfig: new GoverningTokenConfigAccountArgs({
            tokenType: GoverningTokenType.Liquid,
            voterWeightAddin: undefined,
            maxVoterWeightAddin: undefined,
          }),
        } as const)

  return {
    ...sharedParams,
    ...discriminatedParams,
  }
}

export default function MultiSigWizard() {
  const connection = useLegacyConnectionContext()
  const wallet = useWalletOnePointOh()
  const connected = !!wallet?.connected
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
      Form: InviteMembersForm,
      schema: InviteMembersSchema,
      required: () => true,
    },
    {
      Form: YesVotePercentageForm,
      schema: CouncilYesVotePercentageSchema,
      required: () => true,
      forCouncil: true,
      title: `Next, set your wallet's approval threshold.`,
    },
  ]

  async function handleSubmit(formData: MultisigForm) {
    console.log('submit clicked')
    setRequestPending(true)

    if (formData._programVersion !== 3 && formData._programVersion !== 2)
      throw new Error('Could not verify version of supplied programId')

    try {
      console.log('connection', connected, wallet)
      if (!connected) {
        if (wallet) await wallet.connect()
      }
      if (!wallet?.publicKey) {
        throw new Error('No valid wallet connected')
      }

      const results = await createMultisigWallet({
        wallet,
        connection: connection.current,
        ...transformMultisigForm2RealmCreation(formData),
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
