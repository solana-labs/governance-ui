import CheckmarkIcon from '@carbon/icons-react/lib/Checkmark';
import ChevronLeftIcon from '@carbon/icons-react/lib/ChevronLeft';
import EditIcon from '@carbon/icons-react/lib/Edit';
import { PublicKey } from '@solana/web3.js';
import { BigNumber } from 'bignumber.js';
import { pipe } from 'fp-ts/function';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

import { getAccountName } from '@components/instructions/tools';
import { Primary, Secondary } from '@hub/components/controls/Button';
import { useProposal } from '@hub/hooks/useProposal';
import { useQuery } from '@hub/hooks/useQuery';
import { abbreviateAddress } from '@hub/lib/abbreviateAddress';
import cx from '@hub/lib/cx';
import { GovernanceTokenType } from '@hub/types/GovernanceTokenType';
import { GovernanceVoteTipping } from '@hub/types/GovernanceVoteTipping';
import * as RE from '@hub/types/Result';

import { MAX_NUM } from './constants';
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

export function EditWalletRules(props: Props) {
  const { createProposal } = useProposal();
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
  >('council');
  const [proposalDescription, setProposalDescription] = useState('');

  const [communityRules, setCommunityRules] = useState<CommunityRules>({
    canCreateProposal: true,
    canVeto: false,
    canVote: false,
    quorumPercent: 1,
    // this isn't a valid value, but it's just to satisfy the types for the
    // default initialized value
    tokenMintAddress: props.governanceAddress,
    tokenType: GovernanceTokenType.Community,
    totalSupply: new BigNumber(1),
    vetoQuorumPercent: 100,
    voteTipping: GovernanceVoteTipping.Disabled,
    votingPowerToCreateProposals: MAX_NUM,
  });

  const [councilRules, setCouncilRules] = useState<CouncilRules>(null);
  const [coolOffHours, setCoolOffHours] = useState(0);
  const [depositExemptProposalCount, setDepositExemptProposalCount] = useState(
    0,
  );

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
      setMaxVoteDays(data.maxVoteDays);
      setMinInstructionHoldupDays(data.minInstructionHoldupDays);

      if (!data.councilTokenRules) {
        setProposalVoteType('community');
      }
    }
  }, [result._tag]);

  return pipe(
    result,

    RE.match(
      () => <div />,
      () => <div />,
      ({ realmByUrlId: { governance, programPublicKey, publicKey } }) => {
        const walletName =
          getAccountName(governance.walletAddress) ||
          getAccountName(governance.governanceAddress) ||
          governance.walletAddress.toBase58();

        return (
          <div className={cx(props.className, 'dark:bg-neutral-900')}>
            <div className="w-full max-w-3xl pt-14 mx-auto">
              <Head>
                <title>
                  Edit Wallet Rules -{' '}
                  {abbreviateAddress(governance.walletAddress)}
                </title>
                <meta
                  property="og:title"
                  content={`Edit Wallet Rules - ${governance.walletAddress.toBase58()}`}
                  key="title"
                />
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
                      walletAddress={governance.walletAddress}
                      onCommunityRulesChange={setCommunityRules}
                      onCoolOffHoursChange={setCoolOffHours}
                      onCouncilRulesChange={setCouncilRules}
                      onDepositExemptProposalCountChange={
                        setDepositExemptProposalCount
                      }
                      onMaxVoteDaysChange={setMaxVoteDays}
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
                      currentMaxVoteDays={governance.maxVoteDays}
                      currentMinInstructionHoldupDays={
                        governance.minInstructionHoldupDays
                      }
                      depositExemptProposalCount={depositExemptProposalCount}
                      governanceAddress={governance.governanceAddress}
                      maxVoteDays={maxVoteDays}
                      minInstructionHoldupDays={minInstructionHoldupDays}
                      proposalDescription={proposalDescription}
                      proposalVoteType={proposalVoteType}
                      walletAddress={governance.walletAddress}
                      onProposalVoteTypeChange={setProposalVoteType}
                      onProposalDescriptionChange={setProposalDescription}
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

                          const proposalAddress = await createProposal({
                            governingTokenMintPublicKey,
                            programPublicKey,
                            proposalDescription,
                            governancePublicKey: governance.governanceAddress,
                            instructions: [transaction],
                            isDraft: false,
                            proposalTitle: `Update Wallet Rules for “${walletName}”`,
                            realmPublicKey: publicKey,
                          });

                          if (proposalAddress) {
                            router.push(
                              `/dao/${
                                props.realmUrlId
                              }/proposal/${proposalAddress.toBase58()}`,
                            );
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
