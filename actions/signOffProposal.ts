import {
  Account,
  PublicKey,
  Transaction,
  TransactionInstruction,
} from '@solana/web3.js'

import { RpcContext } from '../models/core/api'
import {
  getSignatoryRecordAddress,
  Proposal,
  SignatoryRecord,
} from '@models/accounts'
import { ParsedAccount } from 'models/core/accounts'
import { sendTransaction } from 'utils/send'
import { withSignOffProposal } from '@models/withSignOffProposal'

export const signOffProposal = async (
  { connection, wallet, programId, walletPubkey }: RpcContext,
  signatoryRecord: ParsedAccount<any> | undefined
) => {
  const instructions: TransactionInstruction[] = []
  const signers: Account[] = []

  console.log('before cancel ptoposal', instructions)

  const signatoryRecordAddress = await getSignatoryRecordAddress(
    programId,
    //@ts-ignore
    signatoryRecord!.pubkey,
    walletPubkey
  )

  withSignOffProposal(
    instructions,
    programId,
    signatoryRecord!.info.proposal,
    signatoryRecord!.pubkey,
    //@ts-ignore
    signatoryRecordAddress
  )

  const transaction = new Transaction()

  transaction.add(...instructions)

  await sendTransaction({
    transaction,
    wallet,
    connection,
    signers,
    sendingMessage: 'Signing off proposal',
    successMessage: 'Proposal signed off',
  })
}
