import * as yup from 'yup';
import { PublicKey } from '@solana/web3.js';
import Input from '@components/inputs/Input';
import Select from '@components/inputs/Select';
import SelectOptionDetailed, { Flag } from '@components/SelectOptionDetailed';
import useFriktionVolt from '@hooks/usefriktionVolts';
import useGovernanceUnderlyingTokenAccounts from '@hooks/useGovernanceUnderlyingTokenAccounts';
import useInstructionFormBuilder from '@hooks/useInstructionFormBuilder';
import { VoltData } from '@tools/sdk/friktion/friktion';
import withdrawFromVault from '@tools/sdk/friktion/instructions/withdrawFromVault';
import { uiAmountToNativeBN } from '@tools/sdk/units';
import { GovernedMultiTypeAccount } from '@utils/tokens';
import { FriktionWithdrawForm } from '@utils/uiTypes/proposalCreationTypes';
import TokenAccountSelect from '../../TokenAccountSelect';

const schema = yup.object().shape({
  governedAccount: yup.object().required('Governance is required'),
  receiverAccount: yup.string().required('Source account is required'),
  volt: yup.string().required('Volt is required'),
  uiAmount: yup.number().required('Amount is required'),
});

const Withdraw = ({
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
  } = useInstructionFormBuilder<FriktionWithdrawForm>({
    index,
    initialFormValues: {
      governedAccount,
      uiAmount: 0,
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
      return withdrawFromVault({
        connection,
        wallet,
        voltVaultId: volt.voltVaultId,
        governancePubkey: governedAccountPubkey,
        amount: uiAmountToNativeBN(
          form.uiAmount!.toString(),
          volt.shareTokenDecimals,
        ),
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
      label: 'Vault Token Amount',
      text:
        Number(volt.tokenPrice) > 0
          ? (Number(volt.deposited) / Number(volt.tokenPrice)).toString()
          : '0',
    },
    {
      label: 'Pending Withdrawal',
      text: volt.pendingWithdrawal,
      flag: Number(volt.deposited) > 0 ? Flag.Warning : Flag.OK,
    },
  ];

  const getDiffValue = (amount: number) =>
    amount > 0
      ? {
          label: 'Deposited',
          text: `Amount deposited: ${amount}`,
          flag: Flag.OK,
        }
      : {
          label: 'Deposited',
          text: 'No settled deposit on this volt',
          flag: Flag.Danger,
        };

  return (
    <>
      {ownedTokenAccountsInfo && friktionVolts && (
        <>
          <Select
            label="Friktion Volt"
            value={form.volt}
            componentLabel={
              form.volt ? (
                <SelectOptionDetailed
                  title={form.volt}
                  details={getVoltDetail(friktionVolts[form.volt])}
                  diffValue={getDiffValue(
                    Number(friktionVolts[form.volt].deposited),
                  )}
                />
              ) : undefined
            }
            placeholder="Please select..."
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
                  diffValue={getDiffValue(Number(volt.deposited))}
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

              <Input
                min={0}
                label="UI Amount of claimable vault token"
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

              <Input
                type="number"
                label={`UI Amount of ${
                  friktionVolts[form.volt].depositTokenSymbol
                } to withdraw`}
                value={
                  form.uiAmount * Number(friktionVolts[form.volt].tokenPrice)
                }
                disabled={true}
              />
            </>
          )}
        </>
      )}
    </>
  );
};

export default Withdraw;
