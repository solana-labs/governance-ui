import React, { useState } from 'react';
import * as yup from 'yup';
import useInstructionFormBuilder from '@hooks/useInstructionFormBuilder';
import useTribecaGauge from '@hooks/useTribecaGauge';
import ATribecaConfiguration from '@tools/sdk/tribeca/ATribecaConfiguration';
import { gaugeCommitVoteInstruction } from '@tools/sdk/tribeca/instructions/gaugeCommitVoteInstruction';
import { GovernedMultiTypeAccount } from '@utils/tokens';
import { TribecaGaugeCommitVoteForm } from '@utils/uiTypes/proposalCreationTypes';
import GaugeSelect from './GaugeSelect';
import GovernorSelect from './GovernorSelect';

const schema = yup.object().shape({
  governedAccount: yup
    .object()
    .nullable()
    .required('Governed account is required'),
  gaugeName: yup.string().required('Gauge is required'),
});

const GaugeCommitVote = ({
  index,
  governedAccount,
}: {
  index: number;
  governedAccount?: GovernedMultiTypeAccount;
}) => {
  const [
    tribecaConfiguration,
    setTribecaConfiguration,
  ] = useState<ATribecaConfiguration | null>(null);

  const { gauges, programs } = useTribecaGauge(tribecaConfiguration);
  const {
    connection,
    form,
    formErrors,
    handleSetForm,
  } = useInstructionFormBuilder<TribecaGaugeCommitVoteForm>({
    index,
    initialFormValues: {
      governedAccount,
    },
    schema,
    buildInstruction: async function ({ wallet, form, governedAccountPubkey }) {
      if (
        !programs ||
        !gauges ||
        !gauges[form.gaugeName!] ||
        !tribecaConfiguration
      ) {
        throw new Error('Error initializing Tribeca configuration');
      }

      return gaugeCommitVoteInstruction({
        tribecaConfiguration,
        programs,
        gauge: gauges[form.gaugeName!].mint,
        payer: wallet.publicKey!,
        authority: governedAccountPubkey,
      });
    },
  });

  // Hardcoded gate used to be clear about what cluster is supported for now
  if (connection.cluster !== 'mainnet') {
    return <>This instruction does not support {connection.cluster}</>;
  }

  return (
    <>
      <GovernorSelect
        tribecaConfiguration={tribecaConfiguration}
        setTribecaConfiguration={setTribecaConfiguration}
      />

      <GaugeSelect
        gauges={gauges}
        value={form.gaugeName}
        onChange={(value) =>
          handleSetForm({
            value,
            propertyName: 'gaugeName',
          })
        }
        error={formErrors['gaugeName']}
      />
    </>
  );
};

export default GaugeCommitVote;
