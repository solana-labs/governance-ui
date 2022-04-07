import BigNumber from 'bignumber.js';
import * as yup from 'yup';
import { BN } from '@project-serum/anchor';
import { PublicKey } from '@solana/web3.js';
import Input from '@components/inputs/Input';
import useInstructionFormBuilder from '@hooks/useInstructionFormBuilder';
import soceanConfig from '@tools/sdk/socean/configuration';
import { vest } from '@tools/sdk/socean/instructions/vest';
import { GovernedMultiTypeAccount, tryGetTokenMint } from '@utils/tokens';
import { SoceanVestForm } from '@utils/uiTypes/proposalCreationTypes';

const schema = yup.object().shape({
  governedAccount: yup
    .object()
    .nullable()
    .required('Governed account is required'),
  bondPool: yup.string().required('Bond Pool is required'),
  bondedMint: yup.string().required('Bonded Mint is required'),
  userBondedAccount: yup.string().required('User Bonded Account is required'),
  uiAmount: yup.number().required('Amount is required'),
});

const Vest = ({
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
  } = useInstructionFormBuilder<SoceanVestForm>({
    index,
    initialFormValues: {
      governedAccount,
    },
    schema,
    buildInstruction: async function ({
      connection,
      cluster,
      wallet,
      form,
      governedAccountPubkey,
    }) {
      const programs = soceanConfig.getSoceanPrograms({
        connection,
        cluster,
        wallet,
      });

      const mintInfo = await tryGetTokenMint(
        connection,
        new PublicKey(form.userBondedAccount!),
      );
      if (!mintInfo) throw new Error('Cannot load userBondedAccount mint info');

      return vest({
        cluster,
        payer: wallet.publicKey!,
        program: programs.Bonding,
        authority: governedAccountPubkey,
        bondPool: new PublicKey(form.bondPool!),
        bondedMint: new PublicKey(form.bondedMint!),
        userBondedAccount: new PublicKey(form.userBondedAccount!),
        amount: new BN(
          new BigNumber(form.uiAmount!.toString())
            .shiftedBy(mintInfo.account.decimals)
            .toString(),
        ),
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
        label="Amount"
        value={form.uiAmount}
        type="number"
        min="0"
        onChange={(evt) =>
          handleSetForm({
            value: evt.target.value,
            propertyName: 'uiAmount',
          })
        }
        error={formErrors['uiAmount']}
      />
    </>
  );
};

export default Vest;
