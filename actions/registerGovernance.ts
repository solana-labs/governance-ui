import {
  Keypair,
  PublicKey,
  Transaction,
  TransactionInstruction,
} from '@solana/web3.js'
import { GovernanceType } from '@solana/spl-governance'
import { GovernanceConfig } from '@solana/spl-governance'
import { withCreateProgramGovernance } from '@solana/spl-governance'
import { RpcContext } from '@solana/spl-governance'
import { sendTransaction } from '@utils/send'

export const registerGovernance = async (
  { connection, wallet, programId, walletPubkey }: RpcContext,
  governanceType: GovernanceType,
  realm: PublicKey,
  governedAccount: PublicKey,
  config: GovernanceConfig,
  transferAuthority: boolean,
  tokenOwnerRecord: PublicKey
): Promise<PublicKey> => {
  const instructions: TransactionInstruction[] = []
  const signers: Keypair[] = []
  let governanceAddress
  const governanceAuthority = walletPubkey

  switch (governanceType) {
    case GovernanceType.Program: {
      governanceAddress = await withCreateProgramGovernance(
        instructions,
        programId,
        realm,
        governedAccount,
        config,
        transferAuthority!,
        walletPubkey,
        tokenOwnerRecord,
        walletPubkey,
        governanceAuthority
      )
      break
    }
    default: {
      throw new Error(`Governance type ${governanceType} is not supported yet.`)
    }
  }

  const transaction = new Transaction()
  transaction.add(...instructions)
  await sendTransaction({
    transaction,
    wallet,
    connection,
    signers,
    sendingMessage: 'Creating treasury account',
    successMessage: 'Treasury account has been created',
  })

  return governanceAddress
}
