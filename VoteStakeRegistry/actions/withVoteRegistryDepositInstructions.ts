import { PublicKey, TransactionInstruction } from '@solana/web3.js'
import { RpcContext } from '@solana/spl-governance'
import { TOKEN_PROGRAM_ID } from '@solana/spl-token'
import { BN } from '@project-serum/anchor'
import { LockupKinds } from 'VoteStakeRegistry/utils/voteRegistryTools'
import { VsrClient } from '@blockworks-foundation/voter-stake-registry-client'
import { createNewDepositInstructions } from './createNewDepositInstructions'

export const withVoteRegistryDepositInstructions = async ({
  rpcContext,
  //from where we deposit our founds
  fromPk,
  mint,
  realmPk,
  programId,
  amount,
  hasTokenOwnerRecord,
  lockUpPeriodInDays = 0,
  lockupKind = 'none',
  //force create new means that new deposit will be created regardless of other conditions
  forceCreateNew = false,
  client,
}: {
  rpcContext: RpcContext
  //from where we deposit our founds
  fromPk: PublicKey
  //e.g council or community
  mint: PublicKey
  realmPk: PublicKey
  programId: PublicKey
  amount: BN
  hasTokenOwnerRecord: boolean
  lockUpPeriodInDays?: number
  lockupKind?: LockupKinds
  forceCreateNew?: boolean
  client?: VsrClient
}) => {
  const { wallet } = rpcContext
  const instructions: TransactionInstruction[] = []
  if (!client) {
    throw 'no vote registry plugin'
  }
  if (!wallet.publicKey) {
    throw 'no wallet connected'
  }
  const {
    instructions: prepareDepositInstructions,
    depositIdx,
    voter,
    registrar,
    voterATAPk,
  } = await createNewDepositInstructions({
    rpcContext,
    mint,
    realmPk,
    programId,
    hasTokenOwnerRecord,
    lockUpPeriodInDays,
    lockupKind,
    forceCreateNew,
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
        depositAuthority: wallet!.publicKey!,
        tokenProgram: TOKEN_PROGRAM_ID,
      },
    }
  )

  instructions.push(...prepareDepositInstructions, depositInstruction)

  return instructions
}
