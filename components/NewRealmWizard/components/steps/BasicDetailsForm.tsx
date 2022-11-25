import { useEffect } from 'react'
import { useForm, Controller, useWatch } from 'react-hook-form'
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
import { useProgramVersionByIdQuery } from '@hooks/queries/useProgramVersionQuery'
import { PublicKey } from '@solana/web3.js'

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
  name: string
  programId?: string
}

export default function BasicDetailsForm({
  type,
  formData,
  currentStep,
  totalSteps,
  onSubmit,
  onPrevClick,
}: {
  // TODO type me
  type: any
  formData: BasicDetails
  currentStep: any
  totalSteps: any
  // eslint-disable-next-line @typescript-eslint/ban-types
  onSubmit: Function
  // eslint-disable-next-line @typescript-eslint/ban-types
  onPrevClick: Function
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

  const programIdInput = useWatch({ name: 'programId', control })
  const validProgramId =
    programIdInput && validateSolAddress(programIdInput)
      ? new PublicKey(programIdInput)
      : undefined
  const programVersionQuery = useProgramVersionByIdQuery(validProgramId)

  useEffect(() => {
    updateUserInput(formData, BasicDetailsSchema, setValue)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- TODO please fix, it can cause difficult bugs. You might wanna check out https://bobbyhadz.com/blog/react-hooks-exhaustive-deps for info. -@asktree
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
        title="Let's get started."
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
                placeholder={
                  type === MUTISIG_FORM
                    ? 'e.g. Realms wallet'
                    : 'e.g. Realms DAO'
                }
                data-testid="dao-name-input"
                error={errors.name?.message || ''}
                {...field}
              />
            </FormField>
          )}
        />
        <AdvancedOptionsDropdown>
          <Controller
            name="programId"
            defaultValue=""
            control={control}
            render={({ field }) => (
              <FormField
                title="Custom Program ID"
                description="Provide the program ID of your own instance of spl-governance you want to use for the organisation. This cannot be changed after the organisation is created."
                advancedOption
              >
                <Input
                  placeholder={`e.g. ${DEFAULT_GOVERNANCE_PROGRAM_ID}`}
                  data-testid="programId-input"
                  error={errors.programId?.message || ''}
                  autoComplete="on"
                  success={
                    !programVersionQuery.isLoading &&
                    programVersionQuery.data !== 1
                      ? `Program version ${programVersionQuery.data}`
                      : undefined
                  }
                  warning={
                    !programVersionQuery.isLoading &&
                    programVersionQuery.data === 1
                      ? 'Program version could not be verified'
                      : programVersionQuery.isFetching
                      ? 'Fetching program version...'
                      : undefined
                  }
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
