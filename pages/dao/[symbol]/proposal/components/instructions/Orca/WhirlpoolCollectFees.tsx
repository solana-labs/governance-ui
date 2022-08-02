import * as yup from 'yup';
import useInstructionFormBuilder from '@hooks/useInstructionFormBuilder';
import { GovernedMultiTypeAccount } from '@utils/tokens';
import { OrcaWhirlpoolCollectFeesForm } from '@utils/uiTypes/proposalCreationTypes';
import useOrcaWhirlpoolClient from '@hooks/useOrcaWhirlpoolClient';
import orcaConfiguration, {
  WhirlpoolName,
  WhirlpoolPositionInfo,
} from '@tools/sdk/orca/configuration';
import SelectOrcaWhirlpool from '@components/SelectOrcaWhirlpool';
import { useEffect, useState } from 'react';
import { WhirlpoolImpl } from '@orca-so/whirlpools-sdk/dist/impl/whirlpool-impl';
import useOrcaWhirlpoolPositions from '@hooks/useOrcaWhirlpoolPositions';
import SelectOrcaWhirlpoolPosition from '@components/SelectOrcaWhirlpoolPosition';
import { whirlpoolCollectFees } from '@tools/sdk/orca/whirlpoolCollectFees';

const schema = yup.object().shape({
  governedAccount: yup
    .object()
    .nullable()
    .required('Governed account is required'),
  whirlpoolName: yup.string().required('Whirlpool name is required'),
  positionInfo: yup.object().nullable().required('Position is required'),
});

const OrcaWhirlpoolCollectFees = ({
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
    governedAccountPubkey,
  } = useInstructionFormBuilder<OrcaWhirlpoolCollectFeesForm>({
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

      if (!selectedWhirlpool) {
        throw new Error('No selected whirlpool');
      }

      if (!wallet.publicKey) {
        throw new Error('No connected wallet');
      }

      return whirlpoolCollectFees({
        whirlpool: selectedWhirlpool,
        position: form.positionInfo!.publicKey,
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
    </>
  );
};

export default OrcaWhirlpoolCollectFees;
