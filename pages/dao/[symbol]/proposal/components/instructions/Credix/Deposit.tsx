import * as yup from 'yup';
import useInstructionFormBuilder from '@hooks/useInstructionFormBuilder';
import credixConfiguration from '@tools/sdk/credix/configuration';
import { GovernedMultiTypeAccount, tryGetMint } from '@utils/tokens';
import { CredixDepositForm } from '@utils/uiTypes/proposalCreationTypes';
import Input from '@components/inputs/Input';
import { uiAmountToNativeBN } from '@tools/sdk/units';

const schema = yup.object().shape({
  governedAccount: yup
    .object()
    .nullable()
    .required('Governed account is required'),
  uiAmount: yup
    .number()
    .typeError('Amount has to be a number')
    .required('Amount is required'),
});

const CredixDeposit = ({
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
  } = useInstructionFormBuilder<CredixDepositForm>({
    index,
    initialFormValues: {
      governedAccount,
    },
    schema,
    buildInstruction: async function ({
      cluster,
      governedAccountPubkey,
      form,
      connection,
      wallet,
    }) {
      if (cluster !== 'mainnet') {
        throw new Error('Other cluster than mainnet are not supported yet.');
      }

      const client = credixConfiguration.getClient({
        connection,
        wallet: (wallet as unknown) as any,
      });

      // the market for which we want to deposit in the liquidity pool
      const market = await client.fetchMarket('credix-marketplace');

      if (!market) {
        throw new Error(
          'Cannot load market information about credix-marketplace',
        );
      }

      const marketMintInfo = await tryGetMint(connection, market.baseMintPK);

      if (!marketMintInfo) {
        throw new Error(
          'Cannot load information about credix market base mint',
        );
      }

      const amount = uiAmountToNativeBN(
        form.uiAmount!,
        marketMintInfo.account.decimals,
      );

      return market.depositIx(amount.toNumber(), governedAccountPubkey);
    },
  });

  return (
    <Input
      min={0}
      label="USDC Amount"
      value={form.uiAmount}
      type="number"
      onChange={(evt) => {
        handleSetForm({
          value: evt.target.value,
          propertyName: 'uiAmount',
        });
      }}
      error={formErrors['uiAmount']}
    />
  );
};

export default CredixDeposit;
