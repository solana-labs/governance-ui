import { PublicKey, TransactionInstruction } from '@solana/web3.js'
import { TOKEN_PROGRAM_ID } from '@solana/spl-token'
import { BN } from '@coral-xyz/anchor'
import { LockupType } from 'VoteStakeRegistry/sdk/accounts'
import { withCreateNewDeposit } from './withCreateNewDeposit'
import { VsrClient } from './client'

export const withVoteRegistryDeposit = async ({
  instructions,
  walletPk,
  fromPk,
  mintPk,
  realmPk,
  programId,
  programVersion,
  amount,
  tokenOwnerRecordPk,
  lockUpPeriodInDays,
  lockupKind,
  communityMintPk,
  client,
}: {
  instructions: TransactionInstruction[]
  walletPk: PublicKey
  //from where we deposit our founds
  fromPk: PublicKey
  mintPk: PublicKey
  realmPk: PublicKey
  programId: PublicKey
  programVersion: number
  amount: BN
  communityMintPk: PublicKey
  tokenOwnerRecordPk: PublicKey | null
  lockUpPeriodInDays: number
  lockupKind: LockupType
  client?: VsrClient
}) => {
  if (!client) {
    throw 'no vote registry plugin'
  }

  const {
    depositIdx,
    voter,
    registrar,
    voterATAPk,
  } = await withCreateNewDeposit({
    instructions,
    walletPk,
    mintPk,
    realmPk,
    programId,
    programVersion,
    tokenOwnerRecordPk,
    lockUpPeriodInDays,
    lockupKind,
    communityMintPk,
    client,
  })
  const depositInstruction = await client?.program.methods
    .deposit(depositIdx, amount)
    .accounts({
      registrar: registrar,
      voter: voter,
      vault: voterATAPk,
      depositToken: fromPk,
      depositAuthority: walletPk,
      tokenProgram: TOKEN_PROGRAM_ID,
    })
    .instruction()
  instructions.push(depositInstruction)
}
