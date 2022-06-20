import * as yup from 'yup';
import { GovernedMultiTypeAccount } from '@utils/tokens';
import useInstructionFormBuilder from '@hooks/useInstructionFormBuilder';
import { LifinityWithdrawFromPoolForm } from '@utils/uiTypes/proposalCreationTypes';
import Select from '@components/inputs/Select';
import {
  calculateMinimumWithdrawAmounts,
  getUserLiquidityPoolTokenUiBalance,
  poolLabels,
} from '@tools/sdk/lifinity/lifinity';
import SelectOptionList from '../../SelectOptionList';
import Input from '@components/inputs/Input';
import { notify } from '@utils/notifications';
import { useEffect, useState } from 'react';
import { debounce } from '@utils/debounce';
import withdrawFromPool from '@tools/sdk/lifinity/withdrawFromPool';

const SLIPPAGE_OPTIONS = [0.5, 1, 2];

const schema = yup.object().shape({
  governedAccount: yup
    .object()
    .nullable()
    .required('Governed account is required'),
  poolName: yup.string().required('Liquidity Pool is required'),
  uiAmountTokenLP: yup
    .number()
    .moreThan(0, 'LP Token Amount to withdraw must be more than 0')
    .required('LP Token Amount to withdraw value is required'),
  slippage: yup.number().required('Slippage value is required'),
});

const WithdrawFromPool = ({
  index,
  governedAccount,
}: {
  index: number;
  governedAccount?: GovernedMultiTypeAccount;
}) => {
  const [maxLPTokenAmount, setMaxLPTokenAmount] = useState(0);
  const [tokenAmounts, setTokenAmounts] = useState({
    uiAmountTokenA: 0,
    uiAmountTokenB: 0,
  });
  const {
    form,
    formErrors,
    handleSetForm,
    connection,
    governedAccountPubkey,
  } = useInstructionFormBuilder<LifinityWithdrawFromPoolForm>({
    index,
    initialFormValues: {
      governedAccount,
      uiAmountTokenLP: 0,
      slippage: 0.5,
    },
    schema,
    buildInstruction: async function ({
      connection,
      form,
      wallet,
      governedAccountPubkey,
    }) {
      const {
        minimumAmountTokenA,
        minimumAmountTokenB,
        lpTokenAmount,
      } = await calculateMinimumWithdrawAmounts({
        connection: connection,
        poolName: form.poolName!,
        uiLpTokenAmount: form.uiAmountTokenLP!,
        slippage: form.slippage,
      });

      return withdrawFromPool({
        connection,
        wallet,
        poolName: form.poolName!,
        userTransferAuthority: governedAccountPubkey,
        lpTokenAmount,
        minimumAmountTokenA,
        minimumAmountTokenB,
      });
    },
  });

  useEffect(() => {
    async function fetchLpMintInfo() {
      if (!governedAccountPubkey || !form.poolName) return;

      try {
        const uiBalance = await getUserLiquidityPoolTokenUiBalance({
          wallet: governedAccountPubkey,
          poolName: form.poolName,
          connection: connection.current,
        });

        setMaxLPTokenAmount(uiBalance);
      } catch (e) {
        notify({
          type: 'error',
          message: 'Could not fetch LP Account',
          description: `${form.poolName} LP Token Account could not be found for the selected Governance`,
        });
      }
    }
    fetchLpMintInfo();
  }, [governedAccount?.governance?.pubkey, form.poolName]);

  useEffect(() => {
    debounce.debounceFcn(async () => {
      if (!form.uiAmountTokenLP || !form.poolName) return;
      const {
        minimumWithdrawnUiAmountTokenA,
        minimumWithdrawnUiAmountTokenB,
      } = await calculateMinimumWithdrawAmounts({
        connection: connection.current,
        poolName: form.poolName,
        uiLpTokenAmount: form.uiAmountTokenLP!,
        slippage: form.slippage,
      });

      setTokenAmounts({
        uiAmountTokenA: minimumWithdrawnUiAmountTokenA,
        uiAmountTokenB: minimumWithdrawnUiAmountTokenB,
      });
    });
  }, [form.poolName, form.uiAmountTokenLP, form.slippage]);

  return (
    <>
      <Select
        label="Lifinity Liquidity Pool"
        value={form.poolName}
        placeholder="Please select..."
        onChange={(value) => handleSetForm({ value, propertyName: 'poolName' })}
        error={formErrors['poolName']}
      >
        <SelectOptionList list={poolLabels} />
      </Select>

      {form.poolName && (
        <>
          <Input
            label={`Amount of LP Token to redeem - max: ${maxLPTokenAmount}`}
            value={form.uiAmountTokenLP}
            type="number"
            max={String(maxLPTokenAmount)}
            min="0"
            onChange={(evt) =>
              handleSetForm({
                value: evt.target.value,
                propertyName: 'uiAmountTokenLP',
              })
            }
            error={formErrors['uiAmountTokenLP']}
          />
          <Select
            label="Slippage (%)"
            value={form.slippage}
            onChange={(value) =>
              handleSetForm({ value, propertyName: 'slippage' })
            }
            error={formErrors['slippage']}
          >
            <SelectOptionList list={SLIPPAGE_OPTIONS} />
          </Select>
          <Input
            label="Amount of Token A to Withdraw"
            value={tokenAmounts.uiAmountTokenA}
            type="number"
            min={0}
            disabled={true}
          />
          <Input
            label="Amount of Token B to Withdraw"
            value={tokenAmounts.uiAmountTokenB}
            type="number"
            min={0}
            disabled={true}
          />
        </>
      )}
    </>
  );
};

export default WithdrawFromPool;
