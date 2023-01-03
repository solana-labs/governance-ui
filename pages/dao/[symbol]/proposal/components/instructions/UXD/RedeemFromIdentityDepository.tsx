import * as yup from 'yup';
import useInstructionFormBuilder from '@hooks/useInstructionFormBuilder';
import { GovernedMultiTypeAccount } from '@utils/tokens';
import { UXDRedeemFromIdentityDepositoryForm } from '@utils/uiTypes/proposalCreationTypes';
import Input from '@components/inputs/Input';
import { PublicKey } from '@solana/web3.js';
import createRedeemFromIdentityDepositoryInstruction from '@tools/sdk/uxdProtocol/createRedeemFromIdentityDepositoryInstruction';
import { USDC, USDC_DECIMALS } from '@uxd-protocol/uxd-client';
import InputNumber from '@components/inputs/InputNumber';

const schema = yup.object().shape({
  governedAccount: yup
    .object()
    .nullable()
    .required('Governance account is required'),
  uxdProgram: yup.string().required('UXD Program address is required'),
  uiRedeemableAmount: yup
    .number()
    .moreThan(0, 'Redeemable amount should be more than 0')
    .required('Redeemable Amount is required'),
});

const UXDRedeemFromIdentityDepository = ({
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
  } = useInstructionFormBuilder<UXDRedeemFromIdentityDepositoryForm>({
    index,
    initialFormValues: {
      governedAccount,
    },
    schema,
    shouldSplitIntoSeparateTxs: true,
    buildInstruction: async function ({ form, governedAccountPubkey, wallet }) {
      return createRedeemFromIdentityDepositoryInstruction({
        uxdProgramId: new PublicKey(form.uxdProgram!),
        user: governedAccountPubkey,
        redeemableAmount: form.uiRedeemableAmount!,
        payer: wallet.publicKey!,
        collateralMint: USDC /*new PublicKey(
          '6L9fgyYtbz34JvwvYyL6YzJDAywz9PKGttuZuWyuoqje',
        ),*/,
        collateralMintSymbol: 'USDC',
        collateralMintDecimals: USDC_DECIMALS,
      });
    },
  });

  return (
    <>
      <Input
        label="UXD Program"
        value={form.uxdProgram}
        type="string"
        onChange={(evt) =>
          handleSetForm({
            value: evt.target.value,
            propertyName: 'uxdProgram',
          })
        }
        error={formErrors['uxdProgram']}
      />

      <InputNumber
        label="Redeemable Amount (UXD)"
        value={form.uiRedeemableAmount}
        min={0}
        max={10 ** 12}
        onChange={(value) =>
          handleSetForm({
            value,
            propertyName: 'uiRedeemableAmount',
          })
        }
        error={formErrors['uiRedeemableAmount']}
      />
    </>
  );
};

export default UXDRedeemFromIdentityDepository;
