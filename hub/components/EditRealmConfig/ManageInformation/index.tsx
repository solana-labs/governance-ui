import EditIcon from '@carbon/icons-react/lib/Edit';
import WarningFilledIcon from '@carbon/icons-react/lib/WarningFilled';
import BigNumber from 'bignumber.js';
import BN from 'bn.js';
import { produce } from 'immer';

import { Config } from '../fetchConfig';
import { ButtonToggle } from '@components/core/controls/ButtonToggle';
import { Input } from '@hub/components/controls/Input';
import { MAX_NUM } from '@hub/components/EditWalletRules/constants';
import { SectionBlock } from '@hub/components/EditWalletRules/SectionBlock';
import { SectionHeader } from '@hub/components/EditWalletRules/SectionHeader';
import { ValueBlock } from '@hub/components/EditWalletRules/ValueBlock';
import { formatNumber } from '@hub/lib/formatNumber';
import { FormProps } from '@hub/types/FormProps';

interface Props
  extends FormProps<{
    config: Config['config'];
  }> {
  className?: string;
  communityMint: Config['communityMint'];
}

export function ManageInformation(props: Props) {
  const minTokensToManage = new BigNumber(
    props.config.minCommunityTokensToCreateGovernance.toString(),
  ).shiftedBy(-props.communityMint.account.decimals);

  const manageEnabled = minTokensToManage.isLessThan(
    MAX_NUM.shiftedBy(-props.communityMint.account.decimals),
  );

  return (
    <SectionBlock className={props.className}>
      <SectionHeader
        className="mb-8"
        icon={<EditIcon />}
        text="Manage Information"
      />
      <ValueBlock
        title="Do you want the community to be able to manage this DAO?"
        description="Anyone with the allotted amount of governance power can edit non security-related information without a proposal."
      >
        <ButtonToggle
          value={manageEnabled}
          onChange={(value) => {
            const newMinTokens = value ? new BN(0) : new BN(MAX_NUM.toString());

            const newConfig = produce({ ...props.config }, (data) => {
              data.minCommunityTokensToCreateGovernance = newMinTokens;
            });

            props.onConfigChange?.(newConfig);
          }}
        />
      </ValueBlock>
      {manageEnabled && (
        <div className="text-xs text-amber-400 flex items-center mt-2">
          <WarningFilledIcon className="h-4 w-4 fill-current mr-2 flex-shrink-0" />
          <div>
            This will allow members to update information including name,
            description, and other hub information.
          </div>
        </div>
      )}
      {manageEnabled && (
        <ValueBlock
          className="mt-12"
          title="What is the minimum amount of governance power needed to manage this DAO?"
          description="A user will need at least this much governance power to manage and edit information for this DAO."
        >
          <div className="relative">
            <Input
              className="w-full pr-24"
              placeholder="amount of governance power"
              value={formatNumber(minTokensToManage, undefined, {
                maximumFractionDigits: 0,
              })}
              onChange={(e) => {
                const text = e.currentTarget.value.replaceAll(/[^\d.-]/g, '');
                const value = text ? new BigNumber(text) : new BigNumber(0);

                const newConfig = produce({ ...props.config }, (data) => {
                  data.minCommunityTokensToCreateGovernance = new BN(
                    value
                      .shiftedBy(props.communityMint.account.decimals)
                      .toString(),
                  );
                });

                props.onConfigChange?.(newConfig);
              }}
            />
            <div className="absolute top-1/2 right-4 text-neutral-500 -translate-y-1/2">
              Governance Power
            </div>
          </div>
        </ValueBlock>
      )}
    </SectionBlock>
  );
}
