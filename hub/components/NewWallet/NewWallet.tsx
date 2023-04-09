import CheckmarkIcon from '@carbon/icons-react/lib/Checkmark';
import ChevronLeftIcon from '@carbon/icons-react/lib/ChevronLeft';
import EditIcon from '@carbon/icons-react/lib/Edit';
import { PublicKey } from '@solana/web3.js';
import { BigNumber } from 'bignumber.js';
import { hoursToSeconds, secondsToHours } from 'date-fns';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

import { NewWalletForm } from '../EditWalletRules/Form';
import { NewWalletSummary } from '../EditWalletRules/Summary';
import { CommunityRules, CouncilRules } from '../EditWalletRules/types';
import { Primary, Secondary } from '@hub/components/controls/Button';
import { Connect } from '@hub/components/GlobalHeader/User/Connect';
import { ProposalCreationProgress } from '@hub/components/ProposalCreationProgress';
import { useWallet } from '@hub/hooks/useWallet';
import cx from '@hub/lib/cx';
import { GovernanceTokenType } from '@hub/types/GovernanceTokenType';
import { GovernanceVoteTipping } from '@hub/types/GovernanceVoteTipping';

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
      return 'Edit Wallet Rules';
    case Step.Summary:
      return 'Create Proposal';
  }
}

interface Props {
  className?: string;
  realmUrlId: string;
}

// TODO generate defaults
export function NewWallet(props: Props) {
  const wallet = useWallet();
  const router = useRouter();
  const [step, setStep] = useState(Step.Form);
  const [proposalVoteType, setProposalVoteType] = useState<
    'community' | 'council'
  >('community');
  const [proposalDescription, setProposalDescription] = useState('');
  const [proposalTitle, setProposalTitle] = useState('');

  const [communityRules, setCommunityRules] = useState<CommunityRules>({
    canCreateProposal: true,
    canVeto: false,
    canVote: false,
    quorumPercent: 1,
    // this isn't a valid value, but it's just to satisfy the types for the
    // default initialized value
    tokenMintAddress: new PublicKey(0),
    tokenMintDecimals: new BigNumber(0),
    tokenType: GovernanceTokenType.Community,
    totalSupply: new BigNumber(1),
    vetoQuorumPercent: 100,
    voteTipping: GovernanceVoteTipping.Disabled,
    votingPowerToCreateProposals: new BigNumber(1),
  });

  const [councilRules, setCouncilRules] = useState<CouncilRules>(null);
  const [coolOffHours, setCoolOffHours] = useState(0);
  const [depositExemptProposalCount, setDepositExemptProposalCount] = useState(
    0,
  );
  const [baseVoteDays, setBaseVoteDays] = useState(3);
  const [maxVoteDays, setMaxVoteDays] = useState(3);
  const [minInstructionHoldupDays, setMinInstructionHoldupDays] = useState(0);

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

  return (
    <div className={cx(props.className, 'dark:bg-neutral-900')}>
      <ProposalCreationProgress progress={progress} />
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
                communityRules={communityRules}
                coolOffHours={coolOffHours}
                councilRules={councilRules}
                initialCommunityRules={governance.communityTokenRules}
                initialCouncilRules={governance.councilTokenRules}
                depositExemptProposalCount={depositExemptProposalCount}
                governanceAddress={governance.governanceAddress}
                maxVoteDays={maxVoteDays}
                minInstructionHoldupDays={minInstructionHoldupDays}
                programVersion={governance.version}
                walletAddress={governance.walletAddress}
                onCommunityRulesChange={setCommunityRules}
                onCoolOffHoursChange={(coolOffHours) => {
                  setCoolOffHours(coolOffHours);
                  const maxVotingSeconds = hoursToSeconds(maxVoteDays * 24);
                  const coolOffSeconds = hoursToSeconds(coolOffHours);
                  const baseVotingSeconds = maxVotingSeconds - coolOffSeconds;
                  setBaseVoteDays(secondsToHours(baseVotingSeconds) / 24);
                }}
                onCouncilRulesChange={setCouncilRules}
                onDepositExemptProposalCountChange={
                  setDepositExemptProposalCount
                }
                onMaxVoteDaysChange={(votingDays) => {
                  setMaxVoteDays(votingDays);
                  const maxVotingSeconds = hoursToSeconds(24 * votingDays);
                  const coolOffSeconds = hoursToSeconds(coolOffHours);
                  const baseVotingSeconds = maxVotingSeconds - coolOffSeconds;
                  setBaseVoteDays(secondsToHours(baseVotingSeconds) / 24);
                }}
                onMinInstructionHoldupDaysChange={setMinInstructionHoldupDays}
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
                communityRules={communityRules}
                coolOffHours={coolOffHours}
                councilRules={councilRules}
                initialCommunityRules={governance.communityTokenRules}
                initialCoolOffHours={governance.coolOffHours}
                initialCouncilRules={governance.councilTokenRules}
                initialDepositExemptProposalCount={
                  governance.depositExemptProposalCount
                }
                initialBaseVoteDays={governance.maxVoteDays}
                initialMinInstructionHoldupDays={
                  governance.minInstructionHoldupDays
                }
                depositExemptProposalCount={depositExemptProposalCount}
                governanceAddress={governance.governanceAddress}
                baseVoteDays={baseVoteDays}
                minInstructionHoldupDays={minInstructionHoldupDays}
                proposalDescription={proposalDescription}
                proposalTitle={proposalTitle}
                proposalVoteType={proposalVoteType}
                walletAddress={governance.walletAddress}
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
                  Edit Rules
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
                  Create Proposal
                </Primary>
              </footer>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
