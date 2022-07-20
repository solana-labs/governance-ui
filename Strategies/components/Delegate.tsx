import {
  MangoAccount,
  makeSetDelegateInstruction,
} from '@blockworks-foundation/mango-client';
import AdditionalProposalOptions from '@components/AdditionalProposalOptions';
import Button from '@components/Button';
import Input from '@components/inputs/Input';
import Loading from '@components/Loading';
import Tooltip from '@components/Tooltip';
import useCreateProposal from '@hooks/useCreateProposal';
import useGovernanceAssets from '@hooks/useGovernanceAssets';
import useQueryContext from '@hooks/useQueryContext';
import useRealm from '@hooks/useRealm';
import {
  ProgramAccount,
  Governance,
  getInstructionDataFromBase64,
  serializeInstructionToBase64,
} from '@solana/spl-governance';
import { PublicKey } from '@solana/web3.js';
import { abbreviateAddress } from '@utils/formatting';
import { validateInstruction } from '@utils/instructionTools';
import { notify } from '@utils/notifications';
import { getValidatedPublickKey } from '@utils/validations';
import { InstructionDataWithHoldUpTime } from 'actions/createProposal';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { MarketStore } from 'Strategies/store/marketStore';
import * as yup from 'yup';

const DelegateForm = ({
  selectedMangoAccount,
  governance,
  market,
}: {
  selectedMangoAccount: MangoAccount;
  governance: ProgramAccount<Governance>;
  market: MarketStore;
}) => {
  const router = useRouter();
  const { symbol } = useRealm();
  const { fmtUrlWithCluster } = useQueryContext();
  const { handleCreateProposal } = useCreateProposal();
  const { canUseTransferInstruction } = useGovernanceAssets();
  const groupConfig = market.groupConfig!;
  const [voteByCouncil, setVoteByCouncil] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    delegateAddress: '',
  });
  const [formErrors, setFormErrors] = useState({});
  const proposalTitle = `Set delegate for MNGO account: ${abbreviateAddress(
    selectedMangoAccount?.publicKey,
  )}`;
  const handleSetForm = ({ propertyName, value }) => {
    setFormErrors({});
    setForm({ ...form, [propertyName]: value });
  };

  const handleProposeDelegate = async () => {
    const isValid = await validateInstruction({ schema, form, setFormErrors });
    if (!isValid) {
      return;
    }
    setIsLoading(true);
    const delegateMangoAccount = makeSetDelegateInstruction(
      groupConfig.mangoProgramId,
      groupConfig.publicKey,
      selectedMangoAccount!.publicKey,
      governance!.pubkey,
      new PublicKey(form.delegateAddress),
    );
    try {
      const instructionData: InstructionDataWithHoldUpTime = {
        data: getInstructionDataFromBase64(
          serializeInstructionToBase64(delegateMangoAccount),
        ),
        holdUpTime: governance!.account!.config.minInstructionHoldUpTime,
        prerequisiteInstructions: [],
      };
      const proposalAddress = await handleCreateProposal({
        title: form.title || proposalTitle,
        description: form.description,
        instructionsData: [instructionData],
        governance: governance!,
        voteByCouncil,
      });
      const url = fmtUrlWithCluster(
        `/dao/${symbol}/proposal/${proposalAddress}`,
      );
      router.push(url);
    } catch (e) {
      console.error(e);
      notify({ type: 'error', message: "Can't create proposal" });
    }
  };
  const schema = yup.object().shape({
    delegateAddress: yup
      .string()
      .test(
        'accountTests',
        'Delegate address validation error',
        function (val: string) {
          if (val) {
            try {
              return !!getValidatedPublickKey(val);
            } catch (e) {
              console.error(e);
              return this.createError({
                message: `${e}`,
              });
            }
          } else {
            return this.createError({
              message: `Delegate address is required`,
            });
          }
        },
      ),
  });
  return (
    <div>
      <Input
        label={'Delegate address'}
        value={form.delegateAddress}
        type="text"
        error={formErrors['delegateAddress']}
        onChange={(e) =>
          handleSetForm({
            value: e.target.value,
            propertyName: 'delegateAddress',
          })
        }
      />
      <AdditionalProposalOptions
        title={form.title}
        description={form.description}
        defaultTitle={proposalTitle}
        setTitle={(evt) =>
          handleSetForm({
            value: evt.target.value,
            propertyName: 'title',
          })
        }
        setDescription={(evt) =>
          handleSetForm({
            value: evt.target.value,
            propertyName: 'description',
          })
        }
        voteByCouncil={voteByCouncil}
        setVoteByCouncil={setVoteByCouncil}
      />
      <Button
        className="w-full mt-6"
        onClick={handleProposeDelegate}
        disabled={
          !form.delegateAddress || !canUseTransferInstruction || isLoading
        }
      >
        <Tooltip
          content={
            !canUseTransferInstruction
              ? 'Please connect wallet with enough voting power to create treasury proposals'
              : !form.delegateAddress
              ? 'Please input address'
              : ''
          }
        >
          {!isLoading ? 'Propose delegate' : <Loading></Loading>}
        </Tooltip>
      </Button>
    </div>
  );
};

export default DelegateForm;
