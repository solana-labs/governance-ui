import { VsrClient } from '@blockworks-foundation/voter-stake-registry-client';
import { Keypair, Transaction, TransactionInstruction } from '@solana/web3.js';
import { withUpdateVoterWeightRecord } from 'VoteStakeRegistry/sdk/withUpdateVoterWeightRecord';
import {
  ChatMessageBody,
  getGovernanceProgramVersion,
  GOVERNANCE_CHAT_PROGRAM_ID,
  Proposal,
  Realm,
  TokenOwnerRecord,
  withPostChatMessage,
  YesNoVote,
} from '@solana/spl-governance';
import { ProgramAccount } from '@solana/spl-governance';
import { RpcContext } from '@solana/spl-governance';
import { Vote } from '@solana/spl-governance';
import { withCastVote } from '@solana/spl-governance';
import { sendTransaction } from '../utils/send';
import { MintInfo } from '@solana/spl-token';
import { fmtTokenAmount } from '@utils/formatting';

export async function castVotes({
  rpcContext: { connection, wallet, programId, walletPubkey },
  vote,
  realm,
  proposal,
  tokenOwnerRecordsToVoteWith,
  message,
  client,
  mint,
  yesVotesRequired,
  noVotesRequired,
}: {
  rpcContext: RpcContext;
  realm: ProgramAccount<Realm>;
  proposal: ProgramAccount<Proposal>;
  tokenOwnerRecordsToVoteWith: ProgramAccount<TokenOwnerRecord>[];
  vote: YesNoVote;
  message?: ChatMessageBody;
  client?: VsrClient;
  yesVotesRequired: number;
  noVotesRequired: number;
  mint: MintInfo;
}) {
  const signers: Keypair[] = [];
  const instructions: TransactionInstruction[] = [];

  const governanceAuthority = walletPubkey;
  const payer = walletPubkey;

  // Explicitly request the version before making RPC calls to work around race conditions in resolving
  // the version for RealmInfo
  const programVersion = await getGovernanceProgramVersion(
    connection,
    programId,
  );

  //will run only if plugin is connected with realm
  const voterWeight = await withUpdateVoterWeightRecord(
    instructions,
    wallet.publicKey!,
    realm,
    client,
  );

  // +1 because we need 1 more vote than the quorum
  let relativeRequiredVote =
    vote === YesNoVote.Yes ? yesVotesRequired + 1 : noVotesRequired + 1;

  for (const tokenOwnerRecord of tokenOwnerRecordsToVoteWith) {
    // we check that the votes will stop once the proposal passes.
    if (relativeRequiredVote <= 0) {
      console.log('There is enough votes, do not include the next vote');
      continue;
    }

    relativeRequiredVote -= fmtTokenAmount(
      tokenOwnerRecord.account.governingTokenDepositAmount,
      mint.decimals,
    );

    await withCastVote(
      instructions,
      programId,
      programVersion,
      realm.pubkey,
      proposal.account.governance,
      proposal.pubkey,
      proposal.account.tokenOwnerRecord,
      tokenOwnerRecord.pubkey,
      governanceAuthority,

      proposal.account.governingTokenMint,
      Vote.fromYesNoVote(vote),
      payer,
      voterWeight,
    );
  }

  if (message) {
    await withPostChatMessage(
      instructions,
      signers,
      GOVERNANCE_CHAT_PROGRAM_ID,
      programId,
      realm.pubkey,
      proposal.account.governance,
      proposal.pubkey,

      // Use the first Token Owner Record in a completely arbitrary way
      tokenOwnerRecordsToVoteWith[0].pubkey,

      governanceAuthority,
      payer,
      undefined,
      message,
      voterWeight,
    );
  }

  const transaction = new Transaction();
  transaction.add(...instructions);

  await sendTransaction({ transaction, wallet, connection, signers });
}
