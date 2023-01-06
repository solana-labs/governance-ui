import LockedIcon from '@carbon/icons-react/lib/Locked';
import type { PublicKey } from '@solana/web3.js';

import { SectionBlock } from '../SectionBlock';
import { ValueBlock } from '../ValueBlock';
import { getAccountName } from '@components/instructions/tools';
import { Input } from '@hub/components/controls/Input';
import { Textarea } from '@hub/components/controls/Textarea';
import cx from '@hub/lib/cx';
import { FormProps } from '@hub/types/FormProps';

interface Props
  extends FormProps<{
    proposalDescription: string;
  }> {
  className?: string;
  walletAddress: PublicKey;
}

export function ProposalDetails(props: Props) {
  const walletName =
    getAccountName(props.walletAddress) || props.walletAddress.toBase58();

  return (
    <SectionBlock className={cx(props.className, 'space-y-8')}>
      <ValueBlock
        title="Proposal Title"
        description="This is automatically created and cannot be edited."
      >
        <div className="relative">
          <Input
            disabled
            className="w-full pr-12"
            value={`Update Wallet Rules for "${walletName}"`}
          />
          <LockedIcon
            className={cx(
              '-translate-y-1/2',
              'absolute',
              'fill-neutral-500',
              'h-4',
              'right-4',
              'top-1/2',
              'w-4',
            )}
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
