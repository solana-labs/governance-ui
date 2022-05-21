import { useEffect, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'

import FormHeader from '../FormHeader'
import FormField from '../FormField'
import FormFooter from '../FormFooter'
import Input from '../Input'
import {
  STEP2_SCHEMA,
  STEP3_SCHEMA,
  getFormData,
  updateUserInput,
} from './Wizard'

export default function Step3({ onSubmit, onPrevClick }) {
  const [numberOfDaoMember, setNumberOfDaoMember] = useState(0)

  const schema = yup.object(STEP3_SCHEMA).required()
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
    yup
      .object(STEP2_SCHEMA)
      .isValid(formData)
      .then((valid) => {
        if (valid) {
          setNumberOfDaoMember(formData?.memberAddresses?.length)
          updateUserInput(STEP3_SCHEMA, setValue)
        } else {
          onPrevClick(3)
        }
      })
  }, [])

  function serializeValues(values) {
    onSubmit({ step: 3, data: values })
  }

  return (
    <form
      onSubmit={handleSubmit(serializeValues)}
      data-testid="multisig-step-3"
    >
      <FormHeader
        currentStep={3}
        totalSteps={4}
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
        prevClickHandler={() => onPrevClick(3)}
        faqTitle="About Approval Quorum"
      />
    </form>
  )
}
