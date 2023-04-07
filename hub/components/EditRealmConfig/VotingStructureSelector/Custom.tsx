import WarningFilledIcon from '@carbon/icons-react/lib/WarningFilled';
import type { PublicKey } from '@solana/web3.js';

import { AddressValidator } from '../AddressValidator';
import cx from '@hub/lib/cx';
import { FormProps } from '@hub/types/FormProps';

interface Props
  extends FormProps<{
    votingProgramId?: null | PublicKey;
    maxVotingProgramId?: null | PublicKey;
  }> {
  className?: string;
}

export function Custom(props: Props) {
  return (
    <div className={props.className}>
      <div className="relative">
        <div className="absolute top-0 left-2 w-0 bottom-0 border-l dark:border-neutral-700" />
        <div className="text-xs text-amber-400 flex items-center pl-8">
          <WarningFilledIcon className="h-4 w-4 fill-current mr-2 flex-shrink-0" />
          <div>
            Realms does not have a list of voting program IDs. Be sure to input
            a valid address in the following fields.
          </div>
        </div>
      </div>
      <div className="relative">
        <div className="absolute top-0 left-2 w-0 bottom-0 border-l dark:border-neutral-700" />
        <div className="pt-10 pl-8">
          <div className="text-white font-bold mb-3">
            What is your custom voting program ID?
          </div>
          <div className="relative">
            <div
              className={cx(
                'absolute',
                'border-b',
                'border-l',
                'top-2.5',
                'h-5',
                'mr-1',
                'right-[100%]',
                'rounded-bl',
                'w-5',
                'dark:border-neutral-700',
              )}
            />
            <AddressValidator
              value={props.votingProgramId || null}
              onChange={props.onVotingProgramIdChange}
            />
          </div>
        </div>
      </div>
      <div className="relative">
        <div className="absolute top-0 left-2 w-0 h-24 border-l dark:border-neutral-700" />
        <div className="pt-10 pl-8">
          <div className="text-white font-bold mb-3">
            What is your custom max voting program ID?
          </div>
          <div className="relative">
            <div
              className={cx(
                'absolute',
                'border-b',
                'border-l',
                'top-2.5',
                'h-5',
                'mr-1',
                'right-[100%]',
                'rounded-bl',
                'w-5',
                'dark:border-neutral-700',
              )}
            />
            <AddressValidator
              value={props.maxVotingProgramId || null}
              onChange={props.onMaxVotingProgramIdChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
