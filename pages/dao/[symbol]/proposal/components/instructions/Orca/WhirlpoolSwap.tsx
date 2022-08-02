import * as yup from 'yup';
import useInstructionFormBuilder from '@hooks/useInstructionFormBuilder';
import { GovernedMultiTypeAccount } from '@utils/tokens';
import { OrcaWhirlpoolSwapForm } from '@utils/uiTypes/proposalCreationTypes';
import useOrcaWhirlpoolClient from '@hooks/useOrcaWhirlpoolClient';
import orcaConfiguration, {
  WhirlpoolName,
} from '@tools/sdk/orca/configuration';
import SelectOrcaWhirlpool from '@components/SelectOrcaWhirlpool';
import { useEffect, useState } from 'react';
import { WhirlpoolImpl } from '@orca-so/whirlpools-sdk/dist/impl/whirlpool-impl';
import { whirlpoolSwap } from '@tools/sdk/orca/whirlpoolSwap';
import Input from '@components/inputs/Input';
import Switch from '@components/Switch';
import Select from '@components/inputs/Select';
import { getSplTokenNameByMint } from '@utils/splTokens';

const schema = yup.object().shape({
  governedAccount: yup
    .object()
    .nullable()
    .required('Governed account is required'),
  whirlpoolName: yup.string().required('Whirlpool name is required'),
  outputToken: yup.string().required('Output token name is required'),
  uiAmount: yup
    .number()
    .min(0)
    .typeError('Amount has to be a number')
    .required('Amount is required'),
  quoteByOutput: yup.boolean(),
});

const OrcaWhirlpoolSwap = ({
  index,
  governedAccount,
}: {
  index: number;
  governedAccount?: GovernedMultiTypeAccount;
}) => {
  const orcaWhirlpoolClient = useOrcaWhirlpoolClient();
  const whirlpools = orcaConfiguration.Whirlpools;

  const [
    selectedWhirlpool,
    setSelectedWhirlpool,
  ] = useState<WhirlpoolImpl | null>(null);

  const {
    form,
    handleSetForm,
    formErrors,
  } = useInstructionFormBuilder<OrcaWhirlpoolSwapForm>({
    index,
    initialFormValues: {
      governedAccount,
    },
    schema,
    buildInstruction: async function ({
      cluster,
      wallet,
      governedAccountPubkey,
    }) {
      if (cluster !== 'mainnet') {
        throw new Error('Other cluster than mainnet are not supported yet.');
      }

      if (!orcaWhirlpoolClient) {
        throw new Error('Orca whirlpool client is not loaded yet.');
      }

      if (!selectedWhirlpool) {
        throw new Error('No selected whirlpool');
      }

      if (!wallet.publicKey) {
        throw new Error('No connected wallet');
      }

      const amount = form.quoteByOutput
        ? {
            outputTokenMint:
              form.outputToken === 'TokenA'
                ? selectedWhirlpool.tokenAInfo.mint
                : selectedWhirlpool.tokenBInfo.mint,
            uiAmountOfOutputTokenToReceive: form.uiAmount,
          }
        : {
            inputTokenMint:
              form.outputToken === 'TokenA'
                ? selectedWhirlpool.tokenBInfo.mint
                : selectedWhirlpool.tokenAInfo.mint,
            uiAmountOfInputTokenToSwap: form.uiAmount,
          };

      return whirlpoolSwap({
        whirlpool: selectedWhirlpool,
        authority: governedAccountPubkey,
        uiSlippage: form.uiSlippage!,
        ...amount,
      });
    },
  });

  useEffect(() => {
    let quit = false;

    (async () => {
      if (!orcaWhirlpoolClient) {
        return;
      }

      if (!form.whirlpoolName) {
        setSelectedWhirlpool(null);
        return;
      }

      const whirlpoolConfiguration = whirlpools[form.whirlpoolName!];

      const whirlpool = (await orcaWhirlpoolClient.getPool(
        whirlpoolConfiguration.publicKey,
      )) as WhirlpoolImpl;

      if (quit) {
        return;
      }

      setSelectedWhirlpool(whirlpool);
    })();

    return () => {
      quit = true;
    };
  }, [orcaWhirlpoolClient, form.whirlpoolName]);

  const selectWhirlpoolComponent = (
    <SelectOrcaWhirlpool
      title="Whirlpool"
      whirlpools={whirlpools}
      selectedValue={form.whirlpoolName}
      onSelect={(poolName: WhirlpoolName) =>
        handleSetForm({
          value: poolName,
          propertyName: 'whirlpoolName',
        })
      }
    />
  );

  if (!selectedWhirlpool) {
    return selectWhirlpoolComponent;
  }

  const tokenAName = getSplTokenNameByMint(selectedWhirlpool.tokenAInfo.mint);
  const tokenBName = getSplTokenNameByMint(selectedWhirlpool.tokenBInfo.mint);

  return (
    <>
      {selectWhirlpoolComponent}

      <Select
        onChange={(value: string) => {
          handleSetForm({
            value: value,
            propertyName: 'outputToken',
          });
        }}
        label="Token to Purchase"
        value={form.outputToken}
        componentLabel={form.outputToken === 'TokenA' ? tokenAName : tokenBName}
        placeholder="Select a Token"
      >
        <Select.Option key="tokenA" value="TokenA">
          {tokenAName}
        </Select.Option>

        <Select.Option key="tokenB" value="TokenB">
          {tokenBName}
        </Select.Option>
      </Select>

      {form.outputToken ? (
        <>
          <div className="flex space-x-2 flex-wrap">
            <span>
              Set {form.outputToken === 'TokenA' ? tokenBName : tokenAName}{' '}
              amount
            </span>

            <Switch
              checked={form.quoteByOutput}
              onChange={(checked) =>
                handleSetForm({
                  value: checked,
                  propertyName: 'quoteByOutput',
                })
              }
            />

            <span>
              Set {form.outputToken === 'TokenA' ? tokenAName : tokenBName}{' '}
              amount
            </span>
          </div>

          <Input
            min={0}
            label={
              form.quoteByOutput
                ? `Max amount of ${
                    form.outputToken === 'TokenA' ? tokenAName : tokenBName
                  } to receive`
                : `Amount of ${
                    form.outputToken === 'TokenA' ? tokenBName : tokenAName
                  } to swap`
            }
            value={form.uiAmount}
            type="number"
            onChange={(evt) =>
              handleSetForm({
                value: evt.target.value,
                propertyName: 'uiAmount',
              })
            }
            error={formErrors['uiAmount']}
          />

          <Input
            min={0}
            max={100}
            label="Slippage in % from 0 to 100"
            value={form.uiSlippage}
            type="number"
            onChange={(evt) =>
              handleSetForm({
                value: evt.target.value,
                propertyName: 'uiSlippage',
              })
            }
            error={formErrors['uiSlippage']}
          />
        </>
      ) : null}
    </>
  );
};

export default OrcaWhirlpoolSwap;
