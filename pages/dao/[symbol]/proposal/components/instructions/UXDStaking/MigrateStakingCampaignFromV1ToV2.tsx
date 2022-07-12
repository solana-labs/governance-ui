import React from 'react';
import * as yup from 'yup';
import Input from '@components/inputs/Input';
import useInstructionFormBuilder from '@hooks/useInstructionFormBuilder';
import { GovernedMultiTypeAccount } from '@utils/tokens';
import { UXDStakingMigrateStakingCampaignFromV1ToV2Form } from '@utils/uiTypes/proposalCreationTypes';
import uxdProtocolStakingConfiguration from '@tools/sdk/uxdProtocolStaking/configuration';
import useWalletStore from 'stores/useWalletStore';
import { PublicKey } from '@solana/web3.js';
import useRealm from '@hooks/useRealm';
import useSingleSideStakingClient from '@hooks/useSingleSideStakingClient';

const MigrateStakingCampaignFromV1ToV2 = ({
  index,
  governedAccount,
}: {
  index: number;
  governedAccount?: GovernedMultiTypeAccount;
}) => {
  const wallet = useWalletStore((s) => s.current);
  const { realmInfo } = useRealm();
  const { client: sssClient } = useSingleSideStakingClient();

  const {
    form,
    connection,
    formErrors,
    handleSetForm,
  } = useInstructionFormBuilder<UXDStakingMigrateStakingCampaignFromV1ToV2Form>(
    {
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

        const stakingCampaignPda = new PublicKey(form.stakingCampaignPda!);

        return sssClient.createMigrateStakingCampaignFromV1ToV2Instruction({
          stakingCampaignPda,
          governanceProgram: realmInfo.programId,
          governanceRealm: realmInfo.realmId,
          options: uxdProtocolStakingConfiguration.TXN_OPTS,
          payer: wallet!.publicKey!,
        });
      },
    },
  );

  return (
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
  );
};

export default MigrateStakingCampaignFromV1ToV2;
