import * as yup from 'yup';
import { PublicKey } from '@solana/web3.js';
import Input from '@components/inputs/Input';
import useInstructionFormBuilder from '@hooks/useInstructionFormBuilder';
import soceanConfiguration from '@tools/sdk/socean/configuration';
import { cancelVest } from '@tools/sdk/socean/instructions/cancelVest';
import { GovernedMultiTypeAccount } from '@utils/tokens';
import { SoceanCancelVestForm } from '@utils/uiTypes/proposalCreationTypes';

const schema = yup.object().shape({
  governedAccount: yup
    .object()
    .nullable()
    .required('Governed account is required'),
  bondPool: yup.string().required('Bond Pool is required'),
  bondedMint: yup.string().required('Bonded Mint is required'),
  userBondedAccount: yup.string().required('User Bonded Account is required'),
  userTargetAccount: yup.string().required('User Target Account is required'),
});

const CancelVest = ({
  index,
  governedAccount,
}: {
  index: number;
  governedAccount?: GovernedMultiTypeAccount;
}) => {
  const {
    form,
    handleSetForm,
    formErrors,
  } = useInstructionFormBuilder<SoceanCancelVestForm>({
    index,
    initialFormValues: {
      governedAccount,
    },
    schema,
    buildInstruction: async function ({
      connection,
      wallet,
      cluster,
      governedAccountPubkey,
      form,
    }) {
      const programs = soceanConfiguration.getSoceanPrograms({
        connection,
        wallet,
        cluster,
      });
      return cancelVest({
        cluster: cluster,
        program: programs.Bonding,
        refundRentTo: wallet.publicKey!,
        authority: governedAccountPubkey,
        bondPool: new PublicKey(form.bondPool!),
        bondedMint: new PublicKey(form.bondedMint!),
        userBondedAccount: new PublicKey(form.userBondedAccount!),
        userTargetAccount: new PublicKey(form.userTargetAccount!),
      });
    },
  });

  return (
    <>
      <Input
        label="Bond Pool"
        value={form.bondPool}
        type="string"
        onChange={(evt) =>
          handleSetForm({
            value: evt.target.value,
            propertyName: 'bondPool',
          })
        }
        error={formErrors['bondPool']}
      />

      <Input
        label="Bonded Mint"
        value={form.bondedMint}
        type="string"
        onChange={(evt) =>
          handleSetForm({
            value: evt.target.value,
            propertyName: 'bondedMint',
          })
        }
        error={formErrors['bondedMint']}
      />

      <Input
        label="User Bonded Account"
        value={form.userBondedAccount}
        type="string"
        onChange={(evt) =>
          handleSetForm({
            value: evt.target.value,
            propertyName: 'userBondedAccount',
          })
        }
        error={formErrors['userBondedAccount']}
      />

      <Input
        label="User Target Account"
        value={form.userTargetAccount}
        type="string"
        onChange={(evt) =>
          handleSetForm({
            value: evt.target.value,
            propertyName: 'userTargetAccount',
          })
        }
        error={formErrors['userTargetAccount']}
      />
    </>
  );
};

export default CancelVest;
