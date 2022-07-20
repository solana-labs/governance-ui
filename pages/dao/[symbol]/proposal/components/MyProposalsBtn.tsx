import useRealm from '@hooks/useRealm';
import React, { useMemo, useState } from 'react';
import useWalletStore, { EnhancedProposalState } from 'stores/useWalletStore';
import {
  ProgramAccount,
  Proposal,
  withCancelProposal,
  withFinalizeVote,
  withRelinquishVote,
} from '@solana/spl-governance';
import { Transaction, TransactionInstruction } from '@solana/web3.js';
import { sendTransaction } from '@utils/send';
import Modal from '@components/Modal';
import Button from '@components/Button';
import useGovernanceAssets from '@hooks/useGovernanceAssets';
import dayjs from 'dayjs';
import { notify } from '@utils/notifications';
import Loading from '@components/Loading';

const MyProposalsBn = () => {
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const wallet = useWalletStore((s) => s.current);
  const connected = useWalletStore((s) => s.connected);
  const [isLoading, setIsLoading] = useState(false);
  const { governancesArray } = useGovernanceAssets();
  const { current: connection } = useWalletStore((s) => s.connection);
  const ownVoteRecordsByProposal = useWalletStore(
    (s) => s.ownVoteRecordsByProposal,
  );
  const { realm, programId } = useWalletStore((s) => s.selectedRealm);
  const { fetchRealm } = useWalletStore((s) => s.actions);
  const {
    proposals,
    ownTokenRecord,
    ownCouncilTokenRecord,
    realmInfo,
  } = useRealm();
  const myProposals = useMemo(
    () =>
      connected
        ? Object.values(proposals).filter(
            (p) =>
              p.account.tokenOwnerRecord.toBase58() ===
                ownTokenRecord?.pubkey.toBase58() ||
              p.account.tokenOwnerRecord.toBase58() ===
                ownCouncilTokenRecord?.pubkey.toBase58(),
          )
        : [],
    [proposals, ownVoteRecordsByProposal, connected],
  );
  const drafts = myProposals.filter((x) => {
    return x.account.state === EnhancedProposalState.Draft;
  });
  const notfinalized = myProposals.filter((x) => {
    const governance = governancesArray.find(
      (gov) => gov.pubkey.toBase58() === x.account.governance.toBase58(),
    );
    const now = dayjs().unix();
    const timestamp = x
      ? x.account.isVoteFinalized()
        ? 0 // If vote is finalized then set the timestamp to 0 to make it expired
        : x.account.votingAt && governance
        ? x.account.votingAt.toNumber() +
          governance.account.config.maxVotingTime
        : undefined
      : undefined;
    return (
      x.account.state === EnhancedProposalState.Voting &&
      !x.account.isVoteFinalized() &&
      timestamp &&
      now > timestamp
    );
  });
  const unReleased = myProposals.filter(
    (x) =>
      (x.account.state === EnhancedProposalState.Succeeded ||
        x.account.state === EnhancedProposalState.Outdated ||
        x.account.state === EnhancedProposalState.Completed) &&
      x.account.isVoteFinalized() &&
      !ownVoteRecordsByProposal[x.pubkey.toBase58()]?.account.isRelinquished,
  );
  const createdVoting = myProposals.filter((x) => {
    return (
      x.account.state === EnhancedProposalState.Voting &&
      !x.account.isVoteFinalized()
    );
  });

  const cleanSelected = async (
    proposalsArray: ProgramAccount<Proposal>[],
    withInstruction,
  ) => {
    if (!wallet || !programId || !realm) return;
    setIsLoading(true);
    try {
      const {
        blockhash: recentBlockhash,
      } = await connection.getRecentBlockhash();

      const transactions = await Promise.all(
        proposalsArray.map(async (proposal) => {
          const instructions: TransactionInstruction[] = [];

          await withInstruction(instructions, proposal);

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
      await fetchRealm(realmInfo!.programId, realmInfo!.realmId);
    } catch (e) {
      notify({ type: 'error', message: 'Something wnet wrong' });
    }
    setIsLoading(false);
  };

  const cleanDrafts = () => {
    const withInstruction = (instructions, proposal) => {
      return withCancelProposal(
        instructions,
        realm!.owner!,
        realmInfo!.programVersion!,
        realm!.pubkey!,
        proposal!.account.governance,
        proposal!.pubkey,
        proposal!.account.tokenOwnerRecord,
        wallet!.publicKey!,
      );
    };
    cleanSelected(drafts, withInstruction);
  };
  const releaseAllTokens = () => {
    const withInstruction = (
      instructions,
      proposal: ProgramAccount<Proposal>,
    ) => {
      const voterTokenRecord =
        proposal.account.governingTokenMint.toBase58() ===
        realm?.account.communityMint.toBase58()
          ? ownTokenRecord
          : ownCouncilTokenRecord;
      const governanceAuthority = wallet!.publicKey!;
      const beneficiary = wallet!.publicKey!;

      return withRelinquishVote(
        instructions,
        realm!.owner,
        proposal.account.governance,
        proposal.pubkey,
        voterTokenRecord!.pubkey,
        proposal.account.governingTokenMint,
        ownVoteRecordsByProposal[proposal.pubkey.toBase58()].pubkey,
        governanceAuthority,
        beneficiary,
      );
    };
    cleanSelected(unReleased, withInstruction);
  };
  const finalizeAll = () => {
    const withInstruction = (
      instructions,
      proposal: ProgramAccount<Proposal>,
    ) => {
      return withFinalizeVote(
        instructions,
        realm!.owner,
        realmInfo!.programVersion!,
        realm!.pubkey!,
        proposal.account.governance,
        proposal.pubkey,
        proposal.account.tokenOwnerRecord,
        proposal.account.governingTokenMint,
      );
    };
    cleanSelected(notfinalized, withInstruction);
  };
  return (
    <>
      <div>
        <Button onClick={() => setModalIsOpen(true)}>My proposals</Button>
      </div>
      {modalIsOpen && (
        <Modal
          sizeClassName="sm:max-w-3xl"
          onClose={() => {
            setModalIsOpen(false);
          }}
          isOpen={modalIsOpen}
        >
          <>
            <h3 className="mb-4 flex flex-col">
              Your proposals {isLoading && <Loading w="50px"></Loading>}
            </h3>
            <ProposalList
              title="Drafts"
              fcn={cleanDrafts}
              btnName="Cancel all"
              proposals={drafts}
              isLoading={isLoading}
            ></ProposalList>
            <ProposalList
              title="Unfinalized"
              fcn={finalizeAll}
              btnName="Finalize all"
              proposals={notfinalized}
              isLoading={isLoading}
            ></ProposalList>
            <ProposalList
              title="Unreleased tokens"
              fcn={releaseAllTokens}
              btnName="Release all"
              proposals={unReleased}
              isLoading={isLoading}
            ></ProposalList>
            <ProposalList
              title="Created vote in progress"
              fcn={() => null}
              btnName=""
              proposals={createdVoting}
              isLoading={isLoading}
            ></ProposalList>
          </>
        </Modal>
      )}
    </>
  );
};

const ProposalList = ({
  title,
  fcn,
  btnName,
  proposals,
  isLoading,
}: {
  title: string;
  fcn: () => void;
  btnName: string;
  proposals: ProgramAccount<Proposal>[];
  isLoading: boolean;
}) => {
  return (
    <>
      {' '}
      <h4 className="flex items-center mb-3">
        {title} ({proposals.length})
        {btnName && proposals.length !== 0 && (
          <Button small className="ml-auto" onClick={fcn} disabled={isLoading}>
            {btnName}
          </Button>
        )}
      </h4>
      <div className="mb-3 ">
        {proposals.map((x) => (
          <div
            className="text-xs border-fgd-4 border px-3 py-2 mb-3 rounded-lg"
            key={x.pubkey.toBase58()}
          >
            {x.account.name}
          </div>
        ))}
      </div>
    </>
  );
};

export default MyProposalsBn;
