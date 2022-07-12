import React from 'react';
import * as yup from 'yup';
import Input from '@components/inputs/Input';
import useInstructionFormBuilder from '@hooks/useInstructionFormBuilder';
import { GovernedMultiTypeAccount } from '@utils/tokens';
import { UXDStakingInitializeStakingCampaignForm } from '@utils/uiTypes/proposalCreationTypes';
import uxdProtocolStakingConfiguration from '@tools/sdk/uxdProtocolStaking/configuration';
import { getSplTokenInformationByUIName } from '@utils/splTokens';
import SelectSplToken from '../../SelectSplToken';
import useWalletStore from 'stores/useWalletStore';
import useRealm from '@hooks/useRealm';
import useSingleSideStakingClient from '@hooks/useSingleSideStakingClient';

const InitializeStakingCampaign = ({
  index,
  governedAccount,
}: {
  index: number;
  governedAccount?: GovernedMultiTypeAccount;
}) => {
  const wallet = useWalletStore((s) => s.current);
  const { realmInfo } = useRealm();
  const { client: sssClient } = useSingleSideStakingClient();

  const nowInSec = Math.floor(Date.now() / 1000);

  const {
    form,
    connection,
    formErrors,
    handleSetForm,
  } = useInstructionFormBuilder<UXDStakingInitializeStakingCampaignForm>({
    index,
    initialFormValues: {
      governedAccount,
    },
    schema: yup.object().shape({
      governedAccount: yup
        .object()
        .nullable()
        .required('Governed account is required'),
      rewardMintUIName: yup.string().required('Reward Mint Name is required'),
      stakedMintUIName: yup.string().required('Staked Mint Name is required'),
      startTs: yup
        .number()
        .moreThan(nowInSec, `Start Timestamp should be more than ${nowInSec}`)
        .required('Start Timestamp is required'),
      endTs: yup
        .number()
        .moreThan(nowInSec, `End Timestamp should be more than ${nowInSec}`)
        .moreThan(yup.ref('startTs'), 'EndTs should be > StartTs'),
      uiRewardAmountToDeposit: yup
        .number()
        .moreThan(0, 'Reward Amount To Deposit should be more than 0')
        .required('Reward Amount to Deposit is required'),
    }),

    buildInstruction: async function () {
      const programId =
        uxdProtocolStakingConfiguration.programId[connection.cluster];

      if (!programId) {
        throw new Error(
          `Unsupported cluster ${connection.cluster} for UXD Protocol Staking`,
        );
      }

      if (!realmInfo) {
        throw new Error('Realm info not loaded');
      }

      if (!sssClient) {
        throw new Error('Single side staking client not loaded');
      }

      const rewardSplToken = getSplTokenInformationByUIName(
        form.rewardMintUIName!,
      );
      const stakedSplToken = getSplTokenInformationByUIName(
        form.stakedMintUIName!,
      );

      const authority = governedAccount!.governance!.pubkey;

      return sssClient.createInitializeStakingCampaignInstruction({
        authority,
        rewardMintDecimals: rewardSplToken.decimals,
        rewardMint: rewardSplToken.mint,
        stakedMint: stakedSplToken.mint,
        governanceProgram: realmInfo.programId,
        governanceRealm: realmInfo.realmId,
        startTs: form.startTs!,
        endTs: form.endTs,
        uiRewardDepositAmount: form.uiRewardAmountToDeposit!,
        options: uxdProtocolStakingConfiguration.TXN_OPTS,
        payer: wallet!.publicKey!,
      });
    },
  });

  return (
    <>
      <SelectSplToken
        label="Reward Token Name"
        selectedValue={form.rewardMintUIName}
        onChange={(value) =>
          handleSetForm({ value, propertyName: 'rewardMintUIName' })
        }
        error={formErrors['rewardMintUIName']}
      />

      <SelectSplToken
        label="Staked Token Name"
        selectedValue={form.stakedMintUIName}
        onChange={(value) =>
          handleSetForm({ value, propertyName: 'stakedMintUIName' })
        }
        error={formErrors['stakedMintUIName']}
      />

      <Input
        label="Start Timestamp (in seconds, 10 digits)"
        value={form.startTs}
        type="number"
        min={Date.now()}
        onChange={(evt) =>
          handleSetForm({
            value: evt.target.value,
            propertyName: 'startTs',
          })
        }
        error={formErrors['startTs']}
      />

      {form.startTs ? (
        <span>{new Date(form.startTs * 1000).toUTCString()}</span>
      ) : null}

      <Input
        label="End Timestamp (in seconds, 10 digits) - Optional"
        value={form.endTs}
        type="number"
        min={Date.now()}
        onChange={(evt) =>
          handleSetForm({
            value: evt.target.value,
            propertyName: 'endTs',
          })
        }
        error={formErrors['endTs']}
      />

      {form.endTs ? (
        <span>{new Date(form.endTs * 1000).toUTCString()}</span>
      ) : null}

      <Input
        label="Reward Amount to Deposit"
        value={form.uiRewardAmountToDeposit}
        type="number"
        min="0"
        onChange={(evt) =>
          handleSetForm({
            value: evt.target.value,
            propertyName: 'uiRewardAmountToDeposit',
          })
        }
        error={formErrors['uiRewardAmountToDeposit']}
      />
    </>
  );
};

export default InitializeStakingCampaign;
