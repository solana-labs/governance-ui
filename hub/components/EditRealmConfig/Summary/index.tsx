import BotIcon from '@carbon/icons-react/lib/Bot';
import type { PublicKey } from '@solana/web3.js';
import { TypeOf } from 'io-ts';

import { Config } from '../fetchConfig';
import * as gql from '../gql';
import { UpdatesList } from '../UpdatesList';
import { ProposalDetails } from '@hub/components/EditWalletRules/ProposalDetails';
import { ProposalVoteType } from '@hub/components/EditWalletRules/ProposalVoteType';
import { FormProps } from '@hub/types/FormProps';

type Governance = TypeOf<
  typeof gql.getGovernanceResp
>['realmByUrlId']['governance'];

interface Props
  extends FormProps<{
    proposalDescription: string;
    proposalTitle: string;
    proposalVoteType: 'council' | 'community';
  }> {
  className?: string;
  config: Config;
  currentConfig: Config;
  governance: Governance;
  walletAddress: PublicKey;
}

export function Summary(props: Props) {
  return (
    <article className={props.className}>
      <div className="text-5xl text-white font-semibold mb-4">
        Your proposal is almost ready. Does everything look correct?
      </div>
      <div className="text-neutral-300 mb-8">
        Before submitting, ensure your description is correct and rules updates
        are accurate.
      </div>
      <ProposalDetails
        proposalDescription={props.proposalDescription}
        proposalTitle={props.proposalTitle}
        walletAddress={props.walletAddress}
        onProposalDescriptionChange={props.onProposalDescriptionChange}
        onProposalTitleChange={props.onProposalTitleChange}
      />
      <ProposalVoteType
        className="mt-8"
        initialCommunityRules={props.governance.communityTokenRules}
        initialCouncilRules={props.governance.councilTokenRules}
        initialBaseVoteDays={props.governance.maxVoteDays}
        initialCoolOffHours={props.governance.coolOffHours}
        initialMinInstructionHoldupDays={
          props.governance.minInstructionHoldupDays
        }
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
        config={props.config}
        currentConfig={props.currentConfig}
      />
    </article>
  );
}
