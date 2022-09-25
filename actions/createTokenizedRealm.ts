import { Connection, PublicKey } from '@solana/web3.js'

import {
  sendTransactionsV2,
  transactionInstructionsToTypedInstructionsSets,
  SequenceType,
  WalletSigner,
} from 'utils/sendTransactions'
import { chunks } from '@utils/helpers'

import { prepareRealmCreation } from '@tools/governance/prepareRealmCreation'

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
    transferCommunityMintAuthority,
    communityYesVotePercentage,

    useSupplyFactor,
    communityMintSupplyFactor: rawCMSF,
    communityAbsoluteMaxVoteWeight,

    createCouncil,
    existingCouncilMintPk,
    transferCouncilMintAuthority,
    councilWalletPks,
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
