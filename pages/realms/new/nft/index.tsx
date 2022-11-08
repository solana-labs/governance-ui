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
import {
  GoverningTokenConfigAccountArgs,
  GoverningTokenType,
} from '@solana/spl-governance'
import { nftPluginsPks } from '@hooks/useVotingPlugins'
import {
  RealmCreation,
  RealmCreationV2,
} from '@tools/governance/prepareRealmCreation'

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

  const programVersion: 2 | 3 = 2

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

      // All transformation of form data to business logical program inputs should occur here
      const params = {
        ...{
          programIdAddress,
          realmName: formData.name,
          collectionAddress: formData.collectionKey,
          nftCollectionCount: formData.numberOfNFTs,
          tokensToGovernThreshold: 1, // 1 NFT 1 vote

          existingCommunityMintPk: undefined,
          communityYesVotePercentage: formData.communityYesVotePercentage,

          // COUNCIL INFO
          createCouncil: formData.addCouncil ?? false,

          existingCouncilMintPk: formData.councilTokenMintAddress
            ? new PublicKey(formData.councilTokenMintAddress)
            : undefined,
          transferCouncilMintAuthority:
            formData.transferCouncilMintAuthority ?? true,
          councilWalletPks:
            formData?.memberAddresses?.map((w) => new PublicKey(w)) || [],
          transferCommunityMintAuthority: false, // delay this until we have created NFT instructions

          // (useSupplyFactor = true && communityMintSupplyFactor = undefined) => FULL_SUPPLY_FRACTION
          useSupplyFactor: true,
          communityMintSupplyFactor: undefined,
          communityAbsoluteMaxVoteWeight: undefined,
          communityTokenConfig: new GoverningTokenConfigAccountArgs({
            voterWeightAddin: new PublicKey(nftPluginsPks[0]),
            maxVoterWeightAddin: new PublicKey(nftPluginsPks[0]),
            tokenType: GoverningTokenType.Liquid,
          }),
        },
      }

      const results =
        formData._programVersion === 3
          ? await createNFTRealm({
              _programVersion: 3,
              wallet,
              connection: connection.current,
              ...params,
              councilYesVotePercentage: formData.councilYesVotePercentage,
              councilTokenConfig:
                params.createCouncil || params.existingCouncilMintPk
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
            })
          : await createNFTRealm({
              _programVersion: 2,
              wallet,
              connection: connection.current,
              ...params,
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
