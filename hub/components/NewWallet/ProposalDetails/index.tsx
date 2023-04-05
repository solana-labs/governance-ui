import type { PublicKey } from '@solana/web3.js';

import { SectionBlock } from '../SectionBlock';
import { ValueBlock } from '../ValueBlock';
import { Input } from '@hub/components/controls/Input';
import { Textarea } from '@hub/components/controls/Textarea';
import cx from '@hub/lib/cx';
import { FormProps } from '@hub/types/FormProps';

interface Props
  extends FormProps<{
    proposalDescription: string;
    proposalTitle: string;
  }> {
  className?: string;
  walletAddress: PublicKey;
}

export function ProposalDetails(props: Props) {
  return (
    <SectionBlock className={cx(props.className, 'space-y-8')}>
      <ValueBlock
        title="Proposal Title"
        description="Consider using the suggested propsal title."
      >
        <div className="relative">
          <Input
            className="w-full pr-12"
            value={props.proposalTitle}
            onChange={(e) => {
              const text = e.currentTarget.value;
              props.onProposalTitleChange?.(text);
            }}
          />
        </div>
      </ValueBlock>
      <ValueBlock
        title="Proposal Description"
        description="This will help voters understand more details about your proposed changes."
      >
        <Textarea
          className="h-28 w-full"
          value={props.proposalDescription}
          onChange={(e) => {
            props.onProposalDescriptionChange?.(e.currentTarget.value);
          }}
        />
      </ValueBlock>
    </SectionBlock>
  );
}
