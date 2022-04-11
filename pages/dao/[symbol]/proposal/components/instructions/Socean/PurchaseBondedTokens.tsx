import * as yup from 'yup';
import { BN } from '@project-serum/anchor';
import { PublicKey } from '@solana/web3.js';
import Input from '@components/inputs/Input';
import useInstructionFormBuilder from '@hooks/useInstructionFormBuilder';
import soceanConfig from '@tools/sdk/socean/configuration';
import { purchase } from '@tools/sdk/socean/instructions/purchase';
import { GovernedMultiTypeAccount, tryGetTokenMint } from '@utils/tokens';
import { SoceanPurchaseBondedTokensForm } from '@utils/uiTypes/proposalCreationTypes';
import { uiAmountToNativeBN } from '@tools/sdk/units';

//TODO: Make a reusable SELECT component for Slippage
const schema = yup.object().shape({
  governedAccount: yup
    .object()
    .nullable()
    .required('Governed account is required'),
  auction: yup.string().required('Auction is required'),
  bondedMint: yup.string().required('Bonded mint is required'),
  paymentDestination: yup.string().required('Payment destination is required'),
  buyer: yup.string().required('Buyer is required'),
  paymentSource: yup.string().required('Payment source is required'),
  saleDestination: yup.string().required('Sale destination is required'),
  uiPurchaseAmount: yup
    .number()
    .moreThan(0, 'Purchase amount should be more than 0')
    .required('Purchase amount is required'),
  uiExpectedPayment: yup
    .number()
    .moreThan(0, 'Expected payment should be more than 0')
    .required('Expected payment is required'),
  slippageTolerance: yup
    .number()
    .moreThan(0, 'Slippage tolerance should be more than 0')
    .required('Slippage tolerance is required'),
});

const PurchaseBondedTokens = ({
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
  } = useInstructionFormBuilder<SoceanPurchaseBondedTokensForm>({
    index,
    initialFormValues: {
      governedAccount,
    },
    schema,
    buildInstruction: async function ({ form, connection, cluster, wallet }) {
      const programs = soceanConfig.getSoceanPrograms({
        connection,
        cluster,
        wallet,
      });

      const [paymentMintInfo, saleMintInfo] = await Promise.all([
        tryGetTokenMint(connection, new PublicKey(form.paymentSource!)),
        tryGetTokenMint(connection, new PublicKey(form.saleDestination!)),
      ]);
      if (!paymentMintInfo)
        throw new Error('Cannot load paymentSource mint info');
      if (!saleMintInfo)
        throw new Error('Cannot load saleDestination mint info');

      return purchase({
        cluster,
        program: programs.DescendingAuction,
        auction: new PublicKey(form.auction!),
        bondedMint: new PublicKey(form.bondedMint!),
        paymentDestination: new PublicKey(form.paymentDestination!),
        buyer: new PublicKey(form.buyer!),
        paymentSource: new PublicKey(form.paymentSource!),
        saleDestination: new PublicKey(form.saleDestination!),
        purchaseAmount: uiAmountToNativeBN(
          form.uiPurchaseAmount!.toString(),
          saleMintInfo.account.decimals,
        ),
        expectedPayment: uiAmountToNativeBN(
          form.uiExpectedPayment!.toString(),
          paymentMintInfo.account.decimals,
        ),
        slippageTolerance: new BN(form.slippageTolerance!),
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
        label="Payment Destination (payment token TA/ATA)"
        value={form.paymentDestination}
        type="string"
        onChange={(evt) =>
          handleSetForm({
            value: evt.target.value,
            propertyName: 'paymentDestination',
          })
        }
        error={formErrors['paymentDestination']}
      />

      <Input
        label="Buyer"
        value={form.buyer}
        type="string"
        onChange={(evt) =>
          handleSetForm({
            value: evt.target.value,
            propertyName: 'buyer',
          })
        }
        error={formErrors['buyer']}
      />

      <Input
        label="Payment Source (payment token TA/ATA)"
        value={form.paymentSource}
        type="string"
        onChange={(evt) =>
          handleSetForm({
            value: evt.target.value,
            propertyName: 'paymentSource',
          })
        }
        error={formErrors['paymentSource']}
      />

      <Input
        label="Sale Destination (bonded token TA/ATA)"
        value={form.saleDestination}
        type="string"
        onChange={(evt) =>
          handleSetForm({
            value: evt.target.value,
            propertyName: 'saleDestination',
          })
        }
        error={formErrors['saleDestination']}
      />

      <Input
        label="Purchase Amount"
        value={form.uiPurchaseAmount}
        type="number"
        min="0"
        onChange={(evt) =>
          handleSetForm({
            value: evt.target.value,
            propertyName: 'uiPurchaseAmount',
          })
        }
        error={formErrors['uiPurchaseAmount']}
      />

      <Input
        label="Expected Payment"
        value={form.uiExpectedPayment}
        type="number"
        min="0"
        onChange={(evt) =>
          handleSetForm({
            value: evt.target.value,
            propertyName: 'uiExpectedPayment',
          })
        }
        error={formErrors['uiExpectedPayment']}
      />

      <Input
        label="Slippage Tolerance (100 = 10%)"
        value={form.slippageTolerance}
        type="number"
        min="0"
        onChange={(evt) =>
          handleSetForm({
            value: evt.target.value,
            propertyName: 'slippageTolerance',
          })
        }
        error={formErrors['slippageTolerance']}
      />
    </>
  );
};

export default PurchaseBondedTokens;
