import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'

import FormHeader from '@components/NewRealmWizard/components/FormHeader'
import FormField from '@components/NewRealmWizard/components/FormField'
import FormFooter from '@components/NewRealmWizard/components/FormFooter'
import AdvancedOptionsDropdown from '@components/NewRealmWizard/components/AdvancedOptionsDropdown'
import Input from '@components/NewRealmWizard/components/Input'

import { DEFAULT_GOVERNANCE_PROGRAM_ID } from '@components/instructions/tools'

import { updateUserInput, validateSolAddress } from '@utils/formValidation'

import { FORM_NAME as MUTISIG_FORM } from 'pages/realms/new/multisig'

export const BasicDetailsSchema = {
  avatar: yup.string(),
  name: yup
    .string()
    .typeError('Required')
    .required('Required')
    .max(32, 'Name must not be longer than 32 characters'),
  // description: yup.string(),
  programId: yup
    .string()
    .test('is-valid-address', 'Please enter a valid Solana address', (value) =>
      value ? validateSolAddress(value) : true
    ),
}

export interface BasicDetails {
  avatar?: string
  name: string
  // description?: string
  programId?: string
}

export default function BasicDetailsForm({
  type,
  formData,
  currentStep,
  totalSteps,
  onSubmit,
  onPrevClick,
}) {
  const schema = yup.object(BasicDetailsSchema).required()
  const {
    setValue,
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm({
    mode: 'all',
    resolver: yupResolver(schema),
  })

  useEffect(() => {
    updateUserInput(formData, BasicDetailsSchema, setValue)
  }, [])

  function serializeValues(values) {
    onSubmit({ step: currentStep, data: values })
  }

  return (
    <form
      onSubmit={handleSubmit(serializeValues)}
      data-testid="basic-details-form"
    >
      <FormHeader
        type={type}
        currentStep={currentStep}
        totalSteps={totalSteps}
        title="Let's get started"
      />
      <div className="mt-16 space-y-10 md:space-y-12">
        <Controller
          name="name"
          control={control}
          defaultValue=""
          render={({ field }) => (
            <FormField
              title={
                type === MUTISIG_FORM
                  ? 'What is the name of your wallet?'
                  : 'What is the name of your DAO?'
              }
              description="It's best to choose a descriptive, memorable name for you and your members."
            >
              <Input
                placeholder="e.g. RealmsDAO"
                data-testid="dao-name-input"
                error={errors.name?.message || ''}
                {...field}
              />
            </FormField>
          )}
        />
        {/* <Controller
          name="description"
          defaultValue=""
          control={control}
          render={({ field }) => (
            <FormField
              title="How would you describe your DAO?"
              description="What's the best way to communicate the purpose of your DAO and why it's valuable to its members?"
              optional
            >
              <Input
                placeholder="e.g. My DAO is..."
                data-testid="dao-description-input"
                error={errors.description?.message || ''}
                {...field}
              />
            </FormField>
          )}
        /> */}
        <AdvancedOptionsDropdown>
          <Controller
            name="programId"
            defaultValue=""
            control={control}
            render={({ field }) => (
              <FormField
                title="My DAO's Program ID"
                description="When updating, ensure you transfer all assets to a new DAO using the new program. This cannot be changed."
                advancedOption
              >
                <Input
                  placeholder={`e.g. ${DEFAULT_GOVERNANCE_PROGRAM_ID}`}
                  data-testid="programId-input"
                  error={errors.programId?.message || ''}
                  {...field}
                />
              </FormField>
            )}
          />
        </AdvancedOptionsDropdown>
      </div>
      <FormFooter
        isValid={isValid}
        prevClickHandler={() => onPrevClick(currentStep)}
      />
    </form>
  )
}
