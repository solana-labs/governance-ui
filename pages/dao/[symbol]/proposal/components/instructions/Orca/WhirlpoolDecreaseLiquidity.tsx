import * as yup from 'yup';
import useInstructionFormBuilder from '@hooks/useInstructionFormBuilder';
import { GovernedMultiTypeAccount } from '@utils/tokens';
import { OrcaWhirlpoolDecreaseLiquidityForm } from '@utils/uiTypes/proposalCreationTypes';
import useOrcaWhirlpoolClient from '@hooks/useOrcaWhirlpoolClient';
import orcaConfiguration, {
  WhirlpoolName,
  WhirlpoolPositionInfo,
} from '@tools/sdk/orca/configuration';
import SelectOrcaWhirlpool from '@components/SelectOrcaWhirlpool';
import { useEffect, useState } from 'react';
import Input from '@components/inputs/Input';
import { WhirlpoolImpl } from '@orca-so/whirlpools-sdk/dist/impl/whirlpool-impl';
import useOrcaWhirlpoolPositions from '@hooks/useOrcaWhirlpoolPositions';
import SelectOrcaWhirlpoolPosition from '@components/SelectOrcaWhirlpoolPosition';
import { whirlpoolDecreaseLiquidity } from '@tools/sdk/orca/whirlpoolDecreaseLiquidity';
import InputNumberWithMaxButton from '@components/inputs/InputNumberWithMaxButton';

const schema = yup.object().shape({
  governedAccount: yup
    .object()
    .nullable()
    .required('Governed account is required'),
  whirlpoolName: yup.string().required('Whirlpool name is required'),
  positionInfo: yup.object().nullable().required('Position is required'),
  uiSlippage: yup
    .number()
    .min(0)
    .max(100)
    .typeError('Slippage has to be a number')
    .required('Slippage is required'),
  liquidityAmountToDecrease: yup
    .number()
    .min(0)
    .typeError('Liquidity Amount to Decrease has to be a number')
    .required('Liquidity Amount to Decrease is required'),
});

const OrcaWhirlpoolDecreaseLiquidity = ({
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
    governedAccountPubkey,
  } = useInstructionFormBuilder<OrcaWhirlpoolDecreaseLiquidityForm>({
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

      return whirlpoolDecreaseLiquidity({
        whirlpoolClient: orcaWhirlpoolClient,
        whirlpool: selectedWhirlpool,
        position: form.positionInfo!.publicKey,
        uiSlippage: form.uiSlippage!,
        liquidityAmountToDecrease: form.liquidityAmountToDecrease!,
        authority: governedAccountPubkey,
      });
    },
  });

  const positionsInfo = useOrcaWhirlpoolPositions({
    authority: governedAccountPubkey,
    whirlpool: selectedWhirlpool ?? undefined,
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

  return (
    <>
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

      {selectedWhirlpool && positionsInfo !== null ? (
        <SelectOrcaWhirlpoolPosition
          title="Position"
          positionsInfo={positionsInfo}
          selectedValue={form.positionInfo}
          onSelect={(positionInfo: WhirlpoolPositionInfo) =>
            handleSetForm({
              value: positionInfo,
              propertyName: 'positionInfo',
            })
          }
        />
      ) : null}

      {selectedWhirlpool && form.positionInfo ? (
        <>
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

          <InputNumberWithMaxButton
            min={0}
            max={form.positionInfo?.liquidity}
            label="Native Liquidity Amount To Decrease"
            value={form.liquidityAmountToDecrease}
            onChange={(nb) =>
              handleSetForm({
                value: nb,
                propertyName: 'liquidityAmountToDecrease',
              })
            }
            error={formErrors['liquidityAmountToDecrease']}
          />
        </>
      ) : null}
    </>
  );
};

export default OrcaWhirlpoolDecreaseLiquidity;
