import useRealm from '@hooks/useRealm';
import React, { useMemo } from 'react';
import useWalletStore from 'stores/useWalletStore';
import Tooltip from '@components/Tooltip';
import {
  ProposalState,
  Vote,
  withCastVote,
  YesNoVote,
} from '@solana/spl-governance';
import { BadgeCheckIcon } from '@heroicons/react/outline';
import { Transaction, TransactionInstruction } from '@solana/web3.js';
import { withUpdateVoterWeightRecord } from 'VoteStakeRegistry/sdk/withUpdateVoterWeightRecord';
import { sendTransaction } from '@utils/send';
import useVoteStakeRegistryClientStore from 'VoteStakeRegistry/stores/voteStakeRegistryClientStore';

const ApproveAllBtn = () => {
  const wallet = useWalletStore((s) => s.current);
  const connected = useWalletStore((s) => s.connected);
  const { current: connection } = useWalletStore((s) => s.connection);
  const ownVoteRecordsByProposal = useWalletStore(
    (s) => s.ownVoteRecordsByProposal,
  );

  const { realm, programId, programVersion, tokenRecords } = useWalletStore(
    (s) => s.selectedRealm,
  );

  const { client } = useVoteStakeRegistryClientStore((s) => s.state);
  const { proposals } = useRealm();

  const votingProposals = useMemo(
    () =>
      Object.values(proposals).filter(
        (p) =>
          p.account.state == ProposalState.Voting &&
          !ownVoteRecordsByProposal[p.pubkey.toBase58()],
      ),
    [proposals, ownVoteRecordsByProposal],
  );

  const tooltipContent = !connected
    ? 'Connect your wallet to approve proposals'
    : votingProposals.length === 0
    ? 'There is no proposals to vote on'
    : '';

  const canApproveProposals = connected && votingProposals.length > 0;

  const approveAll = async () => {
    if (!wallet || !programId || !realm) return;

    const governanceAuthority = wallet.publicKey!;
    const payer = wallet.publicKey!;

    const {
      blockhash: recentBlockhash,
    } = await connection.getRecentBlockhash();

    const transactions = await Promise.all(
      votingProposals.map(async (proposal) => {
        const ownTokenRecord = tokenRecords[wallet.publicKey!.toBase58()];

        const instructions: TransactionInstruction[] = [];

        //will run only if plugin is connected with realm
        const voterWeight = await withUpdateVoterWeightRecord(
          instructions,
          wallet.publicKey!,
          realm,
          client,
        );
        await withCastVote(
          instructions,
          programId,
          programVersion,
          realm.pubkey,
          proposal.account.governance,
          proposal.pubkey,
          proposal.account.tokenOwnerRecord,
          ownTokenRecord.pubkey,
          governanceAuthority,
          proposal.account.governingTokenMint,
          Vote.fromYesNoVote(YesNoVote.Yes),
          payer,
          voterWeight,
        );

        const transaction = new Transaction({
          recentBlockhash,
          feePayer: wallet.publicKey!,
        });
        transaction.add(...instructions);
        return transaction;
      }),
    );

    const signedTXs = await wallet.signAllTransactions(transactions);

    await Promise.all(
      signedTXs.map((transaction) =>
        sendTransaction({ transaction, wallet, connection }),
      ),
    );
  };

  return (
    <>
      <Tooltip content={tooltipContent}>
        <div
          className={
            !canApproveProposals ? 'cursor-not-allowed opacity-60' : ''
          }
        >
          <a
            className={`${
              !canApproveProposals
                ? 'cursor-not-allowed pointer-events-none'
                : 'cursor-pointer hover:bg-bkg-3'
            } default-transition flex items-center rounded-full ring-1 ring-fgd-3 px-3 py-2.5 text-fgd-1 text-sm focus:outline-none`}
            onClick={approveAll}
          >
            <BadgeCheckIcon className="h-5 mr-1.5 text-primary-light w-5" />
            Approve All
          </a>
        </div>
      </Tooltip>
    </>
  );
};

export default ApproveAllBtn;
