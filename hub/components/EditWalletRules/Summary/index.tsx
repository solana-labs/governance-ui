import BotIcon from '@carbon/icons-react/lib/Bot';
import type { PublicKey } from '@solana/web3.js';

import { ProposalDetails } from '../ProposalDetails';
import { ProposalVoteType } from '../ProposalVoteType';
import { CommunityRules, CouncilRules } from '../types';
import { UpdatesList } from '../UpdatesList';
import { NewRulesList } from '../UpdatesList/NewRulesList';
import { WalletDescription } from '../WalletDescription';
import { FormProps } from '@hub/types/FormProps';

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
  initialCoolOffHours: number;
  initialCouncilRules: CouncilRules;
  initialDepositExemptProposalCount: number;
  initialBaseVoteDays: number;
  initialMinInstructionHoldupDays: number;
  depositExemptProposalCount: number;
  baseVoteDays: number;
  minInstructionHoldupDays: number;
  governanceAddress?: PublicKey;
  walletAddress?: PublicKey;
}

function Summary(
  props: Props & {
    proposalPreview: React.ReactNode;
    title: string;
    proposalForm?: boolean;
  },
) {
  return (
    <article className={props.className}>
      {props.governanceAddress && props.walletAddress && (
        <WalletDescription
          className="mb-3"
          governanceAddress={props.governanceAddress}
          walletAddress={props.walletAddress}
        />
      )}
      <h1 className="text-5xl font-medium m-0 mb-4 dark:text-white ">
        {props.title}
      </h1>
      {props.proposalForm && (
        <>
          <p className="m-0 mb-16 dark:text-neutral-300">
            Before submitting, ensure your description is correct and rules
            updates are accurate.
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
            initialBaseVoteDays={props.initialBaseVoteDays}
            initialCoolOffHours={props.initialCoolOffHours}
            initialMinInstructionHoldupDays={
              props.initialMinInstructionHoldupDays
            }
            proposalVoteType={props.proposalVoteType}
            onProposalVoteTypeChange={props.onProposalVoteTypeChange}
          />
        </>
      )}
      {props.proposalPreview}
    </article>
  );
}

export const EditWalletSummary = (
  props: Props & {
    governanceAddress: NonNullable<Props['governanceAddress']>;
    walletAddress: NonNullable<Props['walletAddress']>;
  },
) => (
  <Summary
    {...props}
    proposalForm
    title="Your proposal is almost ready. Does everything look correct?"
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
          initialCoolOffHours={props.initialCoolOffHours}
          initialCouncilRules={props.initialCouncilRules}
          initialDepositExemptProposalCount={
            props.initialDepositExemptProposalCount
          }
          initialBaseVoteDays={props.initialBaseVoteDays}
          initialMinInstructionHoldupDays={
            props.initialMinInstructionHoldupDays
          }
          depositExemptProposalCount={props.depositExemptProposalCount}
          baseVoteDays={props.baseVoteDays}
          minInstructionHoldupDays={props.minInstructionHoldupDays}
        />
      </>
    }
  />
);

export const NewWalletSummary = (
  props: Omit<Props, 'walletAddress' | 'governanceAddress'>,
) => (
  <Summary
    {...props}
    title="Your new wallet is ready. Does everything look correct?"
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
          depositExemptProposalCount={props.depositExemptProposalCount}
          baseVoteDays={props.baseVoteDays}
          minInstructionHoldupDays={props.minInstructionHoldupDays}
        />
      </>
    }
  />
);
