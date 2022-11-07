import { Connection, PublicKey } from '@solana/web3.js'

import {
  SequenceType,
  WalletSigner,
  txBatchesToInstructionSetWithSigners,
  sendTransactionsV3,
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

  useSupplyFactor: boolean
  communityMintSupplyFactor: number | undefined
  communityAbsoluteMaxVoteWeight: number | undefined

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

  communityYesVotePercentage,
  existingCommunityMintPk,
  transferCommunityMintAuthority = true,

  useSupplyFactor,
  communityMintSupplyFactor: rawCMSF,
  communityAbsoluteMaxVoteWeight,

  createCouncil = false,
  councilYesVotePercentage,
  existingCouncilMintPk,
  transferCouncilMintAuthority = true,
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
    transferCommunityMintAuthority,
    communityYesVotePercentage,

    useSupplyFactor,
    communityMintSupplyFactor: rawCMSF,
    communityAbsoluteMaxVoteWeight,

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

    const signers = [
      mintsSetupSigners,
      ...councilMembersSignersChunks,
      realmSigners,
    ]
    const txes = [
      mintsSetupInstructions,
      ...councilMembersChunks,
      realmInstructions,
    ].map((txBatch, batchIdx) => {
      return {
        instructionsSet: txBatchesToInstructionSetWithSigners(
          txBatch,
          signers,
          batchIdx
        ),
        sequenceType: SequenceType.Sequential,
      }
    })

    const tx = await sendTransactionsV3({
      connection,
      wallet,
      transactionInstructions: txes,
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
