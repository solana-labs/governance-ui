import React from 'react';
import * as yup from 'yup';
import { getInstructionDataFromBase64 } from '@solana/spl-governance';
import Input from '@components/inputs/Input';
import Textarea from '@components/inputs/Textarea';
import { Base64InstructionForm } from '@utils/uiTypes/proposalCreationTypes';
import { GovernedMultiTypeAccount } from '@utils/tokens';
import useInstructionFormBuilder, {
  SerializedInstruction,
} from '@hooks/useInstructionFormBuilder';

const CustomBase64 = ({
  index,
  governedAccount,
}: {
  index: number;
  governedAccount?: GovernedMultiTypeAccount;
}) => {
  const {
    form,
    formErrors,
    handleSetForm,
  } = useInstructionFormBuilder<Base64InstructionForm>({
    index,
    initialFormValues: {
      governedAccount,
      base64: '',
      holdUpTime: 0,
    },
    schema: yup.object().shape({
      governedAccount: yup
        .object()
        .nullable()
        .required('Governed account is required'),
      base64: yup
        .string()
        .required('Instruction is required')
        .test('base64Test', 'Invalid base64', function (val: string) {
          if (val) {
            try {
              getInstructionDataFromBase64(val);
              return true;
            } catch (e) {
              return false;
            }
          }

          return this.createError({
            message: `Instruction is required`,
          });
        }),
      holdUpTime: yup.number().required('Hold up time is required'),
    }),

    getCustomHoldUpTime: async function () {
      return form.holdUpTime;
    },

    buildInstruction: async function () {
      return form.base64 as SerializedInstruction;
    },
  });

  const validateAmountOnBlur = () => {
    const value = form.holdUpTime;

    handleSetForm({
      value: parseFloat(
        Math.max(
          Number(0),
          Math.min(Number(Number.MAX_SAFE_INTEGER), Number(value)),
        ).toFixed(),
      ),
      propertyName: 'holdUpTime',
    });
  };

  return (
    <>
      <Input
        min={0}
        label="Hold up time (days)"
        value={form.holdUpTime}
        type="number"
        onChange={(event) => {
          handleSetForm({
            value: event.target.value,
            propertyName: 'holdUpTime',
          });
        }}
        step={1}
        error={formErrors['holdUpTime']}
        onBlur={validateAmountOnBlur}
      />

      <Textarea
        label="Instruction"
        placeholder="Base64 encoded serialized Solana instruction"
        wrapperClassName="mb-5"
        value={form.base64}
        onChange={(evt) =>
          handleSetForm({
            value: evt.target.value,
            propertyName: 'base64',
          })
        }
        error={formErrors['base64']}
      />
    </>
  );
};

export default CustomBase64;
