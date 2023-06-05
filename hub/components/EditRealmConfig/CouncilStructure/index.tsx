import RuleIcon from '@carbon/icons-react/lib/Rule';
import WarningFilledIcon from '@carbon/icons-react/lib/WarningFilled';
import { RealmConfigAccount, GoverningTokenType } from '@solana/spl-governance';
import { produce } from 'immer';

import { Config } from '../fetchConfig';
import { TokenTypeSelector } from '../TokenTypeSelector';
// import { VotingStructureSelector } from '../VotingStructureSelector';
import { SectionBlock } from '@hub/components/EditWalletRules/SectionBlock';
import { SectionHeader } from '@hub/components/EditWalletRules/SectionHeader';
import { ValueBlock } from '@hub/components/EditWalletRules/ValueBlock';
import { FormProps } from '@hub/types/FormProps';

interface Props
  extends FormProps<{
    configAccount: RealmConfigAccount;
  }> {
  communityMint: Config['communityMint'];
  currentConfigAccount: RealmConfigAccount;
  className?: string;
}

export function CouncilStructure(props: Props) {
  // const currentVotingStructure = {
  //   votingProgramId:
  //     props.currentConfigAccount.councilTokenConfig.voterWeightAddin,
  //   maxVotingProgramId:
  //     props.currentConfigAccount.councilTokenConfig.maxVoterWeightAddin,
  // };

  // const votingStructure = {
  //   votingProgramId: props.configAccount.councilTokenConfig.voterWeightAddin,
  //   maxVotingProgramId:
  //     props.configAccount.councilTokenConfig.maxVoterWeightAddin,
  // };

  return (
    <SectionBlock className={props.className}>
      <SectionHeader
        className="mb-8"
        icon={<RuleIcon />}
        text="Council Structure"
      />
      <ValueBlock
        title="How would you like to configure your council token?"
        description="This determines how your DAO’s council token works."
      >
        <div>
          <TokenTypeSelector
            className="w-full"
            value={props.configAccount.councilTokenConfig.tokenType}
            onChange={(tokenType) => {
              const newConfigAccount = produce(
                { ...props.configAccount },
                (data) => {
                  data.councilTokenConfig.tokenType = tokenType;
                },
              );

              props.onConfigAccountChange?.(newConfigAccount);
            }}
          />
        </div>
      </ValueBlock>
      {props.configAccount.councilTokenConfig.tokenType ===
        GoverningTokenType.Dormant && (
        <div className="text-xs text-amber-400 flex items-center mt-2">
          <WarningFilledIcon className="h-4 w-4 fill-current mr-2 flex-shrink-0" />
          <div>
            Disabling the council token will remove voting and managing
            privileges for all council members.
          </div>
        </div>
      )}
      {/* {props.configAccount.councilTokenConfig.tokenType !==
        GoverningTokenType.Dormant && (
        <ValueBlock
          className="mt-10"
          title="What type of governance structure do you want your DAO’s council to use?"
          description=""
        >
          <div>
            <VotingStructureSelector
              className="w-full"
              communityMint={props.communityMint}
              currentStructure={currentVotingStructure}
              structure={votingStructure}
              onChange={({ votingProgramId, maxVotingProgramId }) => {
                const newConfig = produce(
                  { ...props.configAccount },
                  (data) => {
                    data.councilTokenConfig.maxVoterWeightAddin = maxVotingProgramId;
                    data.councilTokenConfig.voterWeightAddin = votingProgramId;
                  },
                );

                props.onConfigAccountChange?.(newConfig);
              }}
            />
          </div>
        </ValueBlock>
      )} */}
    </SectionBlock>
  );
}
