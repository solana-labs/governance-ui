import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'

import FormHeader from '@components/NewRealmWizard/components/FormHeader'
import FormField from '@components/NewRealmWizard/components/FormField'
import FormFooter from '@components/NewRealmWizard/components/FormFooter'
import { RadioGroup } from '@components/NewRealmWizard/components/Input'
import Text from '@components/Text'

import { updateUserInput } from '@utils/formValidation'

export const AddCouncilSchema = {
  addCouncil: yup
    .boolean()
    .oneOf(
      [true, false],
      'You must specify whether you would like to add a council or not'
    )
    .required('Required'),
}

export interface AddCouncil {
  addCouncil: boolean
}

export default function AddCouncilForm({
  type,
  formData,
  currentStep,
  totalSteps,
  onSubmit,
  onPrevClick,
}) {
  const schema = yup.object(AddCouncilSchema).required()
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
    updateUserInput(formData, AddCouncilSchema, setValue)
  }, [])

  function serializeValues(values) {
    let data
    if (!values.addCouncil) {
      data = {
        ...values,
        memberAddresses: null,
        quorumThreshold: null,
      }
    } else {
      data = values
    }
    onSubmit({ step: currentStep, data })
  }

  return (
    <form
      onSubmit={handleSubmit(serializeValues)}
      data-testid="add-council-form"
    >
      <FormHeader
        type={type}
        currentStep={currentStep}
        totalSteps={totalSteps}
        stepDescription="add a council"
        title="Add a council for your Governance Token DAO."
      />
      <div className="space-y-10 md:space-y-12">
        <Text level="1" className="mt-10 mb-16 md:my-18 md:w-[550px]">
          Council members vote on decisions affecting the DAO and its
          treasuries. Since your DAO already has community voting, you may
          choose not to add council members.
        </Text>
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
        prevClickHandler={() => onPrevClick(currentStep)}
        faqTitle="About Governance Token Councils"
      />
    </form>
  )
}
