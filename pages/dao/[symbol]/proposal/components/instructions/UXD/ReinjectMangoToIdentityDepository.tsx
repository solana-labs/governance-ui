import * as yup from 'yup';
import useInstructionFormBuilder from '@hooks/useInstructionFormBuilder';
import { GovernedMultiTypeAccount } from '@utils/tokens';
import { UXDReinjectMangoToIdentityDepositoryForm } from '@utils/uiTypes/proposalCreationTypes';
import createReinjectMangoToIdentityDepositoryInstruction from '@tools/sdk/uxdProtocol/createReinjectMangoToIdentityDepositoryInstruction';
import useWalletStore from 'stores/useWalletStore';
import Select from '@components/inputs/Select';
import SelectOptionList from '../../SelectOptionList';
import { getDepositoryMintSymbols } from '@tools/sdk/uxdProtocol/uxdClient';
import { USDC, USDC_DECIMALS } from '@uxd-protocol/uxd-client';

const schema = yup.object().shape({
  governedAccount: yup
    .object()
    .nullable()
    .required('Governance account is required'),
  collateralName: yup.string().required('Collateral Name is required'),
});

const ReinjectMangoToIdentityDepository = ({
  index,
  governedAccount,
}: {
  index: number;
  governedAccount?: GovernedMultiTypeAccount;
}) => {
  const connection = useWalletStore((s) => s.connection);

  const {
    form,
    formErrors,
    handleSetForm,
  } = useInstructionFormBuilder<UXDReinjectMangoToIdentityDepositoryForm>({
    index,
    initialFormValues: {
      governedAccount,
    },
    schema,
    buildInstruction: async function ({ form, wallet, governedAccountPubkey }) {
      return createReinjectMangoToIdentityDepositoryInstruction({
        connection,
        uxdProgramId: form.governedAccount!.governance!.account.governedAccount,
        authority: governedAccountPubkey, // new PublicKey('aca3VWxwBeu8FTZowJ9hfSKGzntjX68EXh1N9xpE1PC'),
        payer: wallet.publicKey!,
        depositoryMintName: form.collateralName!,
        insuranceMintName: 'USDC',
        collateralMint: USDC /*new PublicKey(
          '6L9fgyYtbz34JvwvYyL6YzJDAywz9PKGttuZuWyuoqje',
        ),*/,
        collateralMintSymbol: 'USDC',
        collateralMintDecimals: USDC_DECIMALS,
      });
    },
  });

  return (
    <Select
      label="Mango Depository Collateral Name"
      value={form.collateralName}
      placeholder="Please select..."
      onChange={(value) =>
        handleSetForm({ value, propertyName: 'collateralName' })
      }
      error={formErrors['collateralName']}
    >
      <SelectOptionList list={getDepositoryMintSymbols(connection.cluster)} />
    </Select>
  );
};

export default ReinjectMangoToIdentityDepository;
