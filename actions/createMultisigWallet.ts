import { Connection, PublicKey } from '@solana/web3.js'

import {
  sendTransactionsV2,
  SequenceType,
  transactionInstructionsToTypedInstructionsSets,
  WalletSigner,
} from 'utils/sendTransactions'
import { chunks } from '@utils/helpers'

import { prepareRealmCreation } from '@tools/governance/prepareRealmCreation'
import {
  GoverningTokenConfigAccountArgs,
  GoverningTokenType,
} from '@solana/spl-governance'

/// Creates multisig realm with community mint with 0 supply
/// and council mint used as multisig token
interface MultisigWallet {
  connection: Connection
  wallet: WalletSigner
  programIdAddress: string

  realmName: string
  councilYesVotePercentage: number
  councilWalletPks: PublicKey[]
}

export default async function createMultisigWallet({
  connection,
  wallet,
  programIdAddress,
  realmName,

  councilYesVotePercentage,
  councilWalletPks,
}: MultisigWallet) {
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
    tokensToGovernThreshold: undefined,

    existingCommunityMintPk: undefined,
    communityMintSupplyFactor: undefined,
    transferCommunityMintAuthority: true,
    communityYesVotePercentage: 'disabled',

    createCouncil: true,
    existingCouncilMintPk: undefined,
    transferCouncilMintAuthority: true,
    councilWalletPks,
    councilYesVotePercentage,

    communityTokenConfig: new GoverningTokenConfigAccountArgs({
      tokenType: GoverningTokenType.Dormant,
      voterWeightAddin: undefined,
      maxVoterWeightAddin: undefined,
    }),
    councilTokenConfig: new GoverningTokenConfigAccountArgs({
      tokenType: GoverningTokenType.Membership,
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
    console.log('CREATE MULTISIG WALLET: sending transactions')
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
