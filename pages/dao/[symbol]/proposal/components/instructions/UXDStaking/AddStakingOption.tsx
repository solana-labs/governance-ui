import React from 'react';
import * as yup from 'yup';
import { XCircleIcon } from '@heroicons/react/outline';
import Input from '@components/inputs/Input';
import useInstructionFormBuilder from '@hooks/useInstructionFormBuilder';
import { GovernedMultiTypeAccount } from '@utils/tokens';
import { UXDStakingAddStakingOptionForm } from '@utils/uiTypes/proposalCreationTypes';
import uxdProtocolStakingConfiguration from '@tools/sdk/uxdProtocolStaking/configuration';
import useWalletStore from 'stores/useWalletStore';
import { PublicKey } from '@solana/web3.js';
import { BN } from '@project-serum/anchor';
import useSingleSideStakingClient from '@hooks/useSingleSideStakingClient';

const AddStakingOption = ({
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
  } = useInstructionFormBuilder<UXDStakingAddStakingOptionForm>({
    index,
    initialFormValues: {
      governedAccount,
      stakingOptions: [
        // One element at start
        {},
      ],
    },
    schema: yup.object().shape({
      governedAccount: yup
        .object()
        .nullable()
        .required('Governed account is required'),
      stakingCampaignPda: yup
        .string()
        .required('Staking Campaign Pda is required'),
      stakingOptions: yup.array(
        yup.object().shape({
          lockupSecs: yup
            .number()
            .moreThan(0, 'Lockup Secs should be more than 0')
            .required('Lockup Secs is required'),
          apr: yup
            .number()
            .moreThan(0, 'Apr should be more than 0')
            .lessThan(
              uxdProtocolStakingConfiguration.APR_BASIS + 1,
              `Apr should be less or equal than ${uxdProtocolStakingConfiguration.APR_BASIS}`,
            )
            .required('Apr is required'),
        }),
      ),
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

      return sssClient.createAddStakingOptionInstruction({
        stakingCampaignPda,
        stakingOptionParams: form.stakingOptions.map(({ lockupSecs, apr }) => ({
          lockupSecs: new BN(lockupSecs!),
          apr: new BN(apr!),
        })),
        options: uxdProtocolStakingConfiguration.TXN_OPTS,
        payer: wallet!.publicKey!,
      });
    },
  });

  const handleSetStakingOption = ({
    index,
    ...props
  }: {
    lockupSecs?: number;
    apr?: number;
    index: number;
  }) => {
    form.stakingOptions[index] = {
      ...form.stakingOptions[index],
      ...props,
    };

    handleSetForm({
      value: form.stakingOptions,
      propertyName: 'stakingOptions',
    });
  };

  const addStakingOption = () => {
    form.stakingOptions.push({});

    handleSetForm({
      value: form.stakingOptions,
      propertyName: 'stakingOptions',
    });
  };

  const deleteStakingOption = (index: number) => {
    form.stakingOptions.splice(index, 1);

    handleSetForm({
      value: form.stakingOptions,
      propertyName: 'stakingOptions',
    });
  };

  return (
    <div className="flex flex-col space-y-4">
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

      {form.stakingOptions.map(({ lockupSecs, apr }, index) => {
        return (
          <div key={index} className="space-y-3">
            <div className="text-sm flex items-center">
              Staking Option #{index + 1}
              <XCircleIcon
                width="1rem"
                height="1rem"
                className="ml-3 text-red cursor-pointer hover:text-white"
                onClick={() => deleteStakingOption(index)}
              />
            </div>

            <div className="p-2 space-y-3 bg-bkg-3">
              <Input
                label="Lockup in Seconds"
                value={lockupSecs}
                type="number"
                min={0}
                onChange={(evt) =>
                  handleSetStakingOption({
                    lockupSecs: evt.target.value,
                    index,
                  })
                }
                error={formErrors['stakingOptions']}
              />

              <Input
                label="Apr in APR_BASIS (100% = 10000, 50% = 5000)"
                value={apr}
                type="number"
                min={0}
                max={uxdProtocolStakingConfiguration.APR_BASIS}
                onChange={(evt) =>
                  handleSetStakingOption({
                    apr: evt.target.value,
                    index,
                  })
                }
                error={formErrors['stakingOptions']}
              />
            </div>
          </div>
        );
      })}

      <button
        className="border-white text-white hover:border-fgd-3 hover:text-fgd-3 border text-sm font-bold rounded-full px-4 py-1 w-44"
        onClick={() => addStakingOption()}
      >
        Add Staking Option
      </button>
    </div>
  );
};

export default AddStakingOption;
