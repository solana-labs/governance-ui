import * as yup from 'yup';
import { PublicKey } from '@solana/web3.js';
import Input from '@components/inputs/Input';
import Select from '@components/inputs/Select';
import SelectOptionDetailed, { Flag } from '@components/SelectOptionDetailed';
import useFriktionVolt from '@hooks/usefriktionVolts';
import useGovernanceUnderlyingTokenAccounts from '@hooks/useGovernanceUnderlyingTokenAccounts';
import useInstructionFormBuilder from '@hooks/useInstructionFormBuilder';
import { VoltData } from '@tools/sdk/friktion/friktion';
import depositToVolt from '@tools/sdk/friktion/instructions/depositToVault';
import { GovernedMultiTypeAccount } from '@utils/tokens';
import { FriktionDepositForm } from '@utils/uiTypes/proposalCreationTypes';
import TokenAccountSelect from '../../TokenAccountSelect';

const schema = yup.object().shape({
  governedAccount: yup.object().required('Governance is required'),
  sourceAccount: yup.string().required('Source account is required'),
  volt: yup.string().required('Volt is required'),
  uiAmount: yup
    .number()
    .typeError('Amount has to be a number')
    .required('Amount is required'),
});

const FriktionDeposit = ({
  index,
  governedAccount,
}: {
  index: number;
  governedAccount?: GovernedMultiTypeAccount;
}) => {
  const {
    connection,
    wallet,
    form,
    formErrors,
    handleSetForm,
    governedAccountPubkey,
  } = useInstructionFormBuilder<FriktionDepositForm>({
    index,
    initialFormValues: {
      governedAccount,
      uiAmount: 0,
    },
    schema,
    shouldSplitIntoSeparateTxs: true,
    buildInstruction: async function ({
      form,
      governedAccountPubkey,
      connection,
      wallet,
    }) {
      if (!friktionVolts || !friktionVolts[form.volt!]) {
        throw new Error('Could not load Friktion Volt');
      }

      const volt = friktionVolts[form.volt!];
      return depositToVolt({
        connection,
        wallet,
        voltVaultId: volt.voltVaultId,
        governancePubkey: governedAccountPubkey,
        sourceTokenAccount: new PublicKey(form.sourceAccount!),
        amount: form.uiAmount!,
        decimals: volt.shareTokenDecimals,
      });
    },
  });

  const { friktionVolts } = useFriktionVolt({
    connection: connection.current,
    wallet,
    governedAccountPubkey,
  });
  const { ownedTokenAccountsInfo } = useGovernanceUnderlyingTokenAccounts(
    governedAccountPubkey ?? undefined,
  );

  const getVoltDetail = (volt: VoltData) => [
    {
      label: 'Underlying Mint',
      text: volt.underlyingTokenSymbol,
    },
    {
      label: 'Volt APY',
      text: volt.apy.toString() + '%',
    },
    {
      label: 'Deposited',
      text: volt.deposited,
    },
  ];

  const getDiffValue = (amount: number) =>
    amount > 0
      ? {
          label: 'Pending Deposit',
          text: `Pending Deposit: ${amount}`,
          flag: Flag.Warning,
        }
      : { label: 'Pending Deposit', text: 'No Pending Deposit', flag: Flag.OK };

  return (
    <>
      {ownedTokenAccountsInfo && friktionVolts && (
        <>
          <Select
            label="Friktion Volt"
            value={form.volt}
            placeholder="Please select..."
            componentLabel={
              form.volt ? (
                <SelectOptionDetailed
                  title={form.volt}
                  details={getVoltDetail(friktionVolts[form.volt])}
                  diffValue={getDiffValue(
                    Number(friktionVolts[form.volt].pendingDeposit),
                  )}
                />
              ) : undefined
            }
            onChange={(value) => {
              handleSetForm({
                propertyName: 'volt',
                value,
              });
            }}
            error={formErrors['voltVaultId']}
          >
            {Object.entries(friktionVolts).map(([label, volt]) => (
              <Select.Option key={label} value={label}>
                <SelectOptionDetailed
                  title={label}
                  details={getVoltDetail(volt)}
                  diffValue={getDiffValue(Number(volt.pendingDeposit))}
                />
              </Select.Option>
            ))}
          </Select>
          {form.volt && friktionVolts[form.volt] && (
            <>
              <TokenAccountSelect
                label="Source Account"
                value={form.sourceAccount?.toString()}
                filterByMint={
                  friktionVolts[form.volt]
                    ? [new PublicKey(friktionVolts[form.volt].depositTokenMint)]
                    : undefined
                }
                onChange={(value) =>
                  handleSetForm({ value, propertyName: 'sourceAccount' })
                }
                error={formErrors['sourceAccount']}
                ownedTokenAccountsInfo={ownedTokenAccountsInfo}
              />

              <Input
                min={0}
                label="Amount"
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
            </>
          )}
        </>
      )}
    </>
  );
};

export default FriktionDeposit;
