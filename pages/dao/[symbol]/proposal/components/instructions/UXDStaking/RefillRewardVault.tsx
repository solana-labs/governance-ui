import React from 'react';
import * as yup from 'yup';
import Input from '@components/inputs/Input';
import useInstructionFormBuilder from '@hooks/useInstructionFormBuilder';
import { GovernedMultiTypeAccount } from '@utils/tokens';
import { UXDStakingRefillRewardVaultForm } from '@utils/uiTypes/proposalCreationTypes';
import uxdProtocolStakingConfiguration from '@tools/sdk/uxdProtocolStaking/configuration';
import useWalletStore from 'stores/useWalletStore';
import { PublicKey } from '@solana/web3.js';
import useSingleSideStakingClient from '@hooks/useSingleSideStakingClient';

const RefillRewardVault = ({
  index,
  governedAccount,
}: {
  index: number;
  governedAccount?: GovernedMultiTypeAccount;
}) => {
  const wallet = useWalletStore((s) => s.current);
  const { client: sssClient } = useSingleSideStakingClient();

  const {
    form,
    connection,
    formErrors,
    handleSetForm,
  } = useInstructionFormBuilder<UXDStakingRefillRewardVaultForm>({
    index,
    initialFormValues: {
      governedAccount,
    },
    schema: yup.object().shape({
      governedAccount: yup
        .object()
        .nullable()
        .required('Governed account is required'),
      stakingCampaignPda: yup
        .string()
        .required('Staking Campaign Pda is required'),
      uiRewardRefillAmount: yup
        .number()
        .moreThan(0, 'Reward Refill Amount should be more than 0')
        .required('Reward Amount is required'),
    }),

    buildInstruction: async function () {
      const programId =
        uxdProtocolStakingConfiguration.programId[connection.cluster];

      if (!programId) {
        throw new Error(
          `Unsupported cluster ${connection.cluster} for UXD Protocol Staking`,
        );
      }

      if (!sssClient) {
        throw new Error('Single side staking client not loaded');
      }

      const stakingCampaignPda = new PublicKey(form.stakingCampaignPda!);

      return sssClient.createRefillRewardVaultInstruction({
        stakingCampaignPda,
        uiRewardRefillAmount: form.uiRewardRefillAmount!,
        options: uxdProtocolStakingConfiguration.TXN_OPTS,
        payer: wallet!.publicKey!,
      });
    },
  });

  return (
    <>
      <Input
        label="Staking Campaign Pda"
        value={form.stakingCampaignPda}
        type="string"
        onChange={(evt) =>
          handleSetForm({
            value: evt.target.value,
            propertyName: 'stakingCampaignPda',
          })
        }
        error={formErrors['stakingCampaignPda']}
      />

      <Input
        label="Reward Refill Amount"
        value={form.uiRewardRefillAmount}
        type="number"
        min="0"
        onChange={(evt) =>
          handleSetForm({
            value: evt.target.value,
            propertyName: 'uiRewardRefillAmount',
          })
        }
        error={formErrors['uiRewardRefillAmount']}
      />
    </>
  );
};

export default RefillRewardVault;
