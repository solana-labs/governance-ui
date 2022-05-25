import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'

import FormHeader from '../components_2/FormHeader'
import FormField from '../components_2/FormField'
import FormFooter from '../components_2/FormFooter'
import Input from '../components_2/Input'
import { ThresholdAdviceBox } from './MemberQuorumThresholdForm'

import { updateUserInput } from '../utils/formValidation'

export const ApprovalThresholdSchema = {
  approvalThreshold: yup
    .number()
    .typeError('Required')
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
        title="Next, let's determine the approval quorum for community proposals."
        imgSrc="/1-Landing-v2/dao-type-medium-govtoken.png"
        imgAlt="circles spirling"
      />
      <div className="pt-10 space-y-10 md:space-y-12">
        <Controller
          name="approvalThreshold"
          control={control}
          defaultValue={60}
          render={({ field }) => (
            <FormField
              title="Adjust how much of the total governance token supply needed to pass a proposal"
              description=""
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-[4.5rem]">
                    <Input
                      type="number"
                      placeholder="60"
                      data-testid="dao-quorum-input"
                      error={errors.approvalThreshold?.message || ''}
                      {...field}
                    />
                  </div>
                  <div className="text-3xl opacity-30">%</div>
                </div>
                <div className="relative flex items-center w-full ml-4 space-x-4">
                  <div className="opacity-60">1%</div>
                  <input
                    type="range"
                    min={1}
                    className="w-full with-gradient focus:outline-none focus:ring-0 focus:shadow-none"
                    {...field}
                    style={{
                      backgroundSize: `${approvalPercent}% 100%`,
                    }}
                  />
                  <div className="opacity-60">100%</div>
                </div>
              </div>
            </FormField>
          )}
        />
      </div>
      <ThresholdAdviceBox title="Approval threshold">
        <div className="text-lg">
          Typically, newer Governance Token DAOs start their community approval
          quorums around 60% of total token supply.
        </div>
      </ThresholdAdviceBox>

      <FormFooter
        isValid={isValid}
        prevClickHandler={() => onPrevClick(currentStep)}
        faqTitle="About Approval Quorum"
      />
    </form>
  )
}
