import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'

import FormHeader from '../FormHeader'
import FormField from '../FormField'
import FormFooter from '../FormFooter'
import { RadioGroup } from '../Input'
import Text from 'components_2/Text'

import {
  STEP3_SCHEMA,
  STEP4_SCHEMA,
  getFormData,
  updateUserInput,
} from './Wizard'

export default function Step4({ onSubmit, onPrevClick }) {
  const schema = yup.object(STEP4_SCHEMA).required()
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
    const formData = getFormData()
    yup
      .object(STEP3_SCHEMA)
      .isValid(formData)
      .then((valid) => {
        if (valid) {
          updateUserInput(STEP4_SCHEMA, setValue)
        } else {
          onPrevClick(4)
        }
      })
  }, [])

  function serializeValues(values) {
    onSubmit({ step: 4, data: values })
  }

  return (
    <form
      onSubmit={handleSubmit(serializeValues)}
      data-testid="govtoken-step-4"
    >
      <FormHeader
        currentStep={4}
        totalSteps={5}
        stepDescription="Add a council"
        title="Add a council for your Governance Token DAO."
        imgSrc="/1-Landing-v2/dao-type-medium-govtoken.png"
        imgAlt="circles spirling"
      />
      <div className="pt-10 space-y-10 md:space-y-12">
        <div className="py-24 text-[24px]">
          Council members vote on decisions affecting the DAO and its
          treasuries. Since your DAO already has community voting, you may
          choose not to add council members.
        </div>
        <FormField title="Do you want to add a council?" description="">
          <Controller
            name="addCouncil"
            control={control}
            defaultValue={undefined}
            render={({ field }) => (
              <RadioGroup
                onChange={field.onChange}
                value={field.value}
                onBlur={field.onBlur}
                options={[
                  { label: 'Yes I do', value: true },
                  { label: 'No, skip this step', value: false },
                ]}
              />
            )}
          />
        </FormField>
      </div>
      <FormFooter
        isValid={isValid}
        prevClickHandler={() => onPrevClick(4)}
        faqTitle="About Governance Token Councils"
      />
    </form>
  )
}
