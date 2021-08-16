import {
  PublicKey,
  SYSVAR_RENT_PUBKEY,
  TransactionInstruction,
} from '@solana/web3.js'
import { GOVERNANCE_SCHEMA } from './serialisation'
import { serialize } from 'borsh'
import { CreateRealmArgs } from './instructions'
import {
  RealmConfigArgs,
  GOVERNANCE_PROGRAM_SEED,
  MintMaxVoteWeightSource,
  getTokenHoldingAddress,
} from './accounts'
import BN from 'bn.js'

export async function withCreateRealm(
  instructions: TransactionInstruction[],
  programId: PublicKey,
  name: string,
  realmAuthority: PublicKey,
  communityMint: PublicKey,
  payer: PublicKey,
  councilMint: PublicKey | undefined,
  communityMintMaxVoteWeightSource: MintMaxVoteWeightSource,
  minCommunityTokensToCreateGovernance: BN,
  systemId: PublicKey,
  tokenId: PublicKey
) {
  const configArgs = new RealmConfigArgs({
    useCouncilMint: councilMint !== undefined,
    minCommunityTokensToCreateGovernance,
    communityMintMaxVoteWeightSource,
  })

  const args = new CreateRealmArgs({
    configArgs,
    name,
  })
  const data = Buffer.from(serialize(GOVERNANCE_SCHEMA, args))

  const [realmAddress] = await PublicKey.findProgramAddress(
    [Buffer.from(GOVERNANCE_PROGRAM_SEED), Buffer.from(args.name)],
    programId
  )

  const communityTokenHoldingAddress = await getTokenHoldingAddress(
    programId,
    realmAddress,
    communityMint
  )

  let keys = [
    {
      pubkey: realmAddress,
      isSigner: false,
      isWritable: true,
    },
    {
      pubkey: realmAuthority,
      isSigner: false,
      isWritable: false,
    },
    {
      pubkey: communityMint,
      isSigner: false,
      isWritable: false,
    },
    {
      pubkey: communityTokenHoldingAddress,
      isSigner: false,
      isWritable: true,
    },
    {
      pubkey: payer,
      isSigner: true,
      isWritable: false,
    },
    {
      pubkey: systemId,
      isSigner: false,
      isWritable: false,
    },
    {
      pubkey: tokenId,
      isSigner: false,
      isWritable: false,
    },
    {
      pubkey: SYSVAR_RENT_PUBKEY,
      isSigner: false,
      isWritable: false,
    },
  ]

  if (councilMint) {
    const councilTokenHoldingAddress = await getTokenHoldingAddress(
      programId,
      realmAddress,
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

  instructions.push(
    new TransactionInstruction({
      keys,
      programId,
      data,
    })
  )

  return realmAddress
}
