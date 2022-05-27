import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'

import FormHeader from '../components_2/FormHeader'
import FormField from '../components_2/FormField'
import FormFooter from '../components_2/FormFooter'
import { InputRangeSlider } from '../components_2/Input'
import Text from '../components_2/ProductText'
import { ThresholdAdviceBox } from './MemberQuorumThresholdForm'

import { updateUserInput } from '../utils/formValidation'

export const ApprovalThresholdSchema = {
  approvalThreshold: yup
    .number()
    .transform((value) => (isNaN(value) ? 0 : value))
    .max(100, 'Approval cannot require more than 100% of votes')
    .min(1, 'Approval must be at least 1% of votes')
    .required('Required'),
}

export interface ApprovalThreshold {
  approvalThreshold: number
}

export default function ApprovalThresholdForm({
  formData,
  currentStep,
  totalSteps,
  onSubmit,
  onPrevClick,
}) {
  const schema = yup.object(ApprovalThresholdSchema).required()
  const {
    control,
    setValue,
    handleSubmit,
    formState: { isValid },
  } = useForm({
    mode: 'all',
    resolver: yupResolver(schema),
  })

  useEffect(() => {
    updateUserInput(formData, ApprovalThresholdSchema, setValue)
  }, [])

  function serializeValues(values) {
    onSubmit({ step: currentStep, data: values })
  }

  return (
    <form
      onSubmit={handleSubmit(serializeValues)}
      data-testid="approval-threshold-form"
    >
      <FormHeader
        currentStep={currentStep}
        totalSteps={totalSteps}
        stepDescription="Approval threshold"
        title="Next, let's determine the approval threshold for community proposals."
      />
      <div className="mt-10 space-y-10 md:space-y-12">
        <Controller
          name="approvalThreshold"
          control={control}
          defaultValue={60}
          render={({ field, fieldState: { error } }) => (
            <FormField
              title="Adjust how much of the total token supply is needed to pass a proposal"
              description=""
            >
              <InputRangeSlider
                field={field}
                error={error?.message}
                placeholder="60"
              />
            </FormField>
          )}
        />
      </div>
      <ThresholdAdviceBox title="Approval threshold">
        <Text level="1">
          Typically, newer Governance Token DAOs start their community approval
          quorums around 60% of total token supply.
        </Text>
      </ThresholdAdviceBox>

      <FormFooter
        isValid={isValid}
        prevClickHandler={() => onPrevClick(currentStep)}
        faqTitle="About Approval Quorum"
      />
    </form>
  )
}
