import BotIcon from '@carbon/icons-react/lib/Bot';
import type { PublicKey } from '@solana/web3.js';

import { ProposalDetails } from '../ProposalDetails';
import { ProposalVoteType } from '../ProposalVoteType';
import { CommunityRules, CouncilRules } from '../types';
import { UpdatesList } from '../UpdatesList';
import { WalletDescription } from '../WalletDescription';
import { FormProps } from '@hub/types/FormProps';

interface Props
  extends FormProps<{
    proposalDescription: string;
    proposalVoteType: 'council' | 'community';
  }> {
  className?: string;
  communityRules: CommunityRules;
  coolOffHours: number;
  councilRules: CouncilRules;
  currentCommunityRules: CommunityRules;
  currentCoolOffHours: number;
  currentCouncilRules: CouncilRules;
  currentDepositExemptProposalCount: number;
  currentMaxVoteDays: number;
  currentMinInstructionHoldupDays: number;
  depositExemptProposalCount: number;
  maxVoteDays: number;
  minInstructionHoldupDays: number;
  walletAddress: PublicKey;
}

export function Summary(props: Props) {
  return (
    <article className={props.className}>
      <WalletDescription className="mb-3" walletAddress={props.walletAddress} />
      <h1 className="text-5xl font-medium m-0 mb-4 dark:text-white ">
        Your proposal is almost ready. Does everything look correct?
      </h1>
      <p className="m-0 mb-16 dark:text-neutral-300">
        Before submitting, ensure your description is correct and rules updates
        are accurate.
      </p>
      <ProposalDetails
        proposalDescription={props.proposalDescription}
        walletAddress={props.walletAddress}
        onProposalDescriptionChange={props.onProposalDescriptionChange}
      />
      <ProposalVoteType
        className="mt-8"
        currentCommunityRules={props.currentCommunityRules}
        currentCouncilRules={props.currentCouncilRules}
        currentMaxVoteDays={props.currentMaxVoteDays}
        currentMinInstructionHoldupDays={props.currentMinInstructionHoldupDays}
        proposalVoteType={props.proposalVoteType}
        onProposalVoteTypeChange={props.onProposalVoteTypeChange}
      />
      <div className="mt-14">
        <div className="text-lg font-bold dark:text-white">
          Proposed Rules Updates
        </div>
        <div className="flex items-center mt-3 dark:text-emerald-400">
          <BotIcon className="h-3 fill-current mr-1 w-4" />
          <div className="text-xs">This section is automatically generated</div>
        </div>
      </div>
      <UpdatesList
        className="mt-4"
        communityRules={props.communityRules}
        coolOffHours={props.coolOffHours}
        councilRules={props.councilRules}
        currentCommunityRules={props.currentCommunityRules}
        currentCoolOffHours={props.currentCoolOffHours}
        currentCouncilRules={props.currentCouncilRules}
        currentDepositExemptProposalCount={
          props.currentDepositExemptProposalCount
        }
        currentMaxVoteDays={props.currentMaxVoteDays}
        currentMinInstructionHoldupDays={props.currentMinInstructionHoldupDays}
        depositExemptProposalCount={props.depositExemptProposalCount}
        maxVoteDays={props.maxVoteDays}
        minInstructionHoldupDays={props.minInstructionHoldupDays}
      />
    </article>
  );
}
