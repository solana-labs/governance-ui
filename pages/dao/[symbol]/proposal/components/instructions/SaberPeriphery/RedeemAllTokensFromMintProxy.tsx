import * as yup from 'yup';
import {
  SolanaAugmentedProvider,
  SolanaProvider,
  SignerWallet,
} from '@saberhq/solana-contrib';
import Select from '@components/inputs/Select';
import useInstructionFormBuilder from '@hooks/useInstructionFormBuilder';
import quarryMineConfiguration from '@tools/sdk/quarryMine/configuration';
import { redeemAllTokensFromMintProxyInstruction } from '@tools/sdk/saberPeriphery/redeemAllTokensFromMintProxy';
import { GovernedMultiTypeAccount } from '@utils/tokens';
import { SaberPeripheryRedeemAllTokensFromMintProxyForm } from '@utils/uiTypes/proposalCreationTypes';
import useWalletStore from 'stores/useWalletStore';
import SelectOptionList from '../../SelectOptionList';

const schema = yup.object().shape({
  governedAccount: yup
    .object()
    .nullable()
    .required('Governed account is required'),
  mintName: yup.string().required('Mint name is required'),
});

const RedeemAllTokensFromMintProxy = ({
  index,
  governedAccount,
}: {
  index: number;
  governedAccount?: GovernedMultiTypeAccount;
}) => {
  const connection = useWalletStore((s) => s.connection);
  const {
    form,
    handleSetForm,
    formErrors,
  } = useInstructionFormBuilder<SaberPeripheryRedeemAllTokensFromMintProxyForm>(
    {
      index,
      initialFormValues: {
        governedAccount,
      },
      schema,
      buildInstruction: async function ({
        form,
        wallet,
        connection,
        governedAccountPubkey,
      }) {
        return redeemAllTokensFromMintProxyInstruction({
          augmentedProvider: new SolanaAugmentedProvider(
            SolanaProvider.init({
              connection: connection,
              wallet: (wallet as unknown) as SignerWallet,
            }),
          ),
          authority: governedAccountPubkey,
          mintName: form.mintName!,
        });
      },
    },
  );

  // Hardcoded gate used to be clear about what cluster is supported for now
  if (connection.cluster !== 'mainnet') {
    return <>This instruction does not support {connection.cluster}</>;
  }

  return (
    <>
      <Select
        label="Mint Name"
        value={form.mintName}
        placeholder="Please select..."
        onChange={(value) => {
          handleSetForm({
            value,
            propertyName: 'mintName',
          });
        }}
        error={formErrors['mintName']}
      >
        <SelectOptionList
          list={Object.keys(quarryMineConfiguration.supportedMintNames)}
        />
      </Select>
    </>
  );
};

export default RedeemAllTokensFromMintProxy;
