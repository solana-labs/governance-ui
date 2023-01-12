import {
  serializeInstructionToBase64,
  getGovernance,
  getRealm,
  getTokenOwnerRecordForRealm,
  RpcContext,
} from '@solana/spl-governance';
import type {
  Connection,
  PublicKey,
  TransactionInstruction,
  Transaction,
} from '@solana/web3.js';

import {
  InstructionDataWithHoldUpTime,
  createProposal as _createProposal,
} from 'actions/createProposal';

import { VotingClient } from '@utils/uiTypes/VotePlugin';

interface Args {
  connection: Connection;
  governancePublicKey: PublicKey;
  governingTokenMintPublicKey: PublicKey;
  instructions: TransactionInstruction[];
  isDraft: boolean;
  programPublicKey: PublicKey;
  proposalDescription: string;
  proposalTitle: string;
  realmPublicKey: PublicKey;
  votingClient?: VotingClient;
  requestingUserPublicKey: PublicKey;
  signTransaction(transaction: Transaction): Promise<Transaction>;
  signAllTransactions(transactions: Transaction[]): Promise<Transaction[]>;
}

export async function createProposal(args: Args) {
  const [governance, realm, tokenOwnerRecord] = await Promise.all([
    getGovernance(args.connection, args.governancePublicKey),
    getRealm(args.connection, args.realmPublicKey),
    getTokenOwnerRecordForRealm(
      args.connection,
      args.programPublicKey,
      args.realmPublicKey,
      args.governingTokenMintPublicKey,
      args.requestingUserPublicKey,
    ),
  ]);

  const serializedInstructions = args.instructions.map(
    serializeInstructionToBase64,
  );

  const instructionData = serializedInstructions.map(
    (serializedInstruction) =>
      new InstructionDataWithHoldUpTime({
        governance,
        instruction: {
          governance,
          serializedInstruction,
          isValid: true,
        },
      }),
  );

  const proposalIndex = governance.account.proposalCount;

  return _createProposal(
    {
      connection: args.connection,
      wallet: {
        publicKey: args.requestingUserPublicKey,
        signTransaction: args.signTransaction,
        signAllTransactions: args.signAllTransactions,
      },
      programId: args.programPublicKey,
      walletPubkey: args.requestingUserPublicKey,
    } as RpcContext,
    realm,
    args.governancePublicKey,
    tokenOwnerRecord,
    args.proposalTitle,
    args.proposalDescription,
    args.governingTokenMintPublicKey,
    proposalIndex,
    instructionData,
    args.isDraft,
    args.votingClient,
  );
}
