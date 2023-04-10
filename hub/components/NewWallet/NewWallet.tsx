import CheckmarkIcon from '@carbon/icons-react/lib/Checkmark';
import ChevronLeftIcon from '@carbon/icons-react/lib/ChevronLeft';
import EditIcon from '@carbon/icons-react/lib/Edit';
import { hoursToSeconds, secondsToHours } from 'date-fns';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useMemo, useState } from 'react';

import { NewWalletForm } from '../EditWalletRules/Form';
import { NewWalletSummary } from '../EditWalletRules/Summary';
import useProgramVersion from '@hooks/useProgramVersion';
import { Primary, Secondary } from '@hub/components/controls/Button';
import { Connect } from '@hub/components/GlobalHeader/User/Connect';
import { useWallet } from '@hub/hooks/useWallet';
import cx from '@hub/lib/cx';

import useGovernanceDefaults from './useGovernanceDefaults';

enum Step {
  Form,
  Summary,
}

function stepNum(step: Step): number {
  switch (step) {
    case Step.Form:
      return 1;
    case Step.Summary:
      return 2;
  }
}

function stepName(step: Step): string {
  switch (step) {
    case Step.Form:
      return 'Configure Wallet Rules';
    case Step.Summary:
      return 'Create Wallet';
  }
}

interface Props {
  className?: string;
}

// TODO generate defaults
function NewWalletWithDefaults({
  defaults,
  ...props
}: Props & {
  defaults: NonNullable<ReturnType<typeof useGovernanceDefaults>>;
}) {
  const wallet = useWallet();
  const router = useRouter();
  const programVersion = useProgramVersion();
  const [step, setStep] = useState(Step.Form);
  const [proposalVoteType, setProposalVoteType] = useState<
    'community' | 'council'
  >('community');
  const [proposalDescription, setProposalDescription] = useState('');
  const [proposalTitle, setProposalTitle] = useState('');

  const [rules, setRules] = useState(defaults);

  // calculate baseVoteDays
  const baseVoteDays = useMemo(() => {
    const maxVotingSeconds = hoursToSeconds(24 * rules.maxVoteDays);
    const coolOffSeconds = hoursToSeconds(rules.coolOffHours);
    const baseVotingSeconds = maxVotingSeconds - coolOffSeconds;
    return secondsToHours(baseVotingSeconds) / 24;
  }, [rules.maxVoteDays, rules.coolOffHours]);

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0 });
    }
  }, [step]);

  if (!wallet.publicKey) {
    return (
      <div className={cx(props.className, 'dark:bg-neutral-900')}>
        <Head>
          <title>Create Wallet</title>
          <meta property="og:title" content={`Create Wallet`} key="title" />
        </Head>
        <div className="w-full max-w-3xl pt-14 mx-auto grid place-items-center">
          <div className="my-16 py-8 px-16 dark:bg-black/40 rounded flex flex-col items-center">
            <div className="text-white mb-2 text-center">
              Please sign in to create a new wallet.
            </div>
            <Connect />
          </div>
        </div>
      </div>
    );
  }

  const setRule = (field: keyof NonNullable<typeof rules>) => (
    v: NonNullable<typeof rules>[typeof field],
  ) => {
    setRules((prev) => ({ ...prev, [field]: v }));
  };

  return (
    <div className={cx(props.className, 'dark:bg-neutral-900')}>
      <div className="w-full max-w-3xl pt-14 mx-auto">
        <Head>
          <title>Create Wallet</title>
          <meta property="og:title" content={`Create Wallet`} key="title" />
        </Head>
        <div className="flex items-center mt-4">
          <div className="text-sm dark:text-neutral-500">
            Step {stepNum(step)} of 2
          </div>
          <div className="text-sm dark:text-white ml-2">{stepName(step)}</div>
        </div>
        <div className="py-16">
          {step === Step.Form && (
            <>
              <NewWalletForm
                className="mb-16"
                communityRules={rules.communityTokenRules}
                coolOffHours={rules.coolOffHours}
                councilRules={rules.councilTokenRules}
                initialCommunityRules={defaults.communityTokenRules}
                initialCouncilRules={defaults.councilTokenRules}
                depositExemptProposalCount={rules.depositExemptProposalCount}
                maxVoteDays={rules.maxVoteDays}
                minInstructionHoldupDays={rules.minInstructionHoldupDays}
                programVersion={programVersion}
                onCommunityRulesChange={setRule('communityTokenRules')}
                onCoolOffHoursChange={setRule('coolOffHours')}
                onCouncilRulesChange={setRule('councilTokenRules')}
                onDepositExemptProposalCountChange={setRule(
                  'depositExemptProposalCount',
                )}
                onMaxVoteDaysChange={setRule('maxVoteDays')}
                onMinInstructionHoldupDaysChange={setRule(
                  'minInstructionHoldupDays',
                )}
              />
              <footer className="flex items-center justify-between">
                <button
                  className="flex items-center text-sm text-neutral-500"
                  onClick={() => router.back()}
                >
                  <ChevronLeftIcon className="h-4 fill-current w-4" />
                  Go Back
                </button>
                <Secondary
                  className="h-14 w-44"
                  onClick={() => setStep(Step.Summary)}
                >
                  Continue
                </Secondary>
              </footer>
            </>
          )}
          {step === Step.Summary && (
            <>
              <NewWalletSummary
                className="mb-16"
                communityRules={rules.communityTokenRules}
                coolOffHours={rules.coolOffHours}
                councilRules={rules.councilTokenRules}
                initialCommunityRules={defaults.communityTokenRules}
                initialCoolOffHours={defaults.coolOffHours}
                initialCouncilRules={defaults.councilTokenRules}
                initialDepositExemptProposalCount={
                  defaults.depositExemptProposalCount
                }
                initialBaseVoteDays={defaults.maxVoteDays}
                initialMinInstructionHoldupDays={
                  defaults.minInstructionHoldupDays
                }
                depositExemptProposalCount={rules.depositExemptProposalCount}
                baseVoteDays={baseVoteDays}
                minInstructionHoldupDays={rules.minInstructionHoldupDays}
                proposalDescription={proposalDescription}
                proposalTitle={proposalTitle}
                proposalVoteType={proposalVoteType}
                onProposalDescriptionChange={setProposalDescription}
                onProposalTitleChange={setProposalTitle}
                onProposalVoteTypeChange={setProposalVoteType}
              />
              <footer className="flex items-center justify-end">
                <button
                  className="flex items-center text-sm text-neutral-500"
                  onClick={() => setStep(Step.Form)}
                >
                  <EditIcon className="h-4 fill-current mr-1 w-4" />
                  Configure Rules
                </button>
                <Primary
                  className="ml-16 h-14 w-44"
                  pending={submitting}
                  onClick={async () => {
                    setSubmitting(true);

                    //await handleCreate();

                    setSubmitting(false);
                  }}
                >
                  <CheckmarkIcon className="h-4 fill-current mr-1 w-4" />
                  Create Wallet
                </Primary>
              </footer>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// would be nice to have a hoc that just takes a hook an does this :thinking:
export const NewWallet = (props: Props) => {
  const defaults = useGovernanceDefaults();
  return defaults ? (
    <NewWalletWithDefaults {...props} defaults={defaults} />
  ) : null;
};
