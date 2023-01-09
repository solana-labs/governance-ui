import CheckmarkIcon from '@carbon/icons-react/lib/Checkmark';
import ChevronLeftIcon from '@carbon/icons-react/lib/ChevronLeft';
import EditIcon from '@carbon/icons-react/lib/Edit';
import { VoteTipping } from '@solana/spl-governance';
import type { PublicKey } from '@solana/web3.js';
import { BigNumber } from 'bignumber.js';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

import { Primary, Secondary } from '@hub/components/controls/Button';
import { abbreviateAddress } from '@hub/lib/abbreviateAddress';
import cx from '@hub/lib/cx';

import { Form } from './Form';
import { Summary } from './Summary';

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
  walletAddress: PublicKey;
}

export function EditWalletRules(props: Props) {
  const router = useRouter();
  const [step, setStep] = useState(Step.Form);
  const [proposalVoteType, setProposalVoteType] = useState<
    'community' | 'council'
  >('council');
  const [proposalDescription, setProposalDescription] = useState('');

  const [communityCanCreate, setCommunityCanCreate] = useState(true);
  const [communityHasVeto, setCommunityHasVeto] = useState(false);
  const [communityQuorumPercent, setCommunityQuorumPercent] = useState(0);
  const [communityTokenSupply, setCommunityTokenSupply] = useState(
    new BigNumber(1000000),
  );
  const [communityVetoQuorum, setCommunityVetoQuorum] = useState(0);
  const [communityVoteTipping, setCommunityVoteTipping] = useState(
    VoteTipping.Disabled,
  );
  const [coolOffHours, setCoolOffHours] = useState(0);
  const [councilCanCreate, setCouncilCanCreate] = useState(true);
  const [councilHasVeto, setCouncilHasVeto] = useState(false);
  const [councilQuorumPercent, setCouncilQuorumPercent] = useState(0);
  const [councilTokenSupply, setCouncilTokenSupply] = useState(
    new BigNumber(100),
  );
  const [councilVetoQuorum, setCouncilVetoQuorum] = useState(0);
  const [councilVoteTipping, setCouncilVoteTipping] = useState(
    VoteTipping.Disabled,
  );
  const [depositExemptProposalCount, setDepositExemptProposalCount] = useState(
    0,
  );
  const [currentMaxVoteDays, setCurrentMaxVoteDays] = useState(3);
  const [currentMinCommunityPower, setCurrentMinCommunityPower] = useState(
    new BigNumber(0),
  );
  const [currentMinCouncilPower, setCurrentMinCouncilPower] = useState(
    new BigNumber(0),
  );

  const [currentCommunityCanCreate, setCurrentCommunityCanCreate] = useState(
    true,
  );
  const [currentCommunityHasVeto, setCurrentCommunityHasVeto] = useState(true);
  const [
    currentCommunityQuorumPercent,
    setCurrentCommunityQuorumPercent,
  ] = useState(0);
  const [currentCommunityVetoQuorum, setCurrentCommunityVetoQuorum] = useState(
    0,
  );
  const [
    currentCommunityVoteTipping,
    setCurrentCommunityVoteTipping,
  ] = useState(VoteTipping.Disabled);
  const [currentCoolOffHours, setCurrentCoolOffHours] = useState(0);
  const [currentCouncilCanCreate, setCurrentCouncilCanCreate] = useState(true);
  const [currentCouncilHasVeto, setCurrentCouncilHasVeto] = useState(false);
  const [
    currentCouncilQuorumPercent,
    setCurrentCouncilQuorumPercent,
  ] = useState(0);
  const [currentCouncilVetoQuorum, setCurrentCouncilVetoQuorum] = useState(0);

  const [currentCouncilVoteTipping, setCurrentCouncilVoteTipping] = useState(
    VoteTipping.Disabled,
  );
  const [
    currentDepositExemptProposalCount,
    setCurrentDepositExemptProposalCount,
  ] = useState(0);
  const [maxVoteDays, setMaxVoteDays] = useState(3);
  const [minCommunityPower, setMinCommunityPower] = useState(new BigNumber(0));
  const [minCouncilPower, setMinCouncilPower] = useState(new BigNumber(0));

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0 });
    }
  }, [step]);

  useEffect(() => {
    if (!communityHasVeto) {
      setCommunityVetoQuorum(50);
    }
  }, [communityHasVeto]);

  useEffect(() => {
    if (!councilHasVeto) {
      setCouncilVetoQuorum(50);
    }
  }, [councilHasVeto]);

  return (
    <div className={cx(props.className, 'dark:bg-neutral-900')}>
      <div className="w-full max-w-3xl pt-14 mx-auto">
        <Head>
          <title>
            Edit Wallet Rules - {abbreviateAddress(props.walletAddress)}
          </title>
          <meta
            property="og:title"
            content={`Edit Wallet Rules - ${props.walletAddress.toBase58()}`}
            key="title"
          />
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
              <Form
                className="mb-16"
                communityCanCreate={communityCanCreate}
                communityHasVeto={communityHasVeto}
                communityQuorumPercent={communityQuorumPercent}
                communityTokenSupply={communityTokenSupply}
                communityVetoQuorum={communityVetoQuorum}
                communityVoteTipping={communityVoteTipping}
                coolOffHours={coolOffHours}
                councilCanCreate={councilCanCreate}
                councilHasVeto={councilHasVeto}
                councilQuorumPercent={councilQuorumPercent}
                councilTokenSupply={councilTokenSupply}
                councilVetoQuorum={councilVetoQuorum}
                councilVoteTipping={councilVoteTipping}
                depositExemptProposalCount={depositExemptProposalCount}
                maxVoteDays={maxVoteDays}
                minCommunityPower={minCommunityPower}
                minCouncilPower={minCouncilPower}
                walletAddress={props.walletAddress}
                onCommunityCanCreateChange={setCommunityCanCreate}
                onCommunityHasVetoChange={setCommunityHasVeto}
                onCommunityQuorumPercentChange={setCommunityQuorumPercent}
                onCommunityVetoQuorumChange={setCommunityVetoQuorum}
                onCommunityVoteTippingChange={setCommunityVoteTipping}
                onCoolOffHoursChange={setCoolOffHours}
                onCouncilCanCreateChange={setCouncilCanCreate}
                onCouncilHasVetoChange={setCouncilHasVeto}
                onCouncilQuorumPercentChange={setCouncilQuorumPercent}
                onCouncilVetoQuorumChange={setCouncilVetoQuorum}
                onCouncilVoteTippingChange={setCouncilVoteTipping}
                onDepositExemptProposalCountChange={
                  setDepositExemptProposalCount
                }
                onMaxVoteDaysChange={setMaxVoteDays}
                onMinCommunityPowerChange={setMinCommunityPower}
                onMinCouncilPowerChange={setMinCouncilPower}
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
                communityCanCreate={communityCanCreate}
                communityHasVeto={communityHasVeto}
                communityQuorumPercent={communityQuorumPercent}
                communityVetoQuorum={communityVetoQuorum}
                communityVoteTipping={communityVoteTipping}
                coolOffHours={coolOffHours}
                councilCanCreate={councilCanCreate}
                councilHasVeto={councilHasVeto}
                councilQuorumPercent={councilQuorumPercent}
                councilVetoQuorum={councilVetoQuorum}
                councilVoteTipping={councilVoteTipping}
                currentCommunityCanCreate={currentCommunityCanCreate}
                currentCommunityHasVeto={currentCommunityHasVeto}
                currentCommunityQuorumPercent={currentCommunityQuorumPercent}
                currentCommunityVetoQuorum={currentCommunityVetoQuorum}
                currentCommunityVoteTipping={currentCommunityVoteTipping}
                currentCoolOffHours={currentCoolOffHours}
                currentCouncilCanCreate={currentCouncilCanCreate}
                currentCouncilHasVeto={currentCouncilHasVeto}
                currentCouncilQuorumPercent={currentCouncilQuorumPercent}
                currentCouncilVetoQuorum={currentCouncilVetoQuorum}
                currentCouncilVoteTipping={currentCouncilVoteTipping}
                currentDepositExemptProposalCount={
                  currentDepositExemptProposalCount
                }
                currentMaxVoteDays={currentMaxVoteDays}
                currentMinCommunityPower={currentMinCommunityPower}
                currentMinCouncilPower={currentMinCouncilPower}
                depositExemptProposalCount={depositExemptProposalCount}
                maxVoteDays={maxVoteDays}
                minCommunityPower={minCommunityPower}
                minCouncilPower={minCouncilPower}
                proposalDescription={proposalDescription}
                proposalVoteType={proposalVoteType}
                walletAddress={props.walletAddress}
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
                <Primary className="ml-16 h-14 w-44">
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
