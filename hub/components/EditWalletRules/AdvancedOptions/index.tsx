import { SectionBlock } from '../SectionBlock';
import { ValueBlock } from '../ValueBlock';
import { Input } from '@hub/components/controls/Input';
import cx from '@hub/lib/cx';
import { formatNumber } from '@hub/lib/formatNumber';
import { FormProps } from '@hub/types/FormProps';

interface Props
  extends FormProps<{
    depositExemptProposalCount: number;
    minInstructionHoldupDays: number;
  }> {
  className?: string;
}

export function AdvancedOptions(props: Props) {
  return (
    <SectionBlock className={cx(props.className, 'space-y-8')}>
      <ValueBlock
        title="Deposit Exempt Proposal Count"
        description="The amount of proposals a member can create without a deposit."
      >
        <div className="relative">
          <Input
            className="w-full pr-24"
            placeholder="# of proposals"
            value={formatNumber(props.depositExemptProposalCount, undefined, {
              maximumFractionDigits: 0,
            })}
            onChange={(e) => {
              const text = e.currentTarget.value.replaceAll(/[^\d.-]/g, '');
              const val = parseInt(text || '0', 10);
              props.onDepositExemptProposalCountChange?.(val);
            }}
          />
          <div className="absolute top-1/2 right-4 text-neutral-500 -translate-y-1/2">
            Proposals
          </div>
        </div>
      </ValueBlock>
      <ValueBlock
        title="Minimum Instruction Holdup Time"
        description="The minimum time which must pass before proposal instructions can be executed."
      >
        <div className="relative">
          <Input
            className="w-full pr-24"
            placeholder="# of days"
            value={formatNumber(props.minInstructionHoldupDays, undefined, {
              maximumFractionDigits: 0,
            })}
            onChange={(e) => {
              const text = e.currentTarget.value.replaceAll(/[^\d.-]/g, '');
              const val = parseInt(text || '0', 10);
              props.onMinInstructionHoldupDaysChange?.(val);
            }}
          />
          <div className="absolute top-1/2 right-4 text-neutral-500 -translate-y-1/2">
            Days
          </div>
        </div>
      </ValueBlock>
    </SectionBlock>
  );
}
