import { PublicKey, TransactionInstruction } from '@solana/web3.js'
import { TOKEN_PROGRAM_ID } from '@solana/spl-token'
import { BN } from '@project-serum/anchor'
import { LockupType } from 'VoteStakeRegistry/sdk/accounts'
import { VsrClient } from '@blockworks-foundation/voter-stake-registry-client'
import { withCreateNewDeposit } from './withCreateNewDeposit'

export const withVoteRegistryDeposit = async ({
  instructions,
  walletPk,
  fromPk,
  mintPk,
  realmPk,
  programId,
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
    tokenOwnerRecordPk,
    lockUpPeriodInDays,
    lockupKind,
    communityMintPk,
    client,
  })
  const depositInstruction = client?.program.instruction.deposit(
    depositIdx,
    amount,
    {
      accounts: {
        registrar: registrar,
        voter: voter,
        vault: voterATAPk,
        depositToken: fromPk,
        depositAuthority: walletPk,
        tokenProgram: TOKEN_PROGRAM_ID,
      },
    }
  )
  instructions.push(depositInstruction)
}
