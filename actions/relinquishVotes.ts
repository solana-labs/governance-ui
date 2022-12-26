import {
  Keypair,
  PublicKey,
  Transaction,
  TransactionInstruction,
} from '@solana/web3.js';

import { Proposal, Realm } from '@solana/spl-governance';
import { RpcContext } from '@solana/spl-governance';
import { ProgramAccount } from '@solana/spl-governance';
import { sendTransaction } from '../utils/send';
import borsh from './borsh';
import { RelinquishVoteArgs } from './types';

export async function relinquishVoteInstruction({
  governance,
  proposal,
  governanceProgram,
  governanceRealm,
  authority,
  tokenOwnerRecord,
  voteRecord,
  governingTokenMint,
  beneficiary,
}: {
  governance: PublicKey;
  proposal: PublicKey;
  governanceProgram: PublicKey;
  governanceRealm: PublicKey;
  authority: PublicKey;
  tokenOwnerRecord: PublicKey;
  voteRecord: PublicKey;
  governingTokenMint: PublicKey;
  beneficiary: PublicKey;
}): Promise<TransactionInstruction> {
  const data = Buffer.from(
    borsh.serialize(
      new Map([
        [
          RelinquishVoteArgs,
          {
            kind: 'struct',
            fields: [['instruction', 'u8']],
          },
        ],
      ]),
      new RelinquishVoteArgs(),
    ),
  );

  return new TransactionInstruction({
    keys: [
      {
        pubkey: governanceRealm,
        isWritable: false,
        isSigner: false,
      },
      {
        pubkey: governance,
        isWritable: false,
        isSigner: false,
      },
      {
        pubkey: proposal,
        isWritable: true,
        isSigner: false,
      },
      {
        pubkey: tokenOwnerRecord,
        isWritable: true,
        isSigner: false,
      },
      {
        pubkey: voteRecord,
        isWritable: true,
        isSigner: false,
      },
      {
        pubkey: governingTokenMint,
        isWritable: false,
        isSigner: false,
      },
      {
        pubkey: authority,
        isWritable: false,
        isSigner: true,
      },
      {
        pubkey: beneficiary,
        isWritable: true,
        isSigner: false,
      },
    ],
    programId: governanceProgram,
    data,
  });
}

export default async ({
  rpcContext: { connection, wallet, programId, walletPubkey },
  proposal,
  records,
  instructions = [],
  realm,
}: {
  rpcContext: RpcContext;
  proposal: ProgramAccount<Proposal>;

  records: {
    tokenOwnerRecord: PublicKey;
    voteRecord: PublicKey;
    beneficiary: PublicKey;
  }[];

  instructions: TransactionInstruction[];
  realm: ProgramAccount<Realm>;
}) => {
  const signers: Keypair[] = [];

  for (const record of records) {
    // Compatible with spl-governance v3

    const ix = await relinquishVoteInstruction({
      governance: proposal.account.governance,
      proposal: proposal.pubkey,
      governanceProgram: programId,
      governanceRealm: realm.pubkey,
      authority: walletPubkey,
      tokenOwnerRecord: record.tokenOwnerRecord,
      voteRecord: record.voteRecord,
      beneficiary: record.beneficiary,
      governingTokenMint: proposal.account.governingTokenMint,
    });

    instructions.push(ix);

    // Compatible with spl-governance v2

    /*
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
    */
  }

  const transaction = new Transaction();
  transaction.add(...instructions);

  await sendTransaction({ transaction, wallet, connection, signers });
};
