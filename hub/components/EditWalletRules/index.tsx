import { VoteTipping } from '@solana/spl-governance';
import type { PublicKey } from '@solana/web3.js';
import Head from 'next/head';
import { useState } from 'react';

import { abbreviateAddress } from '@hub/lib/abbreviateAddress';
import cx from '@hub/lib/cx';

import { Form } from './Form';

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
      return 'Summary';
  }
}

interface Props {
  className?: string;
  realmUrlId: string;
  walletAddress: PublicKey;
}

export function EditWalletRules(props: Props) {
  const [step, setStep] = useState(Step.Form);
  const [proposalVoteType, setProposalVoteType] = useState<
    'community' | 'council'
  >('council');

  const [communityCanCreate, setCommunityCanCreate] = useState(true);
  const [communityHasVeto, setCommunityHasVeto] = useState(false);
  const [communityQuorumPercent, setCommunityQuorumPercent] = useState(0);
  const [communityVoteTipping, setCommunityVoteTipping] = useState(
    VoteTipping.Disabled,
  );
  const [coolOffHours, setCoolOffHours] = useState(0);
  const [councilCanCreate, setCouncilCanCreate] = useState(true);
  const [councilHasVeto, setCouncilHasVeto] = useState(false);
  const [councilQuorumPercent, setCouncilQuorumPercent] = useState(0);
  const [councilVoteTipping, setCouncilVoteTipping] = useState(
    VoteTipping.Disabled,
  );
  const [maxVoteDays, setMaxVoteDays] = useState(3);
  const [minCommunityPower, setMinCommunityPower] = useState(0);
  const [minCouncilPower, setMinCouncilPower] = useState(0);

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
        {step === Step.Form && (
          <Form
            className="py-16"
            communityCanCreate={communityCanCreate}
            communityHasVeto={communityHasVeto}
            communityQuorumPercent={communityQuorumPercent}
            communityVoteTipping={communityVoteTipping}
            coolOffHours={coolOffHours}
            councilCanCreate={councilCanCreate}
            councilHasVeto={councilHasVeto}
            councilQuorumPercent={councilQuorumPercent}
            councilVoteTipping={councilVoteTipping}
            maxVoteDays={maxVoteDays}
            minCommunityPower={minCommunityPower}
            minCouncilPower={minCouncilPower}
            walletAddress={props.walletAddress}
            onCommunityCanCreateChange={setCommunityCanCreate}
            onCommunityHasVetoChange={setCommunityHasVeto}
            onCommunityQuorumPercentChange={setCommunityQuorumPercent}
            onCommunityVoteTippingChange={setCommunityVoteTipping}
            onCoolOffHoursChange={setCoolOffHours}
            onCouncilCanCreateChange={setCouncilCanCreate}
            onCouncilHasVetoChange={setCouncilHasVeto}
            onCouncilQuorumPercentChange={setCouncilQuorumPercent}
            onCouncilVoteTippingChange={setCouncilVoteTipping}
            onMaxVoteDaysChange={setMaxVoteDays}
            onMinCommunityPowerChange={setMinCommunityPower}
            onMinCouncilPowerChange={setMinCouncilPower}
          />
        )}
      </div>
    </div>
  );
}
