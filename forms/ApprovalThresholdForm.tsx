import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'

import { preventNegativeNumberInput } from '@utils/helpers'

import FormHeader from '../components_2/FormHeader'
import FormField from '../components_2/FormField'
import FormFooter from '../components_2/FormFooter'
import Input from '../components_2/Input'
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
    watch,
    setValue,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm({
    mode: 'all',
    resolver: yupResolver(schema),
  })
  const approvalPercent = watch('approvalThreshold', 60)

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
      <div className="pt-10 space-y-10 md:space-y-12">
        <Controller
          name="approvalThreshold"
          control={control}
          defaultValue={60}
          render={({ field }) => (
            <FormField
              title="Adjust how much of the total token supply is needed to pass a proposal"
              description=""
            >
              <div className="flex flex-col-reverse md:flex-row md:items-baseline md:space-x-16">
                {/* <div className="mr-10 w-full2"> */}
                <Input
                  type="tel"
                  placeholder="60"
                  suffix={
                    <Text level="1" className="">
                      %
                    </Text>
                  }
                  data-testid="dao-approval-threshold-input"
                  error={errors.approvalThreshold?.message || ''}
                  className="text-center"
                  // style={{ width: '60px' }}
                  {...field}
                  onChange={(ev) => {
                    preventNegativeNumberInput(ev)
                    field.onChange(ev)
                  }}
                />
                {/* </div> my-6 */}
                <div className="relative flex items-center w-full my-6 space-x-4 md:my-0">
                  <Text level="2" className="opacity-60">
                    1%
                  </Text>
                  <input
                    type="range"
                    min={1}
                    className="w-full with-gradient focus:outline-none focus:ring-0 focus:shadow-none"
                    {...field}
                    style={{
                      backgroundSize: `${approvalPercent || 0}% 100%`,
                    }}
                  />
                  <Text level="2" className="opacity-60">
                    100%
                  </Text>
                </div>
              </div>
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
