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
import Switch from '@components/Switch';
import { useEffect, useState } from 'react';
import GovernedAccountSelect from '../../GovernedAccountSelect';
import useGovernedMultiTypeAccounts from '@hooks/useGovernedMultiTypeAccounts';

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
  const [
    destinationAccountIsAGovernanceUnderlyingAccount,
    setDestinationAccountIsAGovernanceUnderlyingAccount,
  ] = useState<boolean>(true);

  // Use the following variable only if the destination account is an governance owned account
  const {
    governedMultiTypeAccounts,
    getGovernedAccountPublicKey,
  } = useGovernedMultiTypeAccounts();

  const [destinationGovernedAccount, setDestinationGovernedAccount] = useState<
    GovernedMultiTypeAccount | undefined
  >();

  // Governance underlying accounts that can be selected as destination
  const {
    ownedTokenAccountsInfo: destinationGovernedAccountOwnedTokenAccountsInfo,
  } = useGovernanceUnderlyingTokenAccounts(
    getGovernedAccountPublicKey(destinationGovernedAccount, true),
  );
  // ----

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

      // Tricks, in spl-token code, amount is used as > amount: new u64(amount).toBuffer()
      // We provide a string
      const amount = uiAmountToNativeBN(
        form.uiAmount!,
        mint.account.decimals,
      ).toString();

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

  const [sourceMint, setSourceMint] = useState<PublicKey | null>(null);

  useEffect(() => {
    (async () => {
      if (!form.source) {
        setSourceMint(null);
      }

      try {
        const source = new PublicKey(form.source!);

        const sourceMint = await tryGetTokenMint(connection.current, source);

        if (!sourceMint) {
          throw new Error('Cannot load mint info');
        }

        setSourceMint(sourceMint.publicKey);
      } catch {
        // Ignore the error
        setSourceMint(null);
      }
    })();
  }, [form.source]);

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

      <div>
        <span>Destination Account Selection</span>

        <div className="p-4 border border-fgd-4 mt-3">
          <div className="flex mb-2">
            <span className="text-sm">Governance owned account</span>

            <Switch
              className="ml-2"
              checked={destinationAccountIsAGovernanceUnderlyingAccount}
              onChange={(b) => {
                if (b) {
                  // From Custom to Governance -> Reset the destination to not make the select to bug
                  handleSetForm({ value: '', propertyName: 'destination' });
                }

                setDestinationAccountIsAGovernanceUnderlyingAccount(b);
              }}
            />
          </div>

          {destinationAccountIsAGovernanceUnderlyingAccount ? (
            <div className="space-y-3">
              <div>
                <span className="text-sm">Related governance</span>

                <GovernedAccountSelect
                  governedAccounts={governedMultiTypeAccounts}
                  onChange={(governedAccount) => {
                    // Reset the destination
                    handleSetForm({ value: '', propertyName: 'destination' });

                    setDestinationGovernedAccount(governedAccount ?? undefined);
                  }}
                  value={destinationGovernedAccount}
                  governance={destinationGovernedAccount?.governance}
                />
              </div>

              {destinationGovernedAccount &&
              destinationGovernedAccountOwnedTokenAccountsInfo ? (
                <TokenAccountSelect
                  label="Destination Account"
                  value={form.destination}
                  onChange={(value) =>
                    handleSetForm({ value, propertyName: 'destination' })
                  }
                  error={formErrors['destination']}
                  ownedTokenAccountsInfo={
                    destinationGovernedAccountOwnedTokenAccountsInfo
                  }
                  filterByMint={sourceMint ? [sourceMint] : undefined}
                />
              ) : (
                <></>
              )}
            </div>
          ) : (
            <Input
              label="Custom Destination Account"
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
          )}
        </div>
      </div>

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
