import {
  Keypair,
  PublicKey,
  Transaction,
  TransactionInstruction,
} from '@solana/web3.js';

import { Proposal } from '@solana/spl-governance';
import { RpcContext } from '@solana/spl-governance';
import { ProgramAccount } from '@solana/spl-governance';
import { sendTransaction } from '../utils/send';
import { withRelinquishVote } from '@solana/spl-governance';

export default async ({
  rpcContext: { connection, wallet, programId, walletPubkey },
  proposal,
  records,
  instructions = [],
}: {
  rpcContext: RpcContext;
  proposal: ProgramAccount<Proposal>;

  records: {
    tokenOwnerRecord: PublicKey;
    voteRecord: PublicKey;
  }[];

  instructions: TransactionInstruction[];
}) => {
  const signers: Keypair[] = [];

  const governanceAuthority = walletPubkey;
  const beneficiary = walletPubkey;

  for (const record of records) {
    withRelinquishVote(
      instructions,
      programId,
      proposal.account.governance,
      proposal.pubkey,
      record.tokenOwnerRecord,
      proposal.account.governingTokenMint,
      record.voteRecord,
      governanceAuthority,
      beneficiary,
    );
  }

  const transaction = new Transaction();
  transaction.add(...instructions);

  await sendTransaction({ transaction, wallet, connection, signers });
};
