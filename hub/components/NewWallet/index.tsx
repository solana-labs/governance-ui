import CheckmarkIcon from '@carbon/icons-react/lib/Checkmark';
import ChevronLeftIcon from '@carbon/icons-react/lib/ChevronLeft';
import EditIcon from '@carbon/icons-react/lib/Edit';
import { PublicKey } from '@solana/web3.js';
import { BigNumber } from 'bignumber.js';
import { hoursToSeconds, secondsToHours } from 'date-fns';
import { pipe } from 'fp-ts/function';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useMemo, useState } from 'react';

import { getAccountName } from '@components/instructions/tools';
import { Primary, Secondary } from '@hub/components/controls/Button';
import { Connect } from '@hub/components/GlobalHeader/User/Connect';
import { ProposalCreationProgress } from '@hub/components/ProposalCreationProgress';
import { useCluster, ClusterType } from '@hub/hooks/useCluster';
import { useProposal } from '@hub/hooks/useProposal';
import { useQuery } from '@hub/hooks/useQuery';
import { useToast, ToastType } from '@hub/hooks/useToast';
import { useWallet } from '@hub/hooks/useWallet';
import cx from '@hub/lib/cx';
import { GovernanceTokenType } from '@hub/types/GovernanceTokenType';
import { GovernanceVoteTipping } from '@hub/types/GovernanceVoteTipping';
import * as RE from '@hub/types/Result';

import { createTransaction } from './createTransaction';
import { Form } from './Form';
import * as gql from './gql';
import { Summary } from './Summary';
import { CommunityRules, CouncilRules } from './types';

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
  governanceAddress: PublicKey;
}

export function NewWallet(props: Props) {
  const [cluster] = useCluster();
  const wallet = useWallet();
  const { createProposal, progress } = useProposal();
  const { publish } = useToast();
  const [result] = useQuery(gql.getGovernanceRulesResp, {
    query: gql.getGovernanceRules,
    variables: {
      realmUrlId: props.realmUrlId,
      governancePublicKey: props.governanceAddress.toBase58(),
    },
  });

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
    tokenMintAddress: props.governanceAddress,
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

  useEffect(() => {
    if (RE.isOk(result)) {
      const data = result.data.realmByUrlId.governance;

      setCommunityRules(data.communityTokenRules);
      setCoolOffHours(data.coolOffHours);
      setCouncilRules(data.councilTokenRules);
      setDepositExemptProposalCount(data.depositExemptProposalCount);

      // maxVotingDays is actually misnamed on-chain. It should be `baseVotingDays`
      const baseVotingSeconds = hoursToSeconds(24 * data.maxVoteDays);
      const coolOffSeconds = hoursToSeconds(data.coolOffHours);
      const maxVotingSeconds = baseVotingSeconds + coolOffSeconds;

      setBaseVoteDays(data.maxVoteDays);
      setMaxVoteDays(maxVotingSeconds / 60 / 60 / 24);
      setMinInstructionHoldupDays(data.minInstructionHoldupDays);

      if (!data.councilTokenRules) {
        setProposalVoteType('community');
      } else if (!data.communityTokenRules.canVote) {
        setProposalVoteType('council');
      }

      const walletName =
        getAccountName(data.walletAddress) ||
        getAccountName(data.governanceAddress) ||
        data.walletAddress.toBase58();

      const title = `Update Wallet Rules for “${walletName}”`;

      setProposalTitle(title);
    }
  }, [result._tag]);

  return pipe(
    result,
    RE.match(
      () => <div />,
      () => <div />,
      ({ me, realmByUrlId: { programPublicKey, publicKey } }) => {
        if (!me && !(wallet.softConnect && wallet.publicKey)) {
          return (
            <div className={cx(props.className, 'dark:bg-neutral-900')}>
              <Head>
                <title>New Wallet</title>
                <meta property="og:title" content={`New Wallet`} key="title" />
              </Head>
              <div className="w-full max-w-3xl pt-14 mx-auto grid place-items-center">
                <div className="my-16 py-8 px-16 dark:bg-black/40 rounded flex flex-col items-center">
                  <div className="text-white mb-2 text-center">
                    Please sign in to create a new wallet
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
                <title>New Wallet</title>
                <meta property="og:title" content={`New Wallet`} key="title" />
              </Head>
              <div className="flex items-center mt-4">
                <div className="text-sm dark:text-neutral-500">
                  Step {stepNum(step)} of 2
                </div>
                <div className="text-sm dark:text-white ml-2">
                  {stepName(step)}
                </div>
              </div>
              <div className="py-16">
                {step === Step.Form && (
                  <>
                    <Form
                      className="mb-16"
                      communityRules={communityRules}
                      coolOffHours={coolOffHours}
                      councilRules={councilRules}
                      currentCommunityRules={governance.communityTokenRules}
                      currentCouncilRules={governance.councilTokenRules}
                      depositExemptProposalCount={depositExemptProposalCount}
                      governanceAddress={governance.governanceAddress}
                      maxVoteDays={maxVoteDays}
                      minInstructionHoldupDays={minInstructionHoldupDays}
                      programVersion={governance.version}
                      walletAddress={governance.walletAddress}
                      onCommunityRulesChange={setCommunityRules}
                      onCoolOffHoursChange={(coolOffHours) => {
                        setCoolOffHours(coolOffHours);
                        const maxVotingSeconds = hoursToSeconds(
                          maxVoteDays * 24,
                        );
                        const coolOffSeconds = hoursToSeconds(coolOffHours);
                        const baseVotingSeconds =
                          maxVotingSeconds - coolOffSeconds;
                        setBaseVoteDays(secondsToHours(baseVotingSeconds) / 24);
                      }}
                      onCouncilRulesChange={setCouncilRules}
                      onDepositExemptProposalCountChange={
                        setDepositExemptProposalCount
                      }
                      onMaxVoteDaysChange={(votingDays) => {
                        setMaxVoteDays(votingDays);
                        const maxVotingSeconds = hoursToSeconds(
                          24 * votingDays,
                        );
                        const coolOffSeconds = hoursToSeconds(coolOffHours);
                        const baseVotingSeconds =
                          maxVotingSeconds - coolOffSeconds;
                        setBaseVoteDays(secondsToHours(baseVotingSeconds) / 24);
                      }}
                      onMinInstructionHoldupDaysChange={
                        setMinInstructionHoldupDays
                      }
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
                    <Summary
                      className="mb-16"
                      communityRules={communityRules}
                      coolOffHours={coolOffHours}
                      councilRules={councilRules}
                      currentCommunityRules={governance.communityTokenRules}
                      currentCoolOffHours={governance.coolOffHours}
                      currentCouncilRules={governance.councilTokenRules}
                      currentDepositExemptProposalCount={
                        governance.depositExemptProposalCount
                      }
                      currentBaseVoteDays={governance.maxVoteDays}
                      currentMinInstructionHoldupDays={
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

                          const transaction = createTransaction(
                            programPublicKey,
                            governance.version,
                            governance.governanceAddress,
                            {
                              coolOffHours,
                              depositExemptProposalCount,
                              maxVoteDays,
                              minInstructionHoldupDays,
                              communityTokenRules: communityRules,
                              councilTokenRules: councilRules,
                              governanceAddress: governance.governanceAddress,
                              version: governance.version,
                              walletAddress: governance.walletAddress,
                            },
                          );

                          const governingTokenMintPublicKey =
                            proposalVoteType === 'council' &&
                            governance.councilTokenRules
                              ? governance.councilTokenRules.tokenMintAddress
                              : governance.communityTokenRules.tokenMintAddress;

                          try {
                            const proposalAddress = await createProposal({
                              governingTokenMintPublicKey,
                              programPublicKey,
                              proposalDescription,
                              proposalTitle,
                              governancePublicKey: governance.governanceAddress,
                              instructions: [transaction],
                              isDraft: false,
                              realmPublicKey: publicKey,
                              councilTokenMintPublicKey:
                                governance.councilTokenRules
                                  ?.tokenMintAddress || undefined,
                              communityTokenMintPublicKey:
                                governance.communityTokenRules.tokenMintAddress,
                            });

                            if (proposalAddress) {
                              router.push(
                                `/dao/${
                                  props.realmUrlId
                                }/proposal/${proposalAddress.toBase58()}` +
                                  (cluster.type === ClusterType.Devnet
                                    ? '?cluster=devnet'
                                    : ''),
                              );
                            }
                          } catch (e) {
                            publish({
                              type: ToastType.Error,
                              title: 'Could not create proposal.',
                              message: String(e),
                            });
                          }

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
      },
    ),
  );
}
