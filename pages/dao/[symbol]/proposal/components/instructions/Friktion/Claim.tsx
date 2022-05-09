import * as yup from 'yup';
import { PublicKey } from '@solana/web3.js';
import Select from '@components/inputs/Select';
import SelectOptionDetailed, { Flag } from '@components/SelectOptionDetailed';
import useFriktionVolt from '@hooks/usefriktionVolts';
import useGovernanceUnderlyingTokenAccounts from '@hooks/useGovernanceUnderlyingTokenAccounts';
import useInstructionFormBuilder from '@hooks/useInstructionFormBuilder';
import { VoltData } from '@tools/sdk/friktion/friktion';
import claimPendingWithdrawal from '@tools/sdk/friktion/instructions/claimPendingWithdrawal';
import { GovernedMultiTypeAccount } from '@utils/tokens';
import { FriktionClaimWithdrawalForm } from '@utils/uiTypes/proposalCreationTypes';
import TokenAccountSelect from '../../TokenAccountSelect';

const schema = yup.object().shape({
  governedAccount: yup.object().required('Governance is required'),
  receiverAccount: yup.string().typeError('Source account is required'),
  volt: yup.string().required('Volt is required'),
});

const Claim = ({
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
  } = useInstructionFormBuilder<FriktionClaimWithdrawalForm>({
    index,
    initialFormValues: {
      governedAccount,
    },
    schema,
    shouldSplitIntoSeparateTxs: true,
    buildInstruction: async function ({
      form,
      connection,
      wallet,
      governedAccountPubkey,
    }) {
      if (!friktionVolts || !friktionVolts[form.volt!]) {
        throw new Error('Could not load Friktion Volt');
      }

      const volt = friktionVolts[form.volt!];
      return claimPendingWithdrawal({
        connection,
        wallet,
        voltVaultId: volt.voltVaultId,
        governancePubkey: governedAccountPubkey,
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
    {
      label: 'Pending Withdrawal',
      text: volt.pendingWithdrawal,
      ...(Number(volt.pendingWithdrawal) > 0 && { flag: Flag.Warning }),
    },
  ];

  const getDiffValue = (amount: number) =>
    amount > 0
      ? {
          label: 'Claimable',
          text: `Claimable: ${amount}`,
          flag: Flag.OK,
        }
      : { label: 'Claimable', text: 'No Claimable Token', flag: Flag.Danger };

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
                    Number(friktionVolts[form.volt].claimable),
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
                  diffValue={getDiffValue(Number(volt.claimable))}
                />
              </Select.Option>
            ))}
          </Select>
          {form.volt && friktionVolts[form.volt] && (
            <>
              <TokenAccountSelect
                label="Receiver Account"
                value={form.receiverAccount?.toString()}
                filterByMint={
                  friktionVolts[form.volt]
                    ? [new PublicKey(friktionVolts[form.volt].depositTokenMint)]
                    : undefined
                }
                onChange={(value) =>
                  handleSetForm({ value, propertyName: 'receiverAccount' })
                }
                error={formErrors['receiverAccount']}
                ownedTokenAccountsInfo={ownedTokenAccountsInfo}
              />
            </>
          )}
        </>
      )}
    </>
  );
};

export default Claim;
