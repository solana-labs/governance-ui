import { PublicKey, TransactionInstruction } from '@solana/web3.js'
import { RpcContext } from '@solana/spl-governance'
import { TOKEN_PROGRAM_ID } from '@solana/spl-token'
import { BN } from '@project-serum/anchor'
import { LockupType } from 'VoteStakeRegistry/utils/voteRegistryTools'
import { VsrClient } from '@blockworks-foundation/voter-stake-registry-client'
import { withCreateNewDeposit } from './withCreateNewDeposit'

export const withVoteRegistryDeposit = async ({
  instructions,
  rpcContext,
  fromPk,
  mintPk,
  realmPk,
  programId,
  amount,
  tokenOwnerRecordPk,
  lockUpPeriodInDays,
  lockupKind,
  vsrClient,
}: {
  instructions: TransactionInstruction[]
  rpcContext: RpcContext
  //from where we deposit our founds
  fromPk: PublicKey
  mintPk: PublicKey
  realmPk: PublicKey
  programId: PublicKey
  amount: BN
  tokenOwnerRecordPk: PublicKey | null
  lockUpPeriodInDays: number
  lockupKind: LockupType
  vsrClient?: VsrClient
}) => {
  const { wallet } = rpcContext
  if (!vsrClient) {
    throw 'no vote registry plugin'
  }
  if (!wallet.publicKey) {
    throw 'no wallet connected'
  }
  const {
    depositIdx,
    voter,
    registrar,
    voterATAPk,
  } = await withCreateNewDeposit({
    instructions,
    rpcContext,
    mintPk,
    realmPk,
    programId,
    tokenOwnerRecordPk,
    lockUpPeriodInDays,
    lockupKind,
    vsrClient,
  })
  const depositInstruction = vsrClient?.program.instruction.deposit(
    depositIdx,
    amount,
    {
      accounts: {
        registrar: registrar,
        voter: voter,
        vault: voterATAPk,
        depositToken: fromPk,
        depositAuthority: wallet!.publicKey!,
        tokenProgram: TOKEN_PROGRAM_ID,
      },
    }
  )
  instructions.push(depositInstruction)
}
