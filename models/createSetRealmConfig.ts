import { PublicKey, TransactionInstruction } from '@solana/web3.js'
import {
  getTokenHoldingAddress,
  MintMaxVoteWeightSource,
  RealmConfigArgs,
} from './accounts'
import { SetRealmConfigArgs } from './instructions'
import { GOVERNANCE_SCHEMA } from './serialisation'
import { serialize } from 'borsh'
import BN from 'bn.js'

export async function createSetRealmConfig(
  programId: PublicKey,
  realm: PublicKey,
  realmAuthority: PublicKey,
  councilMint: PublicKey | undefined,
  communityMintMaxVoteWeightSource: MintMaxVoteWeightSource,
  minCommunityTokensToCreateGovernance: BN,
  communityVoterWeightAddin: PublicKey | undefined
) {
  const configArgs = new RealmConfigArgs({
    useCouncilMint: councilMint !== undefined,
    minCommunityTokensToCreateGovernance,
    communityMintMaxVoteWeightSource,
    useCommunityVoterWeightAddin: communityVoterWeightAddin !== undefined,
  })

  const args = new SetRealmConfigArgs({ configArgs })
  const data = Buffer.from(serialize(GOVERNANCE_SCHEMA, args))

  let keys = [
    {
      pubkey: realm,
      isWritable: true,
      isSigner: false,
    },

    {
      pubkey: realmAuthority,
      isWritable: false,
      isSigner: true,
    },
  ]

  if (councilMint) {
    const councilTokenHoldingAddress = await getTokenHoldingAddress(
      programId,
      realm,
      councilMint
    )

    keys = [
      ...keys,
      {
        pubkey: councilMint,
        isSigner: false,
        isWritable: false,
      },
      {
        pubkey: councilTokenHoldingAddress,
        isSigner: false,
        isWritable: true,
      },
    ]
  }

  return new TransactionInstruction({
    keys,
    programId,
    data,
  })
}
