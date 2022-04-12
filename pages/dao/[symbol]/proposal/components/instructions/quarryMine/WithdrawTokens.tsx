import * as yup from 'yup';
import { PublicKey } from '@solana/web3.js';
import Input from '@components/inputs/Input';
import Select from '@components/inputs/Select';
import useGovernanceUnderlyingTokenAccounts from '@hooks/useGovernanceUnderlyingTokenAccounts';
import useInstructionFormBuilder from '@hooks/useInstructionFormBuilder';
import { augmentedProvider } from '@tools/sdk/augmentedProvider';
import quarryMineConfiguration from '@tools/sdk/quarryMine/configuration';
import { withdrawTokensInstruction } from '@tools/sdk/quarryMine/instructions/withdrawTokens';
import { uiAmountToNativeBN } from '@tools/sdk/units';
import { GovernedMultiTypeAccount, tryGetTokenMint } from '@utils/tokens';
import { QuarryMineWithdrawTokensForm } from '@utils/uiTypes/proposalCreationTypes';

import SelectOptionList from '../../SelectOptionList';
import TokenAccountSelect from '../../TokenAccountSelect';

const schema = yup.object().shape({
  governedAccount: yup
    .object()
    .nullable()
    .required('Governed account is required'),
  mintName: yup.string().required('Mint name is required'),
  destinationAccount: yup.string().required('Destination Account is required'),
  uiAmount: yup
    .number()
    .moreThan(0, 'Amount should be more than 0')
    .required('Amount is required'),
});

const WithdrawTokens = ({
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
    connection,
    governedAccountPubkey,
  } = useInstructionFormBuilder<QuarryMineWithdrawTokensForm>({
    index,
    initialFormValues: {
      governedAccount,
    },
    schema,
    buildInstruction: async function ({
      form,
      connection,
      wallet,
      governedAccountPubkey,
    }) {
      const destinationAccount = new PublicKey(form.destinationAccount!);
      const mintInfo = await tryGetTokenMint(connection, destinationAccount);
      if (!mintInfo)
        throw new Error(
          `could not find mint info for token ${form.destinationAccount}`,
        );

      return withdrawTokensInstruction({
        augmentedProvider: augmentedProvider(connection, wallet),
        authority: governedAccountPubkey,
        destinationAccount,
        amount: uiAmountToNativeBN(
          form.uiAmount!.toString(),
          mintInfo.account.decimals,
        ),
        mintName: form.mintName!,
      });
    },
  });

  const { ownedTokenAccountsInfo } = useGovernanceUnderlyingTokenAccounts(
    governedAccountPubkey ?? undefined,
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

      {ownedTokenAccountsInfo && (
        <TokenAccountSelect
          label="Destination Account"
          value={form.destinationAccount}
          onChange={(value) =>
            handleSetForm({ value, propertyName: 'destinationAccount' })
          }
          error={formErrors['destinationAccount']}
          ownedTokenAccountsInfo={ownedTokenAccountsInfo}
        />
      )}

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

export default WithdrawTokens;
