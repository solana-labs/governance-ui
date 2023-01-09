import ChevronDownIcon from '@carbon/icons-react/lib/ChevronDown';
import type { VoteTipping } from '@solana/spl-governance';
import type { PublicKey } from '@solana/web3.js';
import { BigNumber } from 'bignumber.js';
import { useState } from 'react';

import { AdvancedOptions } from '../AdvancedOptions';
import { CommunityDetails } from '../CommunityDetails';
import { CouncilDetails } from '../CouncilDetails';
import { VotingDuration } from '../VotingDuration';
import { WalletDescription } from '../WalletDescription';
import cx from '@hub/lib/cx';
import { FormProps } from '@hub/types/FormProps';

interface Props
  extends FormProps<{
    communityCanCreate: boolean;
    communityHasVeto: boolean;
    communityQuorumPercent: number;
    communityVetoQuorum: number;
    communityVoteTipping: VoteTipping;
    coolOffHours: number;
    councilCanCreate: boolean;
    councilHasVeto: boolean;
    councilQuorumPercent: number;
    councilVetoQuorum: number;
    councilVoteTipping: VoteTipping;
    depositExemptProposalCount: number;
    maxVoteDays: number;
    minCommunityPower: BigNumber;
    minCouncilPower: BigNumber;
  }> {
  className?: string;
  communityTokenSupply: BigNumber;
  councilTokenSupply: BigNumber;
  walletAddress: PublicKey;
}

export function Form(props: Props) {
  const [showAdvanceOptions, setShowAdvanceOptions] = useState(false);

  return (
    <article className={props.className}>
      <WalletDescription className="mb-3" walletAddress={props.walletAddress} />
      <h1 className="text-5xl font-medium m-0 mb-4 dark:text-white ">
        What changes would you like to make to this wallet?
      </h1>
      <p className="m-0 mb-16 dark:text-neutral-300">
        Submitting updates to a wallet’s rules will create a proposal for the
        DAO to vote on. If approved, the updates will automatically be
        implemented.
      </p>
      <div className="space-y-8">
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
          communityTokenSupply={props.communityTokenSupply}
          communityVetoQuorum={props.communityVetoQuorum}
          communityVoteTipping={props.communityVoteTipping}
          minCommunityPower={props.minCommunityPower}
          onCommunityCanCreateChange={props.onCommunityCanCreateChange}
          onCommunityHasVetoChange={props.onCommunityHasVetoChange}
          onCommunityQuorumPercentChange={props.onCommunityQuorumPercentChange}
          onCommunityVetoQuorumChange={props.onCommunityVetoQuorumChange}
          onCommunityVoteTippingChange={props.onCommunityVoteTippingChange}
          onMinCommunityPowerChange={props.onMinCommunityPowerChange}
        />
        <CouncilDetails
          councilCanCreate={props.councilCanCreate}
          councilHasVeto={props.councilHasVeto}
          councilQuorumPercent={props.councilQuorumPercent}
          councilTokenSupply={props.councilTokenSupply}
          councilVetoQuorum={props.councilVetoQuorum}
          councilVoteTipping={props.councilVoteTipping}
          minCouncilPower={props.minCouncilPower}
          onCouncilCanCreateChange={props.onCouncilCanCreateChange}
          onCouncilHasVetoChange={props.onCouncilHasVetoChange}
          onCouncilQuorumPercentChange={props.onCouncilQuorumPercentChange}
          onCouncilVetoQuorumChange={props.onCouncilVetoQuorumChange}
          onCouncilVoteTippingChange={props.onCouncilVoteTippingChange}
          onMinCouncilPowerChange={props.onMinCouncilPowerChange}
        />
      </div>
      <div className="mt-16">
        <button
          className="flex items-center text-sm text-neutral-500"
          onClick={() => setShowAdvanceOptions((cur) => !cur)}
        >
          Advanced Options{' '}
          <ChevronDownIcon
            className={cx(
              'fill-current',
              'h-4',
              'transition-transform',
              'w-4',
              showAdvanceOptions && '-rotate-180',
            )}
          />
        </button>
        {showAdvanceOptions && (
          <AdvancedOptions
            className="mt-2.5"
            depositExemptProposalCount={props.depositExemptProposalCount}
            onDepositExemptProposalCountChange={
              props.onDepositExemptProposalCountChange
            }
          />
        )}
      </div>
    </article>
  );
}
