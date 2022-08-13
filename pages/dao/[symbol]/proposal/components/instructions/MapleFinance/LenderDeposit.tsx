import * as yup from 'yup';
import Input from '@components/inputs/Input';
import useInstructionFormBuilder from '@hooks/useInstructionFormBuilder';
import mapleFinanceConfig, {
  MapleFinance,
} from '@tools/sdk/mapleFinance/configuration';
import { lenderDeposit } from '@tools/sdk/mapleFinance/instructions/lenderDeposit';
import { GovernedMultiTypeAccount } from '@utils/tokens';
import { MapleFinanceLenderDepositForm } from '@utils/uiTypes/proposalCreationTypes';
import { uiAmountToNativeBN } from '@tools/sdk/units';
import TokenAccountSelect from '../../TokenAccountSelect';
import useGovernanceUnderlyingTokenAccounts from '@hooks/useGovernanceUnderlyingTokenAccounts';
import Select from '@components/inputs/Select';
import { PublicKey } from '@solana/web3.js';

const schema = yup.object().shape({
  governedAccount: yup
    .object()
    .nullable()
    .required('Governed account is required'),
  uiDepositAmount: yup
    .number()
    .moreThan(0, 'Deposit amount should be more than 0')
    .required('Deposit amount is required'),
  poolName: yup.string().required('Pool Name is required'),
});

const LenderDeposit = ({
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
    governedAccountPubkey,
  } = useInstructionFormBuilder<MapleFinanceLenderDepositForm>({
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
      const programs = mapleFinanceConfig.getMapleFinancePrograms({
        connection,
        wallet,
      });

      return lenderDeposit({
        authority: governedAccountPubkey,
        programs,
        depositAmount: uiAmountToNativeBN(
          form.uiDepositAmount!.toString(),
          MapleFinance.pools[form.poolName!].baseMint.decimals,
        ),
        poolName: form.poolName!,
        sourceAccount: new PublicKey(form.sourceAccount!),
      });
    },
  });

  // Governance underlying accounts that can be selected as source
  const { ownedTokenAccountsInfo } = useGovernanceUnderlyingTokenAccounts(
    governedAccountPubkey,
  );

  return (
    <>
      <Select
        label="Pool"
        value={form.poolName}
        placeholder="Please select..."
        onChange={(value) => {
          handleSetForm({
            value,
            propertyName: 'poolName',
          });
        }}
        error={formErrors['poolName']}
      >
        {Object.keys(MapleFinance.pools).map((name) => (
          <Select.Option key={name} value={name}>
            {name}
          </Select.Option>
        ))}
      </Select>

      {ownedTokenAccountsInfo && (
        <TokenAccountSelect
          label="Source Account"
          value={form.sourceAccount}
          onChange={(value) =>
            handleSetForm({ value, propertyName: 'sourceAccount' })
          }
          error={formErrors['sourceAccount']}
          ownedTokenAccountsInfo={ownedTokenAccountsInfo}
          filterByMint={
            form.poolName && MapleFinance.pools[form.poolName]
              ? [MapleFinance.pools[form.poolName].baseMint.mint]
              : undefined
          }
        />
      )}

      <Input
        label="Deposit Amount"
        value={form.uiDepositAmount}
        type="number"
        min="0"
        onChange={(evt) =>
          handleSetForm({
            value: evt.target.value,
            propertyName: 'uiDepositAmount',
          })
        }
        error={formErrors['uiDepositAmount']}
      />
    </>
  );
};

export default LenderDeposit;
