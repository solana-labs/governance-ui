import * as yup from 'yup';
import { BN } from '@project-serum/anchor';
import Input from '@components/inputs/Input';
import Select from '@components/inputs/Select';
import useInstructionFormBuilder from '@hooks/useInstructionFormBuilder';
import {
  getTribecaLocker,
  getTribecaPrograms,
} from '@tools/sdk/tribeca/configurations';
import { lockInstruction } from '@tools/sdk/tribeca/instructions/lockInstruction';
import { GovernedMultiTypeAccount } from '@utils/tokens';
import { TribecaLockForm } from '@utils/uiTypes/proposalCreationTypes';
import SelectOptionList from '../../SelectOptionList';
import GovernorSelect from './GovernorSelect';
import { uiAmountToNativeBN } from '@tools/sdk/units';

const schema = yup.object().shape({
  governedAccount: yup
    .object()
    .nullable()
    .required('Governed account is required'),
  tribecaConfiguration: yup
    .object()
    .nullable()
    .required('Tribeca Configuration Governoris required'),
  uiAmount: yup
    .number()
    .moreThan(0, 'Amount should be more than 0')
    .required('Amount is required'),
  durationSeconds: yup.number().required('Duration is required'),
});

const Lock = ({
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
  } = useInstructionFormBuilder<TribecaLockForm>({
    index,
    initialFormValues: {
      governedAccount,
      tribecaConfiguration: null,
      uiAmount: 0,
      durationSeconds: 0,
    },
    schema,
    buildInstruction: async function ({
      connection,
      wallet,
      form,
      governedAccountPubkey,
    }) {
      const programs = getTribecaPrograms({
        connection,
        wallet,
        config: form.tribecaConfiguration!,
      });
      const lockerData = await getTribecaLocker({
        programs,
        config: form.tribecaConfiguration!,
      });

      return lockInstruction({
        tribecaConfiguration: form.tribecaConfiguration!,
        programs,
        lockerData,
        authority: governedAccountPubkey,
        amount: uiAmountToNativeBN(
          form.uiAmount!.toString(),
          form.tribecaConfiguration!.token.decimals,
        ),
        durationSeconds: new BN(form.durationSeconds * 60 * 60 * 24 * 365),
      });
    },
  });

  return (
    <>
      <GovernorSelect
        tribecaConfiguration={form.tribecaConfiguration}
        setTribecaConfiguration={(value) =>
          handleSetForm({ value, propertyName: 'tribecaConfiguration' })
        }
      />

      <Input
        label="Amount to lock"
        value={form.uiAmount}
        type="number"
        min="0"
        onChange={(evt) =>
          handleSetForm({
            value: evt.target.value,
            propertyName: 'uiAmount',
          })
        }
        error={formErrors['uiAmount']}
      />

      <Select
        label="Lock Duration in Years"
        value={form.durationSeconds}
        placeholder="Please select..."
        onChange={(value) =>
          handleSetForm({
            value,
            propertyName: 'durationSeconds',
          })
        }
        error={formErrors['durationSeconds']}
      >
        <SelectOptionList list={[1, 2, 5]} />
      </Select>

      {/* <Input
        label="Duration in seconds"
        value={form.durationSeconds}
        type="number"
        min={minDurationSeconds}
        max={maxDurationSeconds}
        onChange={(evt) =>
          handleSetForm({
            value: evt.target.value,
            propertyName: 'durationSeconds',
          })
        }
        error={formErrors['durationSeconds']}
      /> */}
    </>
  );
};

export default Lock;
