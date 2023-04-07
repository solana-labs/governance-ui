import BotIcon from '@carbon/icons-react/lib/Bot';
import type { PublicKey } from '@solana/web3.js';

import { ProposalDetails } from '../ProposalDetails';
import { ProposalVoteType } from '../ProposalVoteType';
import { CommunityRules, CouncilRules } from '../types';
import { NewRulesList } from '../UpdatesList/New';
import { WalletDescription } from '../WalletDescription';
import { FormProps } from '@hub/types/FormProps';
import { UpdatesList } from '../UpdatesList';

interface Props
  extends FormProps<{
    proposalDescription: string;
    proposalTitle: string;
    proposalVoteType: 'council' | 'community';
  }> {
  className?: string;
  communityRules: CommunityRules;
  coolOffHours: number;
  councilRules: CouncilRules;
  initialCommunityRules: CommunityRules;
  currentCoolOffHours: number;
  initialCouncilRules: CouncilRules;
  currentDepositExemptProposalCount: number;
  currentBaseVoteDays: number;
  currentMinInstructionHoldupDays: number;
  depositExemptProposalCount: number;
  governanceAddress: PublicKey;
  baseVoteDays: number;
  minInstructionHoldupDays: number;
  walletAddress: PublicKey;
}

function Summary(props: Props & { proposalPreview: React.ReactNode }) {
  return (
    <article className={props.className}>
      <WalletDescription
        className="mb-3"
        governanceAddress={props.governanceAddress}
        walletAddress={props.walletAddress}
      />
      <h1 className="text-5xl font-medium m-0 mb-4 dark:text-white ">
        Your proposal is almost ready. Does everything look correct?
      </h1>
      <p className="m-0 mb-16 dark:text-neutral-300">
        Before submitting, ensure your description is correct and rules updates
        are accurate.
      </p>
      <ProposalDetails
        proposalDescription={props.proposalDescription}
        proposalTitle={props.proposalTitle}
        walletAddress={props.walletAddress}
        onProposalDescriptionChange={props.onProposalDescriptionChange}
        onProposalTitleChange={props.onProposalTitleChange}
      />
      <ProposalVoteType
        className="mt-8"
        initialCommunityRules={props.initialCommunityRules}
        initialCouncilRules={props.initialCouncilRules}
        currentBaseVoteDays={props.currentBaseVoteDays}
        currentCoolOffHours={props.currentCoolOffHours}
        currentMinInstructionHoldupDays={props.currentMinInstructionHoldupDays}
        proposalVoteType={props.proposalVoteType}
        onProposalVoteTypeChange={props.onProposalVoteTypeChange}
      />
      {props.proposalPreview}
    </article>
  );
}

export const EditWalletSummary = (props: Props) => (
  <Summary
    {...props}
    proposalPreview={
      <>
        <div className="mt-14">
          <div className="text-lg font-bold dark:text-white">
            Proposed Rules Updates
          </div>
          <div className="flex items-center mt-3 dark:text-emerald-400">
            <BotIcon className="h-3 fill-current mr-1 w-4" />
            <div className="text-xs">
              This section is automatically generated
            </div>
          </div>
        </div>
        <UpdatesList
          className="mt-4"
          communityRules={props.communityRules}
          coolOffHours={props.coolOffHours}
          councilRules={props.councilRules}
          initialCommunityRules={props.initialCommunityRules}
          currentCoolOffHours={props.currentCoolOffHours}
          initialCouncilRules={props.initialCouncilRules}
          currentDepositExemptProposalCount={
            props.currentDepositExemptProposalCount
          }
          currentBaseVoteDays={props.currentBaseVoteDays}
          currentMinInstructionHoldupDays={
            props.currentMinInstructionHoldupDays
          }
          depositExemptProposalCount={props.depositExemptProposalCount}
          baseVoteDays={props.baseVoteDays}
          minInstructionHoldupDays={props.minInstructionHoldupDays}
        />
      </>
    }
  />
);

export const NewWalletSummary = (props: Props) => (
  <Summary
    {...props}
    proposalPreview={
      <>
        <div className="mt-14">
          <div className="text-lg font-bold dark:text-white">
            Proposed Wallet Rules
          </div>
          <div className="flex items-center mt-3 dark:text-emerald-400">
            <BotIcon className="h-3 fill-current mr-1 w-4" />
            <div className="text-xs">
              This section is automatically generated
            </div>
          </div>
        </div>
        <NewRulesList
          className="mt-4"
          communityRules={props.communityRules}
          coolOffHours={props.coolOffHours}
          councilRules={props.councilRules}
          initialCommunityRules={props.initialCommunityRules}
          currentCoolOffHours={props.currentCoolOffHours}
          initialCouncilRules={props.initialCouncilRules}
          currentDepositExemptProposalCount={
            props.currentDepositExemptProposalCount
          }
          currentBaseVoteDays={props.currentBaseVoteDays}
          currentMinInstructionHoldupDays={
            props.currentMinInstructionHoldupDays
          }
          depositExemptProposalCount={props.depositExemptProposalCount}
          baseVoteDays={props.baseVoteDays}
          minInstructionHoldupDays={props.minInstructionHoldupDays}
        />
      </>
    }
  />
);
