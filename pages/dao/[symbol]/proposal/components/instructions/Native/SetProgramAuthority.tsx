import React from 'react';
import * as yup from 'yup';
import { PublicKey } from '@solana/web3.js';

import { SetProgramAuthorityForm } from '@utils/uiTypes/proposalCreationTypes';
import Input from '@components/inputs/Input';
import { GovernedMultiTypeAccount } from '@utils/tokens';
import createSetProgramAuthorityInstruction from '@tools/sdk/bpfUpgradeableLoader/createSetProgramAuthorityInstruction';
import useInstructionFormBuilder from '@hooks/useInstructionFormBuilder';

const SetProgramAuthority = ({
  index,
  governedAccount,
}: {
  index: number;
  governedAccount?: GovernedMultiTypeAccount;
}) => {
  const {
    form,
    formErrors,
    handleSetForm,
  } = useInstructionFormBuilder<SetProgramAuthorityForm>({
    index,
    initialFormValues: {
      governedAccount,
    },
    schema: yup.object().shape({
      governedAccount: yup
        .object()
        .nullable()
        .required('Program governed account is required'),
      destinationAuthority: yup
        .string()
        .required('new authority address is required'),
    }),

    buildInstruction: async function () {
      if (!governedAccount?.governance?.account) {
        throw new Error('Governance must be a Program Account Governance');
      }
      if (!form.destinationAuthority) {
        throw new Error('missing form input: destination authority');
      }
      return createSetProgramAuthorityInstruction(
        form.governedAccount!.governance!.account.governedAccount,
        form.governedAccount!.governance!.pubkey,
        new PublicKey(form.destinationAuthority),
      );
    },
  });

  return (
    <Input
      label="New Authority"
      value={form.destinationAuthority}
      type="text"
      onChange={(evt) =>
        handleSetForm({
          value: evt.target.value,
          propertyName: 'destinationAuthority',
        })
      }
      error={formErrors['destinationAuthority']}
    />
  );
};

export default SetProgramAuthority;
