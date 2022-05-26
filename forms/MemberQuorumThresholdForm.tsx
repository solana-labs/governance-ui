import { useEffect, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'

import FormHeader from '../components_2/FormHeader'
import FormField from '../components_2/FormField'
import FormFooter from '../components_2/FormFooter'
import Input from '../components_2/Input'
import Text from '../components_2/ProductText'

import { updateUserInput } from '../utils/formValidation'

export const MemberQuorumThresholdSchema = {
  quorumThreshold: yup
    .number()
    .typeError('Required')
    .positive('Must be greater than 0')
    .transform((value) => (isNaN(value) ? undefined : value))
    .max(100, 'Quorum cannot require more than 100% of members')
    .min(1, 'Quorum must be at least 1% of member'),
}

export interface MemberQuorumThreshold {
  quorumThreshold: number
}

export function ThresholdAdviceBox({ title, children }) {
  return (
    <div className="flex flex-col items-start py-4 pl-4 pr-4 mt-4 rounded md:mt-10 md:space-x-4 md:pr-2 md:pl-8 md:py-8 md:flex-row bg-night-grey">
      <div className="w-16 px-2 py-5 mx-auto bg-black rounded-lg md:w-fit md:mx-0">
        <img src="/1-Landing-v2/icon-quorum-gradient.png" className="h-full" />
      </div>
      <div className="flex flex-col w-full text-center md:text-left">
        <Text level="3" className="pt-3 pb-3 uppercase opacity-50 md:pt-0">
          {title}
        </Text>
        {children}
      </div>
    </div>
  )
}

export default function MemberQuorumThresholdForm({
  formData,
  currentStep,
  totalSteps,
  onSubmit,
  onPrevClick,
}) {
  const schema = yup.object(MemberQuorumThresholdSchema).required()
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
  const [numberOfDaoMembers, setNumberOfDaoMembers] = useState(0)
  const quorumPercent = watch('quorumThreshold', 50)
  const quorumSize = Math.ceil((quorumPercent * numberOfDaoMembers) / 100)

  useEffect(() => {
    if (typeof formData.addCouncil === 'undefined' || formData?.addCouncil) {
      updateUserInput(formData, MemberQuorumThresholdSchema, setValue)
      setNumberOfDaoMembers(formData.memberAddresses?.length)
    } else {
      // go to next step:
      serializeValues({ quorumThreshold: null })
    }
  }, [formData])

  function serializeValues(values) {
    onSubmit({ step: currentStep, data: values })
  }

  return (
    <form
      onSubmit={handleSubmit(serializeValues)}
      data-testid="member-quorum-threshold-form"
    >
      <FormHeader
        currentStep={currentStep}
        totalSteps={totalSteps}
        stepDescription="Council qurorum"
        title="Last, let's determine the quorum required for your council."
      />
      <div className="pt-10 space-y-10 md:space-y-12">
        <Controller
          name="quorumThreshold"
          control={control}
          defaultValue={50}
          render={({ field }) => (
            <FormField
              title="Adjust the percentage to determine votes needed to pass a proposal"
              description=""
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-[4.5rem]">
                    <Input
                      type="number"
                      placeholder="50"
                      data-testid="dao-quorum-input"
                      error={errors.quorumThreshold?.message || ''}
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
                      backgroundSize: `${quorumPercent}% 100%`,
                    }}
                  />
                  <div className="opacity-60">100%</div>
                </div>
              </div>
            </FormField>
          )}
        />
      </div>
      <ThresholdAdviceBox title="Member threshold">
        <div className="text-lg">
          With {numberOfDaoMembers} members added to your DAO,
        </div>
        <div className="pt-2 text-lg">
          {quorumSize} members would need to approve a proposal for it to pass{' '}
        </div>
      </ThresholdAdviceBox>

      <FormFooter
        isValid={isValid}
        prevClickHandler={() => onPrevClick(currentStep)}
        faqTitle=""
      />
    </form>
  )
}
