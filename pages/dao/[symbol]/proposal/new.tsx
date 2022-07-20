import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { createContext, useEffect, useState } from 'react';
import * as yup from 'yup';
import { ArrowLeftIcon } from '@heroicons/react/outline';
import {
  getInstructionDataFromBase64,
  Governance,
  ProgramAccount,
} from '@solana/spl-governance';
import Button, { SecondaryButton } from '@components/Button';
import Input from '@components/inputs/Input';
import Textarea from '@components/inputs/Textarea';
import TokenBalanceCardWrapper from '@components/TokenBalance/TokenBalanceCardWrapper';
import useCreateProposal from '@hooks/useCreateProposal';
import useGovernanceAssets from '@hooks/useGovernanceAssets';
import useQueryContext from '@hooks/useQueryContext';
import useRealm from '@hooks/useRealm';
import { getTimestampFromDays } from '@tools/sdk/units';
import { formValidation, isFormValid } from '@utils/formValidation';
import {
  ComponentInstructionData,
  InstructionsContext,
  FormInstructionData,
} from '@utils/uiTypes/proposalCreationTypes';

import useWalletStore from 'stores/useWalletStore';
import { notify } from 'utils/notifications';

import VoteBySwitch from './components/VoteBySwitch';
import InstructionsForm from '@components/InstructionsForm';
import GovernedAccountSelect from './components/GovernedAccountSelect';
import useGovernedMultiTypeAccounts from '@hooks/useGovernedMultiTypeAccounts';
import { GovernedMultiTypeAccount } from '@utils/tokens';
import DryRunInstructionsBtn from './components/DryRunInstructionsBtn';

type Form = {
  title: string;
  description: string;
};

const schema = yup.object().shape({
  title: yup.string().required('Title is required'),
  description: yup.string(),
});

const defaultGovernanceCtx: InstructionsContext = {
  instructions: [],
  handleSetInstruction: () => null,
};

export const NewProposalContext = createContext<InstructionsContext>(
  defaultGovernanceCtx,
);

const New = () => {
  const router = useRouter();
  const { handleCreateProposal } = useCreateProposal();
  const { fmtUrlWithCluster } = useQueryContext();
  const { symbol, realm, realmDisplayName, canChooseWhoVote } = useRealm();
  const { availableInstructions } = useGovernanceAssets();
  const {
    fetchRealmGovernance,
    fetchTokenAccountsForSelectedRealmGovernance,
  } = useWalletStore((s) => s.actions);
  const connected = useWalletStore((s) => s.connected);
  const [voteByCouncil, setVoteByCouncil] = useState(true);
  const [form, setForm] = useState<Form>({
    title: '',
    description: '',
  });
  const [formErrors, setFormErrors] = useState({});
  const [isLoadingSignedProposal, setIsLoadingSignedProposal] = useState(false);
  const [isLoadingDraft, setIsLoadingDraft] = useState(false);
  const isLoading = isLoadingSignedProposal || isLoadingDraft;

  const { governedMultiTypeAccounts } = useGovernedMultiTypeAccounts();

  const [governedAccount, setGovernedAccount] = useState<
    GovernedMultiTypeAccount | undefined
  >();

  const [instructions, setInstructions] = useState<ComponentInstructionData[]>(
    [],
  );

  useEffect(() => {
    if (!connected) {
      router.push(fmtUrlWithCluster(`/dao/${symbol}`));
    }
  }, [router, connected]);

  const handleSetForm = ({
    propertyName,
    value,
  }: {
    propertyName: keyof typeof form;
    value: unknown;
  }) => {
    setFormErrors({});
    setForm({ ...form, [propertyName]: value });
  };

  const getFormInstructionsData = async () => {
    const formInstructionsData: FormInstructionData[] = [];

    for (const inst of instructions) {
      if (inst.getInstruction) {
        const formInstructionData: FormInstructionData = await inst?.getInstruction();

        formInstructionsData.push(formInstructionData);
      }
    }

    return formInstructionsData;
  };

  const handleTurnOffLoaders = () => {
    setIsLoadingSignedProposal(false);
    setIsLoadingDraft(false);
  };

  const handleCreate = async (isDraft: boolean) => {
    setFormErrors({});

    if (!realm) {
      notify({ type: 'error', message: 'No realm selected' });
      handleTurnOffLoaders();
      return;
    }

    if (!governedAccount) {
      notify({ type: 'error', message: 'No governance selected' });
      handleTurnOffLoaders();
      return;
    }

    if (isDraft) {
      setIsLoadingDraft(true);
    } else {
      setIsLoadingSignedProposal(true);
    }

    const { isValid, validationErrors }: formValidation = await isFormValid(
      schema,
      form,
    );

    const formInstructionsData: FormInstructionData[] = await getFormInstructionsData();

    if (
      !isValid ||
      formInstructionsData.some((x: FormInstructionData) => !x.isValid)
    ) {
      setFormErrors(validationErrors);
      handleTurnOffLoaders();
      return;
    }

    try {
      if (!governedAccount.governance) {
        throw new Error(
          'No program governance for the selected governed account',
        );
      }

      // Fetch governance to get up to date proposalCount
      const selectedGovernance = (await fetchRealmGovernance(
        governedAccount.governance.pubkey,
      )) as ProgramAccount<Governance>;

      const proposalAddress = await handleCreateProposal({
        title: form.title,
        description: form.description,
        governance: selectedGovernance,
        voteByCouncil,
        isDraft,

        instructionsData: formInstructionsData.map((formInstructionData) => {
          return {
            data: formInstructionData.serializedInstruction
              ? getInstructionDataFromBase64(
                  formInstructionData.serializedInstruction,
                )
              : null,
            holdUpTime: formInstructionData.customHoldUpTime
              ? getTimestampFromDays(formInstructionData.customHoldUpTime)
              : selectedGovernance?.account?.config.minInstructionHoldUpTime,
            prerequisiteInstructions:
              formInstructionData.prerequisiteInstructions || [],
            chunkSplitByDefault:
              formInstructionData.chunkSplitByDefault || false,
            signers: formInstructionData.signers,
            shouldSplitIntoSeparateTxs:
              formInstructionData.shouldSplitIntoSeparateTxs,
          };
        }),
      });

      router.push(
        fmtUrlWithCluster(`/dao/${symbol}/proposal/${proposalAddress}`),
      );
    } catch (ex) {
      notify({ type: 'error', message: `${ex}` });
    }
  };

  useEffect(() => {
    if (!fetchTokenAccountsForSelectedRealmGovernance) return;

    // fetch to be up to date with amounts
    fetchTokenAccountsForSelectedRealmGovernance();
  }, []);

  return (
    <div className="grid grid-cols-12 gap-4">
      <div
        className={`bg-bkg-2 col-span-12 md:col-span-7 md:order-first lg:col-span-8 order-last p-4 md:p-6 rounded-lg space-y-3 ${
          isLoading ? 'pointer-events-none' : ''
        }`}
      >
        <Link href={fmtUrlWithCluster(`/dao/${symbol}/`)}>
          <a className="flex items-center text-fgd-3 text-sm transition-all hover:text-fgd-1">
            <ArrowLeftIcon className="h-4 w-4 mr-1 text-primary-light" />
            Back
          </a>
        </Link>

        <div className="border-b border-fgd-4 pb-4 pt-2">
          <div className="flex items-center justify-between">
            <h1>
              Add a proposal
              {realmDisplayName ? ` to ${realmDisplayName}` : ``}{' '}
            </h1>
          </div>
        </div>

        <div className="pt-2 space-y-6">
          <div className="pb-4">
            <Input
              label="Title"
              placeholder="Title of your proposal"
              value={form.title}
              type="text"
              error={formErrors['title']}
              onChange={(evt) =>
                handleSetForm({
                  value: evt.target.value,
                  propertyName: 'title',
                })
              }
            />
          </div>

          <Textarea
            label="Description"
            placeholder="Description of your proposal or use a github gist link (optional)"
            value={form.description}
            onChange={(evt) =>
              handleSetForm({
                value: evt.target.value,
                propertyName: 'description',
              })
            }
          />

          {canChooseWhoVote && (
            <VoteBySwitch
              checked={voteByCouncil}
              onChange={() => {
                setVoteByCouncil(!voteByCouncil);
              }}
            />
          )}

          <GovernedAccountSelect
            label="Governance"
            governedAccounts={governedMultiTypeAccounts}
            onChange={(governedAccount) => {
              setGovernedAccount(governedAccount ?? undefined);
            }}
            value={governedAccount}
            governance={governedAccount?.governance}
          />

          {governedAccount ? (
            <InstructionsForm
              availableInstructions={availableInstructions}
              onInstructionsChange={(
                instructions: ComponentInstructionData[],
              ) => {
                setInstructions(instructions);
              }}
              governedAccount={governedAccount}
            />
          ) : null}

          <div className="border-t border-fgd-4 flex justify-end pt-6 space-x-4">
            <SecondaryButton
              disabled={isLoading}
              isLoading={isLoadingDraft}
              onClick={() => handleCreate(true)}
            >
              Save draft
            </SecondaryButton>

            <DryRunInstructionsBtn
              getFormInstructionsData={getFormInstructionsData}
            />

            <Button
              isLoading={isLoadingSignedProposal}
              disabled={isLoading}
              onClick={() => handleCreate(false)}
            >
              Add proposal
            </Button>
          </div>
        </div>
      </div>

      <div className="col-span-12 md:col-span-5 lg:col-span-4">
        <TokenBalanceCardWrapper />
      </div>
    </div>
  );
};

export default New;
