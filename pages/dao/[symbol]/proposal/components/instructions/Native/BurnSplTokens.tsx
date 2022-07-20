import * as yup from 'yup';
import useInstructionFormBuilder from '@hooks/useInstructionFormBuilder';
import {
  GovernedMultiTypeAccount,
  TOKEN_PROGRAM_ID,
  tryGetTokenMint,
} from '@utils/tokens';
import { SPLToken } from '@saberhq/token-utils';
import useGovernanceUnderlyingTokenAccounts from '@hooks/useGovernanceUnderlyingTokenAccounts';
import TokenAccountSelect from '../../TokenAccountSelect';
import { uiAmountToNativeBN } from '@tools/sdk/units';
import { PublicKey } from '@solana/web3.js';
import { NativeBurnSplTokensForm } from '@utils/uiTypes/proposalCreationTypes';
import Input from '@components/inputs/Input';

const BurnSplTokens = ({
  index,
  governedAccount,
}: {
  index: number;
  governedAccount?: GovernedMultiTypeAccount;
}) => {
  const {
    connection,
    form,
    handleSetForm,
    formErrors,
    governedAccountPubkey,
  } = useInstructionFormBuilder<NativeBurnSplTokensForm>({
    index,
    initialFormValues: {
      governedAccount,
    },
    schema: yup.object().shape({
      governedAccount: yup
        .object()
        .nullable()
        .required('Governed account is required'),
      source: yup.string().required('Source Account is required'),
      uiAmount: yup
        .number()
        .moreThan(0, 'Amount should be more than 0')
        .required('Amount is required'),
    }),

    buildInstruction: async function ({ governedAccountPubkey, form }) {
      const source = new PublicKey(form.source!);

      const mintInfo = await tryGetTokenMint(connection.current, source);

      if (!mintInfo) {
        throw new Error('Cannot get Mint info');
      }

      const nativeAmount = uiAmountToNativeBN(
        form.uiAmount!,
        mintInfo.account.decimals,
      );

      // Tricks, we implement the function toBuffer as it is required by the SPLToken library
      nativeAmount.toBuffer = () => nativeAmount.toArrayLike(Buffer, 'le', 8);

      return SPLToken.createBurnInstruction(
        TOKEN_PROGRAM_ID,
        mintInfo.publicKey,

        // SourceKey
        source,

        // Owner
        governedAccountPubkey,

        // Multi Signers
        [],

        nativeAmount,
      );
    },
  });

  // Governance underlying accounts that can be selected as source
  const { ownedTokenAccountsInfo } = useGovernanceUnderlyingTokenAccounts(
    governedAccountPubkey,
  );

  if (!ownedTokenAccountsInfo) {
    return null;
  }

  return (
    <>
      <TokenAccountSelect
        label="Source Account"
        value={form.source}
        onChange={(value) => handleSetForm({ value, propertyName: 'source' })}
        error={formErrors['source']}
        ownedTokenAccountsInfo={ownedTokenAccountsInfo}
      />

      <Input
        label="Amount to burn"
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

export default BurnSplTokens;
