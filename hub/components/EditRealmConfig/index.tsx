import CheckmarkIcon from '@carbon/icons-react/lib/Checkmark';
import ChevronLeftIcon from '@carbon/icons-react/lib/ChevronLeft';
import EditIcon from '@carbon/icons-react/lib/Edit';
import { getRealm, GoverningTokenType } from '@solana/spl-governance';
import { PublicKey } from '@solana/web3.js';
import { pipe } from 'fp-ts/lib/function';
import { TypeOf } from 'io-ts';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState, useRef } from 'react';

import { Primary, Secondary } from '@hub/components/controls/Button';
import { Connect } from '@hub/components/GlobalHeader/User/Connect';
import { ProposalCreationProgress } from '@hub/components/ProposalCreationProgress';
import { useCluster, ClusterType } from '@hub/hooks/useCluster';
import { useProposal } from '@hub/hooks/useProposal';
import { useQuery } from '@hub/hooks/useQuery';
import { useToast, ToastType } from '@hub/hooks/useToast';
import { useWallet } from '@hub/hooks/useWallet';
import cx from '@hub/lib/cx';
import * as RE from '@hub/types/Result';

import { createTransaction } from './createTransaction';
import { fetchConfig, Config } from './fetchConfig';
import { Form } from './Form';
import * as gql from './gql';
import { RealmHeader } from './RealmHeader';
import { Summary } from './Summary';

type Governance = TypeOf<
  typeof gql.getGovernanceResp
>['realmByUrlId']['governance'];

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
      return 'Update Org Configuration';
    case Step.Summary:
      return 'Create Proposal';
  }
}

interface Props {
  className?: string;
  realmUrlId: string;
}

export function EditRealmConfig(props: Props) {
  const [cluster] = useCluster();
  const wallet = useWallet();
  const [step, setStep] = useState(Step.Form);
  const [realmAuthority, setRealmAuthority] = useState<PublicKey | undefined>(
    undefined,
  );
  const [result] = useQuery(gql.getRealmResp, {
    query: gql.getRealm,
    variables: {
      realmUrlId: props.realmUrlId,
    },
  });
  const [governance, setGovernance] = useState<Governance | null>(null);
  const [governanceResult] = useQuery(gql.getGovernanceResp, {
    query: gql.getGovernance,
    variables: {
      realmUrlId: props.realmUrlId,
      governancePublicKey: realmAuthority?.toBase58(),
    },
    pause: !realmAuthority,
  });
  const router = useRouter();
  const { publish } = useToast();
  const [submitting, setSubmitting] = useState(false);

  const [proposalVoteType, setProposalVoteType] = useState<
    'community' | 'council'
  >('community');
  const [proposalDescription, setProposalDescription] = useState('');
  const [proposalTitle, setProposalTitle] = useState(
    'Update Realms Configuration',
  );

  const [config, setConfig] = useState<Config | null>(null);
  const existingConfig = useRef<Config | null>(null);
  const { createProposal, progress } = useProposal();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0 });
    }
  }, [step]);

  useEffect(() => {
    if (RE.isOk(result)) {
      (wallet.publicKey ? Promise.resolve(wallet.publicKey) : wallet.connect())
        .then((publicKey) =>
          fetchConfig(
            cluster.connection,
            result.data.realmByUrlId.publicKey,
            result.data.realmByUrlId.programPublicKey,
            {
              publicKey,
              signAllTransactions: wallet.signAllTransactions,
              signTransaction: wallet.signTransaction,
            },
            cluster.type === ClusterType.Devnet,
          ),
        )
        .then((config) => {
          setConfig({ ...config });
          setProposalTitle(
            `Update Realms Config for "${result.data.realmByUrlId.name}"`,
          );

          existingConfig.current = {
            ...config,
            config: { ...config.config },
            configAccount: {
              ...config.configAccount,
              communityTokenConfig: {
                ...config.configAccount.communityTokenConfig,
              },
              councilTokenConfig: {
                ...config.configAccount.councilTokenConfig,
              },
            },
          };
        })
        .then(() =>
          getRealm(cluster.connection, result.data.realmByUrlId.publicKey).then(
            (realm) => {
              setRealmAuthority(realm.account.authority);
            },
          ),
        );
    }
  }, [result._tag]);

  useEffect(() => {
    if (RE.isOk(governanceResult)) {
      setGovernance(governanceResult.data.realmByUrlId.governance);

      if (existingConfig.current) {
        if (
          existingConfig.current.config.councilMint &&
          (existingConfig.current.configAccount.communityTokenConfig
            .tokenType === GoverningTokenType.Dormant ||
            !governanceResult.data.realmByUrlId.governance.communityTokenRules
              .canCreateProposal)
        ) {
          setProposalVoteType('council');
        }
      }
    }
  }, [governanceResult._tag]);

  return pipe(
    result,
    RE.match(
      () => <div />,
      () => <div />,
      ({ me, realmByUrlId }) => {
        if (!me && !(wallet.softConnect && wallet.publicKey)) {
          return (
            <div className={cx(props.className, 'dark:bg-neutral-900')}>
              <Head>
                <title>Edit Org Config - {realmByUrlId.name}</title>
                <meta
                  property="og:title"
                  content={`Edit Org Config - ${realmByUrlId.name}`}
                  key="title"
                />
              </Head>
              <div className="w-full max-w-3xl pt-14 mx-auto grid place-items-center">
                <div className="my-16 py-8 px-16 dark:bg-black/40 rounded flex flex-col items-center">
                  <div className="text-white mb-2 text-center">
                    Please sign in to edit the realm config
                    <br />
                    for "{realmByUrlId.name}"
                  </div>
                  <Connect />
                </div>
              </div>
            </div>
          );
        }

        if (!(config && existingConfig.current && governance)) {
          return <div />;
        }

        const userPublicKey = (me?.publicKey || wallet.publicKey) as PublicKey;

        return (
          <div className={cx(props.className, 'dark:bg-neutral-900')}>
            <ProposalCreationProgress progress={progress} />
            <div className="w-full max-w-3xl pt-14 mx-auto">
              <Head>
                <title>Edit Org Config - {realmByUrlId.name}</title>
                <meta
                  property="og:title"
                  content={`Edit Org Config - ${realmByUrlId.name}`}
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
                <RealmHeader
                  className="mb-2.5"
                  realmIconUrl={realmByUrlId.iconUrl}
                  realmName={realmByUrlId.name}
                />
                {step === Step.Form && (
                  <>
                    <Form
                      className="mb-16"
                      config={config}
                      councilRules={governance.councilTokenRules}
                      currentConfig={existingConfig.current}
                      walletAddress={userPublicKey}
                      onConfigChange={setConfig}
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
                      config={config}
                      currentConfig={existingConfig.current}
                      governance={governance}
                      proposalDescription={proposalDescription}
                      proposalTitle={proposalTitle}
                      proposalVoteType={proposalVoteType}
                      walletAddress={userPublicKey}
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
                        Go Back
                      </button>
                      <Primary
                        className="ml-16 h-14 w-44"
                        pending={submitting}
                        onClick={async () => {
                          if (!existingConfig.current) {
                            return;
                          }

                          setSubmitting(true);

                          const userPublicKey = await wallet.connect();

                          const transaction = await createTransaction(
                            realmByUrlId.programPublicKey,
                            realmByUrlId.publicKey,
                            governance.governanceAddress,
                            config,
                            existingConfig.current,
                            cluster.connection,
                            cluster.type === ClusterType.Devnet,
                            {
                              publicKey: userPublicKey,
                              signAllTransactions: wallet.signAllTransactions,
                              signTransaction: wallet.signTransaction,
                            },
                          );

                          const governingTokenMintPublicKey =
                            proposalVoteType === 'council' &&
                            existingConfig.current.config.councilMint
                              ? existingConfig.current.config.councilMint
                              : existingConfig.current.communityMint.publicKey;

                          try {
                            const proposalAddress = await createProposal({
                              proposalDescription,
                              proposalTitle,
                              governingTokenMintPublicKey,
                              programPublicKey: realmByUrlId.programPublicKey,
                              governancePublicKey: governance.governanceAddress,
                              instructions: transaction,
                              isDraft: false,
                              realmPublicKey: realmByUrlId.publicKey,
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
                            console.error(e);
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
