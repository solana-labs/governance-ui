import * as yup from 'yup';
import useInstructionFormBuilder from '@hooks/useInstructionFormBuilder';
import { GovernedMultiTypeAccount, tryGetTokenMint } from '@utils/tokens';
import { NativeTransferTokensForm } from '@utils/uiTypes/proposalCreationTypes';
import { Token, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { uiAmountToNativeBN } from '@tools/sdk/units';
import { PublicKey } from '@solana/web3.js';
import Input from '@components/inputs/Input';
import useGovernanceUnderlyingTokenAccounts from '@hooks/useGovernanceUnderlyingTokenAccounts';
import TokenAccountSelect from '../../TokenAccountSelect';

function validatePubkey(value: string): PublicKey | false {
  try {
    return new PublicKey(value);
  } catch (_) {
    return false;
  }
}

const TransferTokens = ({
  index,
  governedAccount,
}: {
  index: number;
  governedAccount?: GovernedMultiTypeAccount;
}) => {
  const schema = yup.object().shape({
    governedAccount: yup
      .object()
      .nullable()
      .required('Governed account is required'),
    source: yup
      .string()
      .required('Source Account is required')
      .test('source', async function (rawSource: string) {
        const source = validatePubkey(rawSource);
        if (!source) {
          return this.createError({
            message: 'Source is not a valid public key',
          });
        }

        if (!form.destination) {
          return true;
        }

        const destination = validatePubkey(form.destination);
        if (!destination) {
          // Ignore the error as it will be reported for destination input already
          return true;
        }

        const [sourceAccount, destinationAccount] = await Promise.all([
          tryGetTokenMint(connection.current, source),
          tryGetTokenMint(connection.current, destination),
        ]);

        // Cannot get the mint data for the account, let the user continue
        if (!sourceAccount || !destinationAccount) {
          return true;
        }

        if (!sourceAccount.publicKey.equals(destinationAccount.publicKey)) {
          return this.createError({
            message: 'Source should reference the same mint as the destination',
          });
        }

        return true;
      }),
    destination: yup
      .string()
      .required('Destination Account is required')
      .test('destination', async function (rawDestination: string) {
        const destination = validatePubkey(rawDestination);
        if (!destination) {
          return this.createError({
            message: 'Destination is not a valid public key',
          });
        }

        if (!form.source) {
          return true;
        }

        const source = validatePubkey(form.source);
        if (!source) {
          // Ignore the error as it will be reported for source input already
          return true;
        }

        const [sourceAccount, destinationAccount] = await Promise.all([
          tryGetTokenMint(connection.current, source),
          tryGetTokenMint(connection.current, destination),
        ]);

        // Cannot get the mint data for the account, let the user continue
        if (!sourceAccount || !destinationAccount) {
          return true;
        }

        if (!sourceAccount.publicKey.equals(destinationAccount.publicKey)) {
          return this.createError({
            message: 'Destination should reference the same mint as the source',
          });
        }

        return true;
      }),
    uiAmount: yup
      .number()
      .moreThan(0, 'Amount should be more than 0')
      .required('Amount is required'),
  });

  const {
    connection,
    form,
    handleSetForm,
    formErrors,
    governedAccountPubkey,
  } = useInstructionFormBuilder<NativeTransferTokensForm>({
    index,
    initialFormValues: {
      governedAccount,
    },
    schema,
    buildInstruction: async function ({ governedAccountPubkey, form }) {
      const source = new PublicKey(form.source!);
      const destination = new PublicKey(form.destination!);

      const mint = await tryGetTokenMint(connection.current, source);

      if (!mint) {
        throw new Error(
          `Cannot load mint information about source account ${source.toBase58()}`,
        );
      }

      // Cannot use u64 here as it doesn't implement toBuffer, gotta do something for that
      const amount = uiAmountToNativeBN(
        form.uiAmount!,
        mint.account.decimals,
      ).toNumber();

      return Token.createTransferInstruction(
        TOKEN_PROGRAM_ID,
        source,
        destination,
        governedAccountPubkey,
        [],
        amount,
      );
    },
  });

  // Governance underlying accounts that can be selected as source
  const { ownedTokenAccountsInfo } = useGovernanceUnderlyingTokenAccounts(
    governedAccountPubkey,
  );

  // Hardcoded gate used to be clear about what cluster is supported for now
  if (connection.cluster !== 'mainnet') {
    return <>This instruction does not support {connection.cluster}</>;
  }

  // only need governance select for this instruction
  return (
    <>
      {ownedTokenAccountsInfo && (
        <TokenAccountSelect
          label="Source Account"
          value={form.source}
          onChange={(value) => handleSetForm({ value, propertyName: 'source' })}
          error={formErrors['source']}
          ownedTokenAccountsInfo={ownedTokenAccountsInfo}
        />
      )}

      <Input
        label="Destination Account"
        value={form.destination}
        type="string"
        onChange={(evt) =>
          handleSetForm({
            value: evt.target.value,
            propertyName: 'destination',
          })
        }
        error={formErrors['destination']}
      />

      <Input
        label="Amount to transfer"
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

export default TransferTokens;
