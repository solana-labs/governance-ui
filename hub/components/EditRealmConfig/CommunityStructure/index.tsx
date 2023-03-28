import EventsIcon from '@carbon/icons-react/lib/Events';
import WarningFilledIcon from '@carbon/icons-react/lib/WarningFilled';
import { GoverningTokenType } from '@solana/spl-governance';
import type { PublicKey } from '@solana/web3.js';
import BigNumber from 'bignumber.js';
import BN from 'bn.js';
import { produce } from 'immer';

import { Config } from '../fetchConfig';
import { TokenTypeSelector } from '../TokenTypeSelector';
import { VotingStructureSelector } from '../VotingStructureSelector';
import { ButtonToggle } from '@hub/components/controls/ButtonToggle';
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
    configAccount: Config['configAccount'];
    nftCollection?: PublicKey;
    nftCollectionSize: number;
    nftCollectionWeight: BN;
  }> {
  currentConfigAccount: Config['configAccount'];
  currentNftCollection?: PublicKey;
  currentNftCollectionSize: number;
  currentNftCollectionWeight: BN;
  communityMint: Config['communityMint'];
  className?: string;
}

export function CommunityStructure(props: Props) {
  const currentVotingStructure = {
    votingProgramId:
      props.currentConfigAccount.communityTokenConfig.voterWeightAddin,
    maxVotingProgramId:
      props.currentConfigAccount.communityTokenConfig.maxVoterWeightAddin,
    nftCollection: props.currentNftCollection,
    nftCollectionSize: props.currentNftCollectionSize,
    nftCollectionWeight: props.currentNftCollectionWeight,
  };

  const votingStructure = {
    votingProgramId: props.configAccount.communityTokenConfig.voterWeightAddin,
    maxVotingProgramId:
      props.configAccount.communityTokenConfig.maxVoterWeightAddin,
    nftCollection: props.nftCollection,
    nftCollectionSize: props.nftCollectionSize,
    nftCollectionWeight: props.nftCollectionWeight,
  };

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
        icon={<EventsIcon />}
        text="Community Structure"
      />
      <ValueBlock
        title="How would you like to configure your community token?"
        description="This determines how your DAO’s community token works."
      >
        <div>
          <TokenTypeSelector
            className="w-full"
            value={props.configAccount.communityTokenConfig.tokenType}
            onChange={(tokenType) => {
              const newConfigAccount = produce(
                { ...props.configAccount },
                (data) => {
                  data.communityTokenConfig.tokenType = tokenType;
                },
              );

              props.onConfigAccountChange?.(newConfigAccount);

              if (tokenType === GoverningTokenType.Dormant) {
                const newConfig = produce({ ...props.config }, (data) => {
                  data.minCommunityTokensToCreateGovernance = new BN(
                    MAX_NUM.toString(),
                  );
                });

                setTimeout(() => {
                  props.onConfigChange?.(newConfig);
                }, 0);
              }
            }}
          />
        </div>
      </ValueBlock>
      {props.configAccount.communityTokenConfig.tokenType ===
        GoverningTokenType.Dormant && (
        <div className="text-xs text-amber-400 flex items-center mt-2">
          <WarningFilledIcon className="h-4 w-4 fill-current mr-2 flex-shrink-0" />
          <div>
            Disabling the community token will remove voting and managing
            privileges for all community members.
          </div>
        </div>
      )}
      {props.configAccount.communityTokenConfig.tokenType !==
        GoverningTokenType.Dormant && (
        <>
          <ValueBlock
            className="mt-12"
            title="Do you want the community to be able to manage this DAO?"
            description="Anyone with the allotted amount of governance power can edit non security-related information without a proposal."
          >
            <ButtonToggle
              value={manageEnabled}
              onChange={(value) => {
                const newMinTokens = value
                  ? new BN(0)
                  : new BN(MAX_NUM.toString());

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
                    const text = e.currentTarget.value.replaceAll(
                      /[^\d.-]/g,
                      '',
                    );
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
        </>
      )}
      {props.configAccount.communityTokenConfig.tokenType !==
        GoverningTokenType.Dormant && (
        <ValueBlock
          className="mt-10"
          title="What type of governance structure do you want your DAO’s community to use?"
          description=""
        >
          <div>
            <VotingStructureSelector
              allowNFT
              allowCivic={
                props.configAccount.communityTokenConfig.tokenType !==
                GoverningTokenType.Membership
              }
              allowVSR={
                props.configAccount.communityTokenConfig.tokenType !==
                GoverningTokenType.Membership
              }
              className="w-full"
              communityMint={props.communityMint}
              currentStructure={currentVotingStructure}
              structure={votingStructure}
              onChange={({
                votingProgramId,
                maxVotingProgramId,
                nftCollection,
                nftCollectionSize,
                nftCollectionWeight,
              }) => {
                const newConfig = produce(
                  { ...props.configAccount },
                  (data) => {
                    data.communityTokenConfig.maxVoterWeightAddin = maxVotingProgramId;
                    data.communityTokenConfig.voterWeightAddin = votingProgramId;
                  },
                );

                props.onConfigAccountChange?.(newConfig);

                setTimeout(() => {
                  if (
                    (!props.currentNftCollection && nftCollection) ||
                    (props.currentNftCollection && nftCollection) ||
                    (props.currentNftCollection &&
                      nftCollection &&
                      !props.currentNftCollection.equals(nftCollection))
                  ) {
                    props.onNftCollectionChange?.(nftCollection);
                  }

                  if (
                    typeof nftCollectionSize !== 'undefined' &&
                    props.nftCollectionSize !== nftCollectionSize
                  ) {
                    props.onNftCollectionSizeChange?.(nftCollectionSize);
                  }

                  if (
                    typeof nftCollectionWeight !== 'undefined' &&
                    !props.nftCollectionWeight.eq(nftCollectionWeight)
                  ) {
                    props.onNftCollectionWeightChange?.(nftCollectionWeight);
                  }
                }, 0);
              }}
            />
          </div>
        </ValueBlock>
      )}
    </SectionBlock>
  );
}
