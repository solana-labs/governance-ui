import {
  PublicKey,
  SYSVAR_RENT_PUBKEY,
  SystemProgram,
  TransactionInstruction,
} from '@solana/web3.js'
import { TOKEN_PROGRAM_ID } from '@solana/spl-token'
import { getGovernanceSchema } from './serialisation'
import { serialize } from 'borsh'
import { CreateRealmArgs } from './instructions'
import {
  RealmConfigArgs,
  GOVERNANCE_PROGRAM_SEED,
  MintMaxVoteWeightSource,
  getTokenHoldingAddress,
  getRealmConfigAddress,
} from './accounts'
import { ProgramVersion } from 'models/registry/api'
import BN from 'bn.js'

export async function withCreateRealm(
  instructions: TransactionInstruction[],
  programId: PublicKey,
  programVersion: ProgramVersion,
  name: string,
  realmAuthority: PublicKey,
  communityMint: PublicKey,
  payer: PublicKey,
  councilMint: PublicKey | undefined,
  communityMintMaxVoteWeightSource: MintMaxVoteWeightSource,
  minCommunityTokensToCreateGovernance: BN,
  communityVoterWeightAddin: PublicKey | undefined
) {
  if (communityVoterWeightAddin && programVersion < 2) {
    throw new Error(
      `Voter weight addin is not supported in version ${programVersion}`
    )
  }

  const configArgs = new RealmConfigArgs({
    useCouncilMint: councilMint !== undefined,
    minCommunityTokensToCreateGovernance,
    communityMintMaxVoteWeightSource,
    useCommunityVoterWeightAddin: communityVoterWeightAddin !== undefined,
  })

  const args = new CreateRealmArgs({
    configArgs,
    name,
  })
  const data = Buffer.from(serialize(getGovernanceSchema(programVersion), args))

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
      pubkey: SystemProgram.programId,
      isSigner: false,
      isWritable: false,
    },
    {
      pubkey: TOKEN_PROGRAM_ID,
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

  const realmConfigAddress = await getRealmConfigAddress(
    programId,
    realmAddress
  )

  keys.push({
    pubkey: realmConfigAddress,
    isSigner: false,
    isWritable: true,
  })

  if (communityVoterWeightAddin) {
    keys.push({
      pubkey: communityVoterWeightAddin,
      isWritable: false,
      isSigner: false,
    })
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
