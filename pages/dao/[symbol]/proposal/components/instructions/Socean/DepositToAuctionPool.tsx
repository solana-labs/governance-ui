import * as yup from 'yup';
import { PublicKey } from '@solana/web3.js';
import Input from '@components/inputs/Input';
import useInstructionFormBuilder from '@hooks/useInstructionFormBuilder';
import soceanConfig from '@tools/sdk/socean/configuration';
import { depositToAuctionPool } from '@tools/sdk/socean/instructions/depositToAuctionPool';
import { GovernedMultiTypeAccount, tryGetTokenMint } from '@utils/tokens';
import { SoceanDepositToAuctionPoolForm } from '@utils/uiTypes/proposalCreationTypes';
import { uiAmountToNativeBN } from '@tools/sdk/units';

const schema = yup.object().shape({
  governedAccount: yup
    .object()
    .nullable()
    .required('Governed account is required'),
  auction: yup.string().required('Auction is required'),
  sourceAccount: yup.string().required('Source account is required'),
  bondedMint: yup.string().required('Bonded mint is required'),
  uiDepositAmount: yup
    .number()
    .moreThan(0, 'Deposit amount should be more than 0')
    .required('Deposit amount is required'),
});

const DepositToAuctionPool = ({
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
  } = useInstructionFormBuilder<SoceanDepositToAuctionPoolForm>({
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
        wallet,
        cluster,
      });
      const mintInfo = await tryGetTokenMint(
        connection,
        new PublicKey(form.sourceAccount!),
      );
      if (!mintInfo) throw new Error('Cannot load sourceAccount mint info');

      return depositToAuctionPool({
        cluster,
        program: programs.DescendingAuction,
        depositAmount: uiAmountToNativeBN(
          form.uiDepositAmount!.toString(),
          mintInfo.account.decimals,
        ),
        auction: new PublicKey(form.auction!),
        authority: governedAccountPubkey,
        sourceAccount: new PublicKey(form.sourceAccount!),
        bondedMint: new PublicKey(form.bondedMint!),
      });
    },
  });

  return (
    <>
      <Input
        label="Auction"
        value={form.auction}
        type="string"
        onChange={(evt) =>
          handleSetForm({
            value: evt.target.value,
            propertyName: 'auction',
          })
        }
        error={formErrors['auction']}
      />

      <Input
        label="Source account (bonded mint TA/ATA)"
        value={form.sourceAccount}
        type="string"
        onChange={(evt) =>
          handleSetForm({
            value: evt.target.value,
            propertyName: 'sourceAccount',
          })
        }
        error={formErrors['sourceAccount']}
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
        label="Deposit Amount"
        value={form.uiDepositAmount}
        type="number"
        min="0"
        onChange={(evt) =>
          handleSetForm({
            value: evt.target.value,
            propertyName: 'uiDepositAmount',
          })
        }
        error={formErrors['uiDepositAmount']}
      />
    </>
  );
};

export default DepositToAuctionPool;
