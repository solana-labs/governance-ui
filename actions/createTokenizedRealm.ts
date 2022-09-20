import { Connection, PublicKey } from '@solana/web3.js'

import {
  sendTransactionsV2,
  transactionInstructionsToTypedInstructionsSets,
  SequenceType,
  WalletSigner,
} from 'utils/sendTransactions'
import { chunks } from '@utils/helpers'

import { prepareRealmCreation } from '@tools/governance/prepareRealmCreation'
import {
  GoverningTokenConfigAccountArgs,
  GoverningTokenType,
} from '@solana/spl-governance'

interface TokenizedRealm {
  connection: Connection
  wallet: WalletSigner
  programIdAddress: string

  realmName: string
  tokensToGovernThreshold: number | undefined

  communityYesVotePercentage: number
  existingCommunityMintPk: PublicKey | undefined
  transferCommunityMintAuthority: boolean | undefined
  communityMintSupplyFactor: number | undefined

  createCouncil: boolean
  existingCouncilMintPk: PublicKey | undefined
  transferCouncilMintAuthority: boolean | undefined
  councilWalletPks: PublicKey[]
  councilYesVotePercentage: 'disabled' | number
}

export default async function createTokenizedRealm({
  connection,
  wallet,
  programIdAddress,
  realmName,
  tokensToGovernThreshold,

  existingCommunityMintPk,
  transferCommunityMintAuthority = true,
  communityYesVotePercentage,
  communityMintSupplyFactor: rawCMSF,

  createCouncil = false,
  councilYesVotePercentage = 'disabled',
  existingCouncilMintPk,
  transferCouncilMintAuthority = true,
  // councilYesVotePercentage,
  councilWalletPks,
}: TokenizedRealm) {
  const {
    communityMintPk,
    councilMintPk,
    realmPk,
    realmInstructions,
    realmSigners,
    mintsSetupInstructions,
    mintsSetupSigners,
    councilMembersInstructions,
  } = await prepareRealmCreation({
    connection,
    wallet,
    programIdAddress,

    realmName,
    tokensToGovernThreshold,

    existingCommunityMintPk,
    communityMintSupplyFactor: rawCMSF,
    transferCommunityMintAuthority,
    communityYesVotePercentage,

    createCouncil,
    councilYesVotePercentage,
    existingCouncilMintPk,
    transferCouncilMintAuthority,
    councilWalletPks,
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
  })

  try {
    const councilMembersChunks = chunks(councilMembersInstructions, 10)
    // only walletPk needs to sign the minting instructions and it's a signer by default and we don't have to include any more signers
    const councilMembersSignersChunks = Array(councilMembersChunks.length).fill(
      []
    )
    console.log('CREATE GOV TOKEN REALM: sending transactions')
    const tx = await sendTransactionsV2({
      connection,
      showUiComponent: true,
      wallet,
      signersSet: [
        mintsSetupSigners,
        ...councilMembersSignersChunks,
        realmSigners,
      ],
      TransactionInstructions: [
        mintsSetupInstructions,
        ...councilMembersChunks,
        realmInstructions,
      ].map((x) =>
        transactionInstructionsToTypedInstructionsSets(
          x,
          SequenceType.Sequential
        )
      ),
    })

    return {
      tx,
      realmPk,
      communityMintPk,
      councilMintPk,
    }
  } catch (ex) {
    console.error(ex)
    throw ex
  }
}
