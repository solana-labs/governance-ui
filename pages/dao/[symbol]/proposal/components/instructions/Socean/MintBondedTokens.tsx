import * as yup from 'yup';
import { PublicKey } from '@solana/web3.js';
import Input from '@components/inputs/Input';
import useInstructionFormBuilder from '@hooks/useInstructionFormBuilder';
import soceanConfig from '@tools/sdk/socean/configuration';
import { mintBondedTokens } from '@tools/sdk/socean/instructions/mintBondedTokens';
import { GovernedMultiTypeAccount, tryGetTokenMint } from '@utils/tokens';
import { SoceanMintBondedTokensForm } from '@utils/uiTypes/proposalCreationTypes';
import { uiAmountToNativeBN } from '@tools/sdk/units';

const schema = yup.object().shape({
  governedAccount: yup
    .object()
    .nullable()
    .required('Governed account is required'),
  bondPool: yup.string().required('Bond Pool is required'),
  bondedMint: yup.string().required('Bonded Mint is required'),
  depositFrom: yup.string().required('Deposit From is required'),
  mintTo: yup.string().required('Mint To is required'),
  uiAmount: yup
    .number()
    .moreThan(0, 'Amount should be more than 0')
    .required('Amount is required'),
});

const MintBondedTokens = ({
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
  } = useInstructionFormBuilder<SoceanMintBondedTokensForm>({
    index,
    initialFormValues: {
      governedAccount,
    },
    schema,
    buildInstruction: async function ({
      connection,
      wallet,
      cluster,
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
        new PublicKey(form.depositFrom!),
      );
      if (!mintInfo) throw new Error('Cannot load depositFrom mint info');
      return mintBondedTokens({
        cluster,
        program: programs.Bonding,
        amount: uiAmountToNativeBN(
          form.uiAmount!.toString(),
          mintInfo.account.decimals,
        ),
        depositFrom: new PublicKey(form.depositFrom!),
        authority: governedAccountPubkey,
        bondPool: new PublicKey(form.bondPool!),
        bondedMint: new PublicKey(form.bondedMint!),
        mintTo: new PublicKey(form.mintTo!),
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
        label="Deposit From (Sale mint TA/ATA)"
        value={form.depositFrom}
        type="string"
        onChange={(evt) =>
          handleSetForm({
            value: evt.target.value,
            propertyName: 'depositFrom',
          })
        }
        error={formErrors['depositFrom']}
      />

      <Input
        label="Mint to  (Bonded mint TA/ATA)"
        value={form.mintTo}
        type="string"
        onChange={(evt) =>
          handleSetForm({
            value: evt.target.value,
            propertyName: 'mintTo',
          })
        }
        error={formErrors['mintTo']}
      />

      <Input
        label="Amount to mint"
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

export default MintBondedTokens;
