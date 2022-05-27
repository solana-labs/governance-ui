import { useEffect, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'

import FormHeader from '../components_2/FormHeader'
import FormField from '../components_2/FormField'
import FormFooter from '../components_2/FormFooter'
import { InputRangeSlider } from '../components_2/Input'
import Text from '../components_2/ProductText'

import { updateUserInput } from '../utils/formValidation'

export const MemberQuorumThresholdSchema = {
  quorumThreshold: yup
    .number()
    .transform((value) => (isNaN(value) ? undefined : value))
    .max(100, 'Quorum cannot require more than 100% of members')
    .when('$memberAddresses', (memberAddresses, schema) => {
      if (memberAddresses) {
        return schema
          .min(1, 'Quorum must be at least 1% of member')
          .required('Required')
      } else {
        return schema.min(1, 'Quorum must be at least 1% of member')
      }
    }),
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
  visible,
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
    formState: { isValid },
  } = useForm({
    mode: 'all',
    resolver: yupResolver(schema),
    context: formData,
  })
  const [numberOfDaoMembers, setNumberOfDaoMembers] = useState(0)
  const quorumPercent = watch('quorumThreshold')
  const quorumSize =
    quorumPercent && Math.ceil((quorumPercent * numberOfDaoMembers) / 100)

  useEffect(() => {
    if (typeof formData.addCouncil === 'undefined' || formData?.addCouncil) {
      updateUserInput(formData, MemberQuorumThresholdSchema, setValue)
      setNumberOfDaoMembers(formData.memberAddresses?.length)
    } else if (visible) {
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
          render={({ field, fieldState: { error } }) => (
            <FormField
              title="Adjust the percentage to determine votes needed to pass a proposal"
              description=""
            >
              <InputRangeSlider
                field={field}
                error={error?.message}
                placeholder="50"
              />
            </FormField>
          )}
        />
      </div>
      <ThresholdAdviceBox title="Member threshold">
        <Text level="1">
          With {numberOfDaoMembers} members added to your DAO,
        </Text>
        <Text level="1" className="md:pt-2">
          {quorumSize} members would need to approve a proposal for it to pass{' '}
        </Text>
      </ThresholdAdviceBox>

      <FormFooter
        isValid={isValid}
        prevClickHandler={() => onPrevClick(currentStep)}
        faqTitle=""
      />
    </form>
  )
}
