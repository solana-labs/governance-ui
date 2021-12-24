import {
  Account,
  PublicKey,
  Transaction,
  TransactionInstruction,
} from '@solana/web3.js'
import { GovernanceType } from '../models/enums'
import { GovernanceConfig } from '../models/accounts'
import { withCreateProgramGovernance } from '../models/withCreateProgramGovernance'
import { RpcContext } from '../models/core/api'
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
  const signers: Account[] = []
  let governanceAddress
  const governanceAuthority = walletPubkey

  switch (governanceType) {
    case GovernanceType.Program: {
      governanceAddress = (
        await withCreateProgramGovernance(
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
      ).governanceAddress
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
