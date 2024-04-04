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
  callbacks?: Parameters<typeof _createProposal>[12];
  cluster?: string;
  connection: Connection;
  councilTokenMintPublicKey?: PublicKey;
  communityTokenMintPublicKey?: PublicKey;
  governancePublicKey: PublicKey;
  governingTokenMintPublicKey: PublicKey;
  instructions: TransactionInstruction[];
  isDraft: boolean;
  options: string[];
  proposalDescription: string;
  proposalTitle: string;
  realmPublicKey: PublicKey;
  requestingUserPublicKey: PublicKey;
  signTransaction(transaction: Transaction): Promise<Transaction>;
  signAllTransactions(transactions: Transaction[]): Promise<Transaction[]>;
  votingClient: VotingClient | undefined;
}

/** @deprecated */
export async function createProposal(args: Args) {
  const realm = await getRealm(args.connection, args.realmPublicKey);

  const [
    governance,
    tokenOwnerRecord,
    // eslint-disable-next-line
    councilTokenOwnerRecord,
    // eslint-disable-next-line
    communityTokenOwnerRecord,
  ] = await Promise.all([
    getGovernance(args.connection, args.governancePublicKey),
    getTokenOwnerRecordForRealm(
      args.connection,
      realm.owner,
      args.realmPublicKey,
      args.governingTokenMintPublicKey,
      args.requestingUserPublicKey,
    ).catch(() => undefined),
    args.councilTokenMintPublicKey
      ? getTokenOwnerRecordForRealm(
          args.connection,
          realm.owner,
          args.realmPublicKey,
          args.councilTokenMintPublicKey,
          args.requestingUserPublicKey,
        ).catch(() => undefined)
      : undefined,
    args.communityTokenMintPublicKey
      ? getTokenOwnerRecordForRealm(
          args.connection,
          realm.owner,
          args.realmPublicKey,
          args.communityTokenMintPublicKey,
          args.requestingUserPublicKey,
        ).catch(() => undefined)
      : undefined,
  ]);

  let userTOR = tokenOwnerRecord;

  if (
    councilTokenOwnerRecord &&
    councilTokenOwnerRecord.account.governingTokenDepositAmount.gte(
      governance.account.config.minCouncilTokensToCreateProposal,
    )
  ) {
    userTOR = councilTokenOwnerRecord;
  }

  if (
    communityTokenOwnerRecord &&
    communityTokenOwnerRecord.account.governingTokenDepositAmount.gte(
      governance.account.config.minCommunityTokensToCreateProposal,
    )
  ) {
    userTOR = communityTokenOwnerRecord;
  }

  if (!userTOR) {
    throw new Error('You do not have any voting power in this org');
  }

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
      programId: realm.owner,
      walletPubkey: args.requestingUserPublicKey,
    } as RpcContext,
    realm,
    args.governancePublicKey,
    userTOR,
    args.proposalTitle,
    args.proposalDescription,
    args.governingTokenMintPublicKey,
    proposalIndex,
    instructionData,
    args.isDraft,
    args.options,
    args.votingClient,
    args.callbacks,
  );
}
