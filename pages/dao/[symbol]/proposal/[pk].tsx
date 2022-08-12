import React, { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown/react-markdown.min';
import { ExternalLinkIcon } from '@heroicons/react/outline';

import ApprovalQuorum from '@components/ApprovalQuorum';
import PreviousRouteBtn from '@components/PreviousRouteBtn';
import ProposalActionsPanel from '@components/ProposalActions';
import TokenBalanceCardWrapper from '@components/TokenBalance/TokenBalanceCardWrapper';
import VoteResults from '@components/VoteResults';
import VoteResultStatus from '@components/VoteResultStatus';
import useRealm from '@hooks/useRealm';
import { resolveProposalDescription } from '@utils/helpers';

import DiscussionPanel from 'components/chat/DiscussionPanel';
import { InstructionPanel } from 'components/instructions/instructionPanel';
import ProposalStateBadge from 'components/ProposalStatusBadge';
import ProposalTimeStatus from 'components/ProposalTimeStatus';
import VotePanel from 'components/VotePanel';
import useProposal from 'hooks/useProposal';
import useProposalVotes from 'hooks/useProposalVotes';
import { option } from 'tools/core/option';
import { getRealmExplorerHost } from 'tools/routing';
import { EnhancedProposalState } from 'stores/useWalletStore';

const Proposal = () => {
  const { realmInfo } = useRealm();
  const { proposal, descriptionLink } = useProposal();
  const [description, setDescription] = useState('');
  const { yesVoteProgress, yesVotesRequired } = useProposalVotes(
    proposal?.account,
  );

  const showResults =
    proposal &&
    proposal.account.state !== EnhancedProposalState.Cancelled &&
    proposal.account.state !== EnhancedProposalState.Draft;

  const votePassed =
    proposal &&
    (proposal.account.state === EnhancedProposalState.Completed ||
      proposal.account.state === EnhancedProposalState.Executing ||
      proposal.account.state === EnhancedProposalState.SigningOff ||
      proposal.account.state === EnhancedProposalState.Succeeded);

  useEffect(() => {
    const handleResolveDescription = async () => {
      const description = await resolveProposalDescription(descriptionLink!);
      setDescription(description);
    };
    if (descriptionLink) {
      handleResolveDescription();
    }
  }, [descriptionLink]);

  return (
    <div className="grid grid-cols-12 gap-4">
      <div className="bg-bkg-2 rounded-lg p-4 md:p-6 col-span-12 md:col-span-7 lg:col-span-8 space-y-3">
        {proposal ? (
          <>
            <div className="flex flex-items justify-between">
              <PreviousRouteBtn />
              <div className="flex items-center">
                <a
                  href={`https://${getRealmExplorerHost(
                    realmInfo,
                  )}/#/proposal/${proposal.pubkey.toBase58()}?programId=${proposal.owner.toBase58()}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                >
                  <ExternalLinkIcon className="flex-shrink-0 h-4 ml-2 mt-0.5 text-primary-light w-4" />
                </a>
              </div>
            </div>

            <div className="py-4">
              <div className="flex items-center justify-between mb-1">
                <h1 className="mr-2">{proposal?.account.name}</h1>
                <ProposalStateBadge
                  proposalPk={proposal.pubkey}
                  proposal={proposal.account}
                  open={true}
                />
              </div>
            </div>

            {description && (
              <div className="pb-2">
                <ReactMarkdown className="markdown">
                  {description}
                </ReactMarkdown>
              </div>
            )}

            <InstructionPanel />
            <DiscussionPanel />
          </>
        ) : (
          <>
            <div className="animate-pulse bg-bkg-3 h-12 rounded-lg" />
            <div className="animate-pulse bg-bkg-3 h-64 rounded-lg" />
            <div className="animate-pulse bg-bkg-3 h-64 rounded-lg" />
          </>
        )}
      </div>

      <div className="col-span-12 md:col-span-5 lg:col-span-4 space-y-4">
        <TokenBalanceCardWrapper proposal={option(proposal?.account)} />
        {showResults ? (
          <div className="bg-bkg-2 rounded-lg">
            <div className="p-4 md:p-6">
              {proposal?.account.state === EnhancedProposalState.Voting ? (
                <div className="flex items-end justify-between mb-4">
                  <h3 className="mb-0">Voting Now</h3>
                  <ProposalTimeStatus proposal={proposal?.account} />
                </div>
              ) : (
                <h3 className="mb-4">Results</h3>
              )}
              {proposal?.account.state === EnhancedProposalState.Voting ? (
                <div className="pb-3">
                  <ApprovalQuorum
                    yesVotesRequired={yesVotesRequired}
                    progress={yesVoteProgress}
                    showBg
                  />
                </div>
              ) : (
                <div className="pb-3">
                  <VoteResultStatus
                    progress={yesVoteProgress}
                    votePassed={votePassed}
                    yesVotesRequired={yesVotesRequired}
                  />
                </div>
              )}
              <VoteResults proposal={proposal.account} />
            </div>
          </div>
        ) : null}

        <VotePanel />
        <ProposalActionsPanel />
      </div>
    </div>
  );
};

export default Proposal;
