import { useEffect, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'

import FormHeader from '../FormHeader'
import FormField from '../FormField'
import FormFooter from '../FormFooter'
import Input from '../Input'
import { getFormData, updateUserInput } from './Wizard'

export const MemberQuorumThresholdSchema = {
  quorumThreshold: yup
    .number()
    .typeError('Required')
    .max(100, 'Quorum cannot require more than 100% of members')
    .min(1, 'Quorum must be at least 1% of member')
    .required('Required'),
}

export default function MemberQuorumThresholdForm({
  currentStep,
  totalSteps,
  onSubmit,
  onPrevClick,
  prevStepSchema,
}) {
  const [numberOfDaoMember, setNumberOfDaoMember] = useState(0)

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
  const quorumPercent = watch('quorumThreshold', 50)
  const quorumSize = Math.ceil((quorumPercent * numberOfDaoMember) / 100)

  useEffect(() => {
    const formData = getFormData()
    if (prevStepSchema) {
      yup
        .object(prevStepSchema)
        .isValid(formData)
        .then((valid) => {
          console.log('is previous step valid', valid, currentStep)
          if (valid) {
            setNumberOfDaoMember(formData?.memberAddresses?.length)
            updateUserInput(MemberQuorumThresholdSchema, setValue)
          } else {
            onPrevClick(currentStep)
          }
        })
    } else {
      setNumberOfDaoMember(formData?.memberAddresses?.length)
      updateUserInput(MemberQuorumThresholdSchema, setValue)
    }
  }, [])

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
        stepDescription="Approval qurorum"
        title="Last, let's determine the approval quorum for your shared wallet."
        imgSrc="/1-Landing-v2/dao-type-medium-govtoken.png"
        imgAlt="circles spirling"
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
      <div className="bg-[#201f27] py-8 pr-2 pl-8 flex items-start space-x-8">
        <div className="w-24 h-24 px-2 py-5 bg-black rounded-lg">
          <img src="/1-Landing-v2/icon-quorum-gradient.png" />
        </div>
        <div className="flex flex-col">
          <div className="pb-3 text-sm uppercase opacity-50">
            Approval quorum
          </div>
          <div className="text-lg">
            With {numberOfDaoMember} members added to your DAO,
          </div>
          <div className="pt-2 text-lg">
            {quorumSize} members would need to approve a proposal for it to pass{' '}
          </div>
        </div>
      </div>
      <FormFooter
        isValid={isValid}
        prevClickHandler={() => onPrevClick(currentStep)}
        faqTitle=""
      />
    </form>
  )
}
