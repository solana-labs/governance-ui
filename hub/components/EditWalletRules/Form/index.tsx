import type { VoteTipping } from '@solana/spl-governance';
import type { PublicKey } from '@solana/web3.js';

import { CommunityDetails } from '../CommunityDetails';
import { CouncilDetails } from '../CouncilDetails';
import { VotingDuration } from '../VotingDuration';
import { WalletDescription } from '../WalletDescription';
import { FormProps } from '@hub/types/FormProps';

interface Props
  extends FormProps<{
    communityCanCreate: boolean;
    communityHasVeto: boolean;
    communityQuorumPercent: number;
    communityVoteTipping: VoteTipping;
    coolOffHours: number;
    councilCanCreate: boolean;
    councilHasVeto: boolean;
    councilQuorumPercent: number;
    councilVoteTipping: VoteTipping;
    maxVoteDays: number;
    minCommunityPower: number;
    minCouncilPower: number;
  }> {
  className?: string;
  walletAddress: PublicKey;
}

export function Form(props: Props) {
  return (
    <article className={props.className}>
      <h1 className="text-5xl font-medium m-0 mb-4 dark:text-white ">
        What changes would you like to make to this wallet?
      </h1>
      <p className="m-0 mb-16 dark:text-neutral-300">
        Submitting updates to a wallet’s rules will create a proposal for the
        DAO to vote on. If approved, the updates will automatically be
        implemented.
      </p>
      <div className="space-y-8">
        <WalletDescription walletAddress={props.walletAddress} />
        <VotingDuration
          coolOffHours={props.coolOffHours}
          maxVoteDays={props.maxVoteDays}
          onCoolOffHoursChange={props.onCoolOffHoursChange}
          onMaxVoteDaysChange={props.onMaxVoteDaysChange}
        />
        <CommunityDetails
          communityCanCreate={props.communityCanCreate}
          communityHasVeto={props.communityHasVeto}
          communityQuorumPercent={props.communityQuorumPercent}
          communityVoteTipping={props.communityVoteTipping}
          minCommunityPower={props.minCommunityPower}
          onCommunityCanCreateChange={props.onCommunityCanCreateChange}
          onCommunityHasVetoChange={props.onCommunityHasVetoChange}
          onCommunityQuorumPercentChange={props.onCommunityQuorumPercentChange}
          onCommunityVoteTippingChange={props.onCommunityVoteTippingChange}
          onMinCommunityPowerChange={props.onMinCommunityPowerChange}
        />
        <CouncilDetails
          councilCanCreate={props.councilCanCreate}
          councilHasVeto={props.councilHasVeto}
          councilQuorumPercent={props.councilQuorumPercent}
          councilVoteTipping={props.councilVoteTipping}
          minCouncilPower={props.minCouncilPower}
          onCouncilCanCreateChange={props.onCouncilCanCreateChange}
          onCouncilHasVetoChange={props.onCouncilHasVetoChange}
          onCouncilQuorumPercentChange={props.onCouncilQuorumPercentChange}
          onCouncilVoteTippingChange={props.onCouncilVoteTippingChange}
          onMinCouncilPowerChange={props.onMinCouncilPowerChange}
        />
      </div>
    </article>
  );
}
