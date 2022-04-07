import React, { useState } from 'react';
import * as yup from 'yup';
import Input from '@components/inputs/Input';
import useInstructionFormBuilder from '@hooks/useInstructionFormBuilder';
import useTribecaGauge from '@hooks/useTribecaGauge';
import ATribecaConfiguration from '@tools/sdk/tribeca/ATribecaConfiguration';
import { gaugeSetVoteInstruction } from '@tools/sdk/tribeca/instructions/gaugeSetVoteInstruction';
import { GovernedMultiTypeAccount } from '@utils/tokens';
import { TribecaGaugeSetVoteForm } from '@utils/uiTypes/proposalCreationTypes';
import useWalletStore from 'stores/useWalletStore';
import GaugeSelect from './GaugeSelect';
import GovernorSelect from './GovernorSelect';

const schema = yup.object().shape({
  governedAccount: yup
    .object()
    .nullable()
    .required('Governed account is required'),
  gaugeName: yup.string().required('Gauge is required'),
  weight: yup
    .number()
    .min(0, 'Weight should be equals or more than 0')
    .required('Weight is required'),
});

const SetGaugeVote = ({
  index,
  governedAccount,
}: {
  index: number;
  governedAccount?: GovernedMultiTypeAccount;
}) => {
  const connection = useWalletStore((s) => s.connection);

  const [
    tribecaConfiguration,
    setTribecaConfiguration,
  ] = useState<ATribecaConfiguration | null>(null);

  const { gauges, programs } = useTribecaGauge(tribecaConfiguration);

  const {
    form,
    handleSetForm,
    formErrors,
  } = useInstructionFormBuilder<TribecaGaugeSetVoteForm>({
    index,
    initialFormValues: {
      governedAccount,
    },
    schema,
    buildInstruction: async function ({ form, governedAccountPubkey }) {
      if (
        !programs ||
        !gauges ||
        !gauges[form.gaugeName!] ||
        !tribecaConfiguration
      ) {
        throw new Error('Error initializing Tribeca configuration');
      }

      return gaugeSetVoteInstruction({
        tribecaConfiguration,
        weight: form.weight!,
        programs,
        gauge: gauges[form.gaugeName!].mint,
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

      <Input
        label="Weight (relative)"
        value={form.weight}
        type="number"
        min="0"
        onChange={(evt) =>
          handleSetForm({
            value: evt.target.value,
            propertyName: 'weight',
          })
        }
        error={formErrors['weight']}
      />
    </>
  );
};

export default SetGaugeVote;
