import BotIcon from '@carbon/icons-react/lib/Bot';
import type { VoteTipping } from '@solana/spl-governance';
import type { PublicKey } from '@solana/web3.js';
import { BigNumber } from 'bignumber.js';

import { ProposalDetails } from '../ProposalDetails';
import { ProposalVoteType } from '../ProposalVoteType';
import { UpdatesList } from '../UpdatesList';
import { WalletDescription } from '../WalletDescription';
import { FormProps } from '@hub/types/FormProps';

interface Props
  extends FormProps<{
    proposalDescription: string;
    proposalVoteType: 'council' | 'community';
  }> {
  className?: string;
  communityCanCreate: boolean;
  communityHasVeto: boolean;
  communityQuorumPercent: number;
  communityVoteTipping: VoteTipping;
  coolOffHours: number;
  councilCanCreate: boolean;
  councilHasVeto: boolean;
  councilQuorumPercent: number;
  councilVoteTipping: VoteTipping;
  depositExemptProposalCount: number;
  maxVoteDays: number;
  minCommunityPower: BigNumber;
  minCouncilPower: BigNumber;
  currentCommunityCanCreate: boolean;
  currentCommunityHasVeto: boolean;
  currentCommunityQuorumPercent: number;
  currentCommunityVoteTipping: VoteTipping;
  currentCoolOffHours: number;
  currentCouncilCanCreate: boolean;
  currentCouncilHasVeto: boolean;
  currentCouncilQuorumPercent: number;
  currentCouncilVoteTipping: VoteTipping;
  currentDepositExemptProposalCount: number;
  currentMaxVoteDays: number;
  currentMinCommunityPower: BigNumber;
  currentMinCouncilPower: BigNumber;
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
        currentCommunityCanCreate={props.currentCommunityCanCreate}
        currentCommunityHasVeto={props.currentCommunityHasVeto}
        currentCommunityQuorumPercent={props.currentCommunityQuorumPercent}
        currentCommunityVoteTipping={props.currentCommunityVoteTipping}
        currentCoolOffHours={props.currentCoolOffHours}
        currentCouncilCanCreate={props.currentCouncilCanCreate}
        currentCouncilHasVeto={props.currentCouncilHasVeto}
        currentCouncilQuorumPercent={props.currentCouncilQuorumPercent}
        currentCouncilVoteTipping={props.currentCouncilVoteTipping}
        currentDepositExemptProposalCount={
          props.currentDepositExemptProposalCount
        }
        currentMaxVoteDays={props.currentMaxVoteDays}
        currentMinCommunityPower={props.currentMinCommunityPower}
        currentMinCouncilPower={props.currentMinCouncilPower}
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
        communityCanCreate={props.communityCanCreate}
        communityHasVeto={props.communityHasVeto}
        communityQuorumPercent={props.communityQuorumPercent}
        communityVoteTipping={props.communityVoteTipping}
        coolOffHours={props.coolOffHours}
        councilCanCreate={props.councilCanCreate}
        councilHasVeto={props.councilHasVeto}
        councilQuorumPercent={props.councilQuorumPercent}
        councilVoteTipping={props.councilVoteTipping}
        depositExemptProposalCount={props.depositExemptProposalCount}
        maxVoteDays={props.maxVoteDays}
        minCommunityPower={props.minCommunityPower}
        minCouncilPower={props.minCouncilPower}
        currentCommunityCanCreate={props.currentCommunityCanCreate}
        currentCommunityHasVeto={props.currentCommunityHasVeto}
        currentCommunityQuorumPercent={props.currentCommunityQuorumPercent}
        currentCommunityVoteTipping={props.currentCommunityVoteTipping}
        currentCoolOffHours={props.currentCoolOffHours}
        currentCouncilCanCreate={props.currentCouncilCanCreate}
        currentCouncilHasVeto={props.currentCouncilHasVeto}
        currentCouncilQuorumPercent={props.currentCouncilQuorumPercent}
        currentCouncilVoteTipping={props.currentCouncilVoteTipping}
        currentDepositExemptProposalCount={
          props.currentDepositExemptProposalCount
        }
        currentMaxVoteDays={props.currentMaxVoteDays}
        currentMinCommunityPower={props.currentMinCommunityPower}
        currentMinCouncilPower={props.currentMinCouncilPower}
      />
    </article>
  );
}
